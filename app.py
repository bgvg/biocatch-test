from flask import Flask, render_template, request, jsonify
import requests
import logging

# Initialize the Flask application
app = Flask(__name__)

# Configure logging to display informational messages
logging.basicConfig(level=logging.INFO)

# Define route for the home page (serves index.html)
@app.route('/')
def index():
    return render_template('index.html')

# Define route for the account overview page
@app.route('/account_overview')
def account_overview():
    return render_template('account_overview.html')

# Define route for the make_payment page
@app.route('/make_payment')
def make_payment():
    return render_template('make_payment.html')

# Define a proxy route to handle API requests
@app.route('/api/proxy', methods=['POST'])
def proxy():
    data = request.json  # Get the JSON payload from the frontend
    url = "https://hooks.zapier.com/hooks/catch/1888053/bgwofce/"  # The final destination

    app.logger.info(f"Forwarding payload to Zapier: {data}")

    try:
        # Forward the request to the Zapier endpoint
        response = requests.post(url, json=data)
        response.raise_for_status()  # Raise an error for bad responses (like 404 or 500)
        
        # Log the response from Zapier
        response_data = response.json()
        app.logger.info(f"Received response from Zapier: {response_data}")
        
        return jsonify(response_data)  # Return the API response to the frontend
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error forwarding request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)