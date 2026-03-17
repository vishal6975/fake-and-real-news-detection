import json
from flask import Flask, request

app = Flask(__name__)

# Define your existing Flask routes here
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Your ML prediction logic here
    result = {'prediction': 'fake'}  # Example prediction
    return json.dumps(result)

# Entry point for Vercel serverless function
if __name__ == '__main__':
    app.run()

# The following code is added for Vercel deployment
def handler(event, context):
    return app(event, context)