import pandas as pd
import pickle
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

print("Loading dataset...")
df = pd.read_csv("news.csv")
print(df['label'].value_counts())

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['title']   = df['title'].fillna('')
df['text']    = df['text'].fillna('')
df['content'] = df['title'] + ' ' + df['text']
df['content'] = df['content'].apply(clean_text)
df['label_enc'] = (df['label'] == 'REAL').astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    df['content'], df['label_enc'],
    test_size=0.20, random_state=42, stratify=df['label_enc']
)
print(f"Train: {len(X_train)}  |  Test: {len(X_test)}")

tfidf = TfidfVectorizer(max_features=50000, ngram_range=(1, 2), sublinear_tf=True, min_df=2)
X_train_vec = tfidf.fit_transform(X_train)
X_test_vec  = tfidf.transform(X_test)

model = LogisticRegression(max_iter=1000, C=5.0, solver='lbfgs')
model.fit(X_train_vec, y_train)

y_pred = model.predict(X_test_vec)
print(f"\nAccuracy: {accuracy_score(y_test, y_pred)*100:.2f}%")
print(classification_report(y_test, y_pred, target_names=['FAKE', 'REAL']))

with open("model.pkl", "wb") as f: pickle.dump(model, f)
with open("tfidf.pkl", "wb") as f: pickle.dump(tfidf, f)
print("Done! model.pkl and tfidf.pkl saved. Now run: python app.py")