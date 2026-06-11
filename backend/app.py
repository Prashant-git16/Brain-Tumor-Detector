from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
import numpy as np
import cv2
import io
import os
import base64

from PIL import Image
from tensorflow.keras.models import Model
from tensorflow.keras.applications.efficientnet import preprocess_input

# ====================================================
# Flask Setup
# ====================================================

app = Flask(__name__)
CORS(app)

# ====================================================
# Config
# ====================================================

CLASSES = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary"
]

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "model",
    "Brain.keras"
)

IMG_SIZE = (224, 224)

# ====================================================
# Load Model
# ====================================================

print("Loading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")

# ====================================================
# Find Last Conv Layer Automatically
# ====================================================

LAST_CONV_LAYER = None

for layer in reversed(model.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        LAST_CONV_LAYER = layer.name
        break

print("Grad-CAM Layer:", LAST_CONV_LAYER)

# ====================================================
# Health Check
# ====================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model": "Brain.keras"
    })

# ====================================================
# Grad-CAM Functions
# ====================================================

def generate_heatmap(img_array):

    grad_model = Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer(LAST_CONV_LAYER).output,
            model.output
        ]
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(img_array)

        predicted_class = tf.argmax(predictions[0])

        loss = predictions[:, predicted_class]

    grads = tape.gradient(loss, conv_outputs)

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(0, 1, 2)
    )

    conv_outputs = conv_outputs[0]

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]

    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0)

    heatmap /= (
        tf.reduce_max(heatmap) + 1e-8
    )

    return heatmap.numpy()


def create_gradcam_overlay(original_img, heatmap):

    heatmap = cv2.resize(
        heatmap,
        IMG_SIZE
    )

    heatmap = np.uint8(255 * heatmap)

    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    original = np.array(original_img)

    overlay = cv2.addWeighted(
        original,
        0.6,
        heatmap,
        0.4,
        0
    )

    _, buffer = cv2.imencode(
        ".png",
        cv2.cvtColor(
            overlay,
            cv2.COLOR_RGB2BGR
        )
    )

    return base64.b64encode(
        buffer
    ).decode("utf-8")

# ====================================================
# Prediction Endpoint
# ====================================================

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected"
        }), 400

    try:

        img_bytes = file.read()

        pil_img = Image.open(
            io.BytesIO(img_bytes)
        ).convert("RGB")

        pil_img = pil_img.resize(
            IMG_SIZE
        )

        arr = np.array(
            pil_img,
            dtype=np.float32
        )

        arr = np.expand_dims(
            arr,
            axis=0
        )

        arr = preprocess_input(arr)

        predictions = model.predict(
            arr,
            verbose=0
        )[0]

        pred_idx = int(
            np.argmax(predictions)
        )

        confidence = float(
            np.max(predictions)
        )

        # ==========================
        # Grad-CAM
        # ==========================

        heatmap = generate_heatmap(arr)

        gradcam_image = create_gradcam_overlay(
            pil_img,
            heatmap
        )

        # ==========================
        # Response
        # ==========================

        return jsonify({

            "predicted_class":
                CLASSES[pred_idx],

            "confidence":
                round(confidence * 100, 2),

            "probabilities": {
                cls: round(
                    float(prob) * 100,
                    2
                )
                for cls, prob in zip(
                    CLASSES,
                    predictions
                )
            },

            "gradcam":
                gradcam_image

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
# ====================================================
# Main
# ====================================================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )