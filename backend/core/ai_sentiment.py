from typing import Literal

_model = None
_tokenizer = None

async def _load_model():
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        _tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        _model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")
    except Exception:
        _model, _tokenizer = None, None
    return _model, _tokenizer

async def analyze_sentiment(text: str) -> Literal["Positive", "Neutral", "Negative"]:
    model, tokenizer = await _load_model()
    if model is None or tokenizer is None:
        lower = text.lower()
        if any(w in lower for w in ["good", "great", "awesome", "love", "nice"]):
            return "Positive"
        if any(w in lower for w in ["bad", "terrible", "hate", "poor", "awful"]):
            return "Negative"
        return "Neutral"
    import torch
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)
    with torch.no_grad():
        logits = model(**inputs).logits
    idx = int(logits.softmax(dim=-1).argmax().item())
    return ["Negative", "Neutral", "Positive"][idx]
