import sys
import json
import os
import numpy as np

# Force legacy Keras 2 behavior BEFORE any import
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Absolute model path
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'Trained_model.h5')

if not os.path.exists(model_path):
    print(json.dumps({"error": f"Model not found: {model_path}"}))
    sys.exit(1)

classifier = load_model(model_path, compile=False)

labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def predictor(image_path):
    try:
        test_image = image.load_img(image_path, target_size=(64, 64))
        test_image = image.img_to_array(test_image)
        test_image = np.expand_dims(test_image, axis=0)
        test_image = test_image / 255.0

        result = classifier.predict(test_image, verbose=0)
        class_idx = np.argmax(result[0])
        confidence = float(result[0][class_idx]) * 100

        letter = labels[class_idx]

        feedback = f"✅ Great! Detected letter <strong>{letter}</strong> with {confidence:.1f}% confidence." if confidence > 65 \
                   else f"Detected <strong>{letter}</strong> ({confidence:.1f}%). Try making the sign clearer."

        return {
            "letter": letter,
            "confidence": round(confidence, 1),
            "feedback": feedback
        }

    except Exception as e:
        return {"letter": "?", "confidence": 0, "feedback": f"Prediction error: {str(e)}"}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image not found: {image_path}"}))
        sys.exit(1)

    result = predictor(image_path)
    print(json.dumps(result))