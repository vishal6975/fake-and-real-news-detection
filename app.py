from flask import Flask, render_template, request, jsonify
import pickle, re, os

app = Flask(__name__)

with open("model.pkl", "rb") as f: model = pickle.load(f)
with open("tfidf.pkl", "rb") as f: tfidf = pickle.load(f)

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data  = request.get_json()
    title = data.get("title", "").strip()
    text  = data.get("text",  "").strip()
    if not title and not text:
        return jsonify({"error": "Please provide a title or article text."}), 400
    combined = clean_text(title + " " + text)
    vec      = tfidf.transform([combined])
    label_enc  = model.predict(vec)[0]
    proba      = model.predict_proba(vec)[0]
    confidence = round(float(proba[label_enc]) * 100, 1)
    label      = "REAL" if label_enc == 1 else "FAKE"
    return jsonify({
        "label": label, "confidence": confidence,
        "prob_fake": round(float(proba[0]) * 100, 1),
        "prob_real": round(float(proba[1]) * 100, 1),
    })

if __name__ == "__main__":
    app.run(debug=True)
