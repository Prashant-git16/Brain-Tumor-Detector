import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input  # ADD THIS

CLASSES = ['glioma', 'meningioma', 'notumor', 'pituitary']

model = tf.keras.models.load_model("Brain.keras")

image_path = "pras.jpg"

# Load & preprocess — must match training exactly
img       = Image.open(image_path).convert("RGB")
img       = img.resize((224, 224))
img_array = np.array(img, dtype=np.float32)
img_array = np.expand_dims(img_array, axis=0)
img_array = preprocess_input(img_array)          # ✅ replaces /255.0

prediction    = model.predict(img_array)[0]
predicted_cls = CLASSES[np.argmax(prediction)]
confidence    = np.max(prediction) * 100

for cls, prob in zip(CLASSES, prediction):
    print(f"{cls:12s}: {prob*100:.2f}%")

print(f"\nPrediction : {predicted_cls}")
print(f"Confidence : {confidence:.2f}%")