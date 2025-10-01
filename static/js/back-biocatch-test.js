console.log("BioCatch script loader initiated");

// Dynamically load the actual BioCatch script from their CDN
const script = document.createElement('script');
script.src = 'https://bcdn-4ff4f23f.we-stats.com/scripts/4ff4f23f/4ff4f23f.js';
script.onload = () => console.log("Official BioCatch script loaded and ready.");
script.onerror = () => console.error("Failed to load BioCatch script");
document.head.appendChild(script);

let username = '';

/**
 * Initializes the BioCatch session. This is a smart function that waits for the
 * cdApi object to be available before trying to use it.
 * @param {string} context - The context name (ex: "login_screen").
 */
function session(context) {
    return new Promise((resolve) => {
        const waitForCdApi = () => {
            if (typeof cdApi !== 'undefined' && typeof cdApi.changeContext === 'function') {
                console.log("cdApi is ready. Initializing session for context:", context);
                cdApi.setCustomerSessionId('286a14d0-6ddd-4d9b-8586-ddc5e4156d21'); // Hardcoded for the test
                cdApi.changeContext(context);
                resolve();
            } else {
                console.log("Waiting for cdApi to become available...");
                setTimeout(waitForCdApi, 500); // Check again in 0.5 seconds
            }
        };
        waitForCdApi();
    });
}

/**
 * Handles the login form submission.
 */
async function login(event) {
    event.preventDefault();
    username = document.getElementById('username').value;
    localStorage.setItem('username', username); // Save username for later use

    await session('login_screen');
    await triggerAPI('init', 'LOGIN');

    console.log("Login successful, redirecting...");
    window.location.href = '/account_overview';
}

/**
 * Handles the make payment action.
 */
async function makePayment(event) {
    event.preventDefault();
    username = localStorage.getItem('username'); // Get username from storage

    await session('make_payment');
    await triggerAPI('getScore', 'MAKE_PAYMENT');

    alert('Payment submitted!');
}

/**
 * Handles logout.
 */
function logout() {
    if (typeof cdApi !== 'undefined') {
        cdApi.setCustomerSessionId("3e9cde86-0458-4e9d-949f-3aba6fde154a"); // End the session setting a new csID
        console.log("Session ended. Logging out.");
    }
    localStorage.removeItem('username');
    window.location.href = '/';
}

/**
 * Sends the API request to our Flask backend proxy.
 * @param {string} action - 'init' or 'getScore'.
 * @param {string} activityType - 'LOGIN' or 'MAKE_PAYMENT'.
 */
async function triggerAPI(action, activityType) {
    const payload = {
        "customerId": "dummy",
        "action": action,
        "customerSessionId": "286a14d0-6ddd-4d9b-8586-ddc5e4156d21", // Must match the one in initializeSession
        "activityType": activityType,
        "uuid": "user_" + Math.random().toString(16).slice(2),
        "brand": "SD",
        "solution": "ATO",
        "iam": "bernardogvg1@gmail.com"
    };

    console.log("Sending payload to our backend proxy:", payload);

    try {
        //The request goes to our own server, not Zapier.
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log("Received response from proxy:", data);
        return data;
    } catch (error) {
        console.error("Error sending request to proxy:", error);
        throw error;
    }
}