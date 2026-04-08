import sys
import json
import cv2
import numpy as np
import os
from keras.models import load_model

# Load model
model_path = os.path.join(os.path.dirname(__file__), 'Trained_model.h5')
if not os.path.exists(model_path):
    print(json.dumps({"error": f"Model not found: {model_path}"}))
    sys.exit(1)

model = load_model(model_path, compile=False)

labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

def predict_sign(image_path):
    try:
        abs_path = os.path.abspath(image_path)
        if not os.path.exists(abs_path):
            return {"letter": "?", "confidence": 0, "feedback": f"Image file not found: {abs_path}"}

        frame = cv2.imread(abs_path)
        if frame is None:
            return {"letter": "?", "confidence": 0, "feedback": "Could not read the image file."}

        # === Skin detection ===
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)

        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        mask = cv2.GaussianBlur(mask, (5, 5), 0)
        mask = cv2.dilate(mask, None, iterations=2)

        # ✅ FIXED: properly inside function
        contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Webcam case
            max_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(max_contour)
            hand_roi = frame[y:y+h, x:x+w]
        else:
            # Dataset fallback
            hand_roi = frame

        # Safety check
        if hand_roi.size == 0:
            hand_roi = frame

        # Resize
        hand_roi = cv2.resize(hand_roi, (64, 64))
        hand_roi = np.expand_dims(hand_roi, axis=0)
        hand_roi = hand_roi / 255.0

        # Predict
        pred = model.predict(hand_roi, verbose=0)
        class_idx = np.argmax(pred[0])
        confidence = float(pred[0][class_idx]) * 100

        letter = labels[class_idx]

        feedback = (
            f"✅ Excellent! That's the letter <strong>{letter}</strong> ({confidence:.1f}% confidence)."
            if confidence > 65 else
            f"Detected <strong>{letter}</strong> with {confidence:.1f}% confidence. Try making the sign clearer."
        )

        return {
            "letter": letter,
            "confidence": round(confidence, 1),
            "feedback": feedback
        }

    except Exception as e:
        return {"letter": "?", "confidence": 0, "feedback": f"Error during prediction: {str(e)}"}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    result = predict_sign(sys.argv[1])
    print(json.dumps(result))