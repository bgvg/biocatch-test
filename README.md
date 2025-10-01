BioCatch Integration Challenge: Flask Implementation
This project demonstrates the "Fast and Furious Integration Challenge," showcasing a robust and secure integration of the BioCatch behavioral biometrics solution into a sample web application.

The application is built with a Python Flask backend and a simple vanilla JavaScript frontend, simulating a typical online banking user journey: Login -> Account Overview -> Make Payment.

Core Concepts & Architecture
This solution correctly implements the two key components required by the BioCatch integration challenge:

Client-Side Data Collection: The BioCatch JavaScript agent is dynamically loaded on all pages. It runs in the background, collecting behavioral data (WUPs) and sending it to BioCatch servers without any further action needed.

Scoring API Calls: The critical init and getScore API calls are handled via a secure backend proxy. This is a best practice that prevents exposing sensitive endpoints or credentials on the frontend.

The architecture follows this secure flow:

Client (Browser) ↔ Your Flask Server (Proxy) ↔ BioCatch Scoring API (Zapier)

Project Structure
biocatch-integration/
│
├── static/
│   └── js/
│       └── front-biocatch-test.js       # Frontend logic, BioCatch SDK interaction.
│
├── templates/
│   ├── index.html            # Login page.
│   ├── account_overview.html # Dashboard page after login.
│   └── make_payment.html     # Payment simulation page.
│
├── app.py                    # The Flask web server and API proxy.
├── requirements.txt          # Project dependencies.
└── README.md                 # This file.

Setup and Installation
Prerequisites
Python 3.6+

pip (Python package installer)

Step 1: Create and Activate a Virtual Environment
It is highly recommended to use a virtual environment to manage project dependencies.

# Create the virtual environment folder
python -m venv venv

# Activate it (on Windows)
venv\Scripts\activate

# Activate it (on macOS/Linux)
source venv/bin/activate

Step 2: Install Dependencies
Install Flask and the Requests library.

pip install -r requirements.txt

Step 3: Run the Application
Start the Flask development server.

flask run

The application will be running at http://127.0.0.1:5000/.

How to Use and Verify the Integration
Open Developer Tools: Open your browser and navigate to http://127.0.0.1:5000/. Open the Developer Tools (F12 or Ctrl+Shift+I) and go to the Network tab.

Verify Data Collection (WUPs):

In the Network tab's filter box, type wup.

Move your mouse around the page. You will see requests being sent every few seconds to wup-4ff4f23f.eu.v2.we-stats.com. This confirms the BioCatch agent is actively collecting behavioral data.

Verify init API Call:

Clear the filter in the Network tab.

Enter any text for username/password and click Login.

In the browser: You will see a new request to /api/proxy. This is your frontend talking to your backend.

In your terminal: The Flask server will log Forwarding payload to Zapier: {...} with action: "init". This confirms the proxy is working.

Verify getScore API Call:

After logging in, click the Make Payment button, and on the next page, click Submit Payment.

In the browser: You will see another request to /api/proxy.

In your terminal: The Flask server will log a new payload with action: "getScore".

Technical Deep Dive
app.py (The Flask Backend)
Web Server: Uses the @app.route() decorator to define URL paths (/, /account_overview, etc.) and serves the corresponding HTML files from the templates directory.

Secure API Proxy: The /api/proxy route is the most important part. It accepts JSON data from the frontend, securely forwards it to the real BioCatch API endpoint using the requests library, and then relays the response back to the client. This is the correct implementation for a production environment as it hides the final API endpoint and prevents CORS issues.

front-biocatch-test (The Frontend)
SDK Loader: Dynamically loads the official BioCatch JavaScript agent from the CDN specified in the documentation.

Session Management: The initializeSession function waits for the cdApi object to be ready and then calls cdApi.changeContext() and cdApi.setCustomerSessionId() to manage the user's session state as they navigate the site.

API Trigger: The triggerAPI function sends fetch requests containing the required payloads to the local Flask /api/proxy endpoint, abstracting away the final destination from the client-side code.

Bonus Questions
The answers to the bonus questions are detailed in the Assessment Bonus Questions.md file. This project's architecture directly implements the best practice outlined in Question 5, demonstrating why API calls should be handled by a secure backend.
