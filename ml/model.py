#!/usr/bin/env python3
"""
ml/model.py
===========
Sign Language letter predictor.
Loads  Trained_model.h5  from the same directory (or ML_MODEL_PATH env var).

Usage (called by PHP):
    python model.py /path/to/image.jpg

Output (stdout, JSON):
    {"letter": "A", "confidence": 0.97, "all_probs": {...}}

Exit code 0 = success, 1 = error (JSON on stderr).
"""

import sys
import os
import json

# ── Silence TensorFlow logs ──────────────────────────────────
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import numpy as np

def load_model():
    """Load the Keras model once (cached via module-level var)."""
    import tensorflow as tf
    model_path = os.environ.get(
        'ML_MODEL_PATH',
        os.path.join(os.path.dirname(__file__), 'Trained_model.h5')
    )
    if not os.path.exists(model_path):
        raise FileNotFoundError(f'Model not found at: {model_path}')
    return tf.keras.models.load_model(model_path)

# ASL alphabet labels – must match training order in the repo
# (A-Z, 26 classes; adjust if your model uses a different order)
LABELS = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

# ── Image size expected by the model (64×64 from the repo) ───
IMG_SIZE = (64, 64)

def preprocess(image_path: str) -> np.ndarray:
    """Load, resize, normalise image → (1, H, W, C) array."""
    from PIL import Image
    img = Image.open(image_path).convert('RGB')
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0   # normalise 0-1
    return np.expand_dims(arr, axis=0)               # add batch dim

def predict(image_path: str) -> dict:
    model  = load_model()
    arr    = preprocess(image_path)
    probs  = model.predict(arr, verbose=0)[0]        # shape (26,)

    top_idx  = int(np.argmax(probs))
    letter   = LABELS[top_idx]
    confidence = float(probs[top_idx])

    # Top-3 alternatives (useful for richer feedback)
    top3 = sorted(
        [(LABELS[i], float(probs[i])) for i in range(len(LABELS))],
        key=lambda x: x[1], reverse=True
    )[:3]

    return {
        'letter':     letter,
        'confidence': round(confidence, 4),
        'top3':       [{'letter': l, 'prob': round(p, 4)} for l, p in top3],
    }

# ── Entry point ───────────────────────────────────────────────
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python model.py <image_path>'}), file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({'error': f'Image not found: {image_path}'}), file=sys.stderr)
        sys.exit(1)

    try:
        result = predict(image_path)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
