import os
import numpy as np
from typing import List

_model = None

async def _load_model():
    global _model
    if _model is not None:
        return _model
    # Lazy import to avoid heavy startup
    try:
        import xgboost as xgb
        import pickle
        model_path = os.path.join(os.path.dirname(__file__), "..", "ai", "wait_model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                _model = pickle.load(f)
        else:
            _model = None
    except Exception:
        _model = None
    return _model

async def predict_wait_time(features: List[float]) -> float:
    model = await _load_model()
    if model is None:
        # Simple baseline: queue_length * avg_service_time
        q, avg, _, _ = features
        return float(max(0.0, q) * max(1.0, avg))
    import numpy as np  # safeguarded
    arr = np.array([features])
    pred = float(model.predict(arr)[0])
    return max(0.0, pred)
