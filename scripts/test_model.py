import tensorflow as tf

model = tf.keras.models.load_model("Brain.keras")

print("Model Loaded Successfully!")
print(model.summary())
