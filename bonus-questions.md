BioCatch Integration Challenge: Bonus Questions
This document provides detailed answers to the bonus questions from "The Fast and Furious Integration Challenge," with explanations grounded in modern web development best practices.

1. Single-Page Applications (SPAs)
Question: How would you implement our JS functions (e.g., changeContext or setCustomerSessionId) when there is no true reloading of the DOM but just dynamic changes of views?

Answer:

In a Single-Page Application (SPA) built with a framework like React, Angular, or Vue.js, the page doesn't do a full reload. To handle BioCatch functions correctly, you must tie them to the application's routing and state management lifecycle.

changeContext(contextName): This function should be called whenever the user navigates to a new "view" or "page" within the SPA. The best practice is to hook into the router's lifecycle.

React: Use the useEffect hook with the location/route as a dependency. When the route changes, the effect runs and calls cdApi.changeContext().

Angular: Create a service that subscribes to Router events (specifically NavigationEnd) and calls cdApi.changeContext() with the new route's information.

setCustomerSessionId(csid): This function should be called once upon a successful login. The generated csid must then be stored in a way that persists across view changes but is cleared when the user logs out or closes the tab.

sessionStorage: This is a simple and effective method. The CSID is stored in the browser's session storage and can be retrieved by any component. It's automatically cleared when the tab is closed.

State Management (Redux/Zustand/Context API): For more complex applications, the CSID can be stored in a global state management store. This makes it easily accessible to any component that needs it.

2. Content Security Policies (CSPs)
Question: Based on what you’ve learned about our JS so far, write a CSP set (directives) that would allow the BioCatch JS to work in a Chrome browser.

Answer:

A Content Security Policy (CSP) is a crucial security layer. Based on the provided solution (biocatch.js loading an external script and app.py acting as a proxy), a robust CSP would need the following directives:

script-src: Must allow scripts from 'self' (your own domain) and from the BioCatch CDN (https://bcdn-4ff4f23f.we-stats.com).

connect-src: This is for API calls. It must allow connections to 'self' (for your backend proxy) and the BioCatch WUP servers (https://wup-4ff4f23f.eu.v2-we-stats.com). Note: The Zapier URL is NOT needed here because the browser only ever talks to your proxy.

worker-src: The BioCatch SDK often uses web workers for background processing. Allowing 'self' and blob: is a safe way to permit these without opening up security holes.

Example CSP Header:

Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' [https://bcdn-4ff4f23f.we-stats.com](https://bcdn-4ff4f23f.we-stats.com); 
  connect-src 'self' [https://wup-4ff4f23f.eu.v2-we-stats.com](https://wup-4ff4f23f.eu.v2-we-stats.com); 
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';

3. Loading JS from Different Domain Names
Question: What problems can arise when loading a JS from a different domain name than the bank’s website? How could this be remedied?

Answer:

Loading a third-party script introduces significant risks and challenges:

Security Risk (Supply Chain Attack): If the third-party domain is compromised, an attacker could replace the legitimate script with malicious code. This code would then run with the full permissions of your website, potentially stealing user data, credentials, or session information.

Availability and Performance: If the third-party's servers are slow or go down, your website's loading could be blocked or significantly delayed, creating a poor user experience and a single point of failure.

Cross-Origin Resource Sharing (CORS) Issues: While the script itself can be loaded, any fetch or XHR requests it makes to other domains (including your own backend) will be blocked by the browser's Same-Origin Policy unless correctly configured.

Remedies:

Subresource Integrity (SRI): This is the primary defense against script modification. You add an integrity attribute to your <script> tag containing a cryptographic hash of the expected file. The browser will download the script, hash it, and only execute it if the hashes match.

<script src="[https://third-party.com/script.js](https://third-party.com/script.js)"
        integrity="sha384-Abc123...XYZ"
        crossorigin="anonymous"></script>

Proxy Server: To solve CORS issues and gain more control, use a backend proxy (as demonstrated in the Flask app.py). Your frontend talks only to your backend, which then securely communicates with the third-party API.

4. iFrames from a Different Domain
Question: If the iFrame is from a different domain, we cannot collect data within the iFrame if the JS is only on the parent page. What architecture would you propose?

Answer:

Browser security prevents a parent page from accessing the content of a cross-origin iFrame. The standard and correct architecture to solve this involves two key components:

Dual Integration: The BioCatch JavaScript agent must be included on both the parent page and the page being served inside the iFrame.

Secure Communication with postMessage: The two instances of the script must communicate using the window.postMessage() API.

The script inside the iFrame will capture behavioral data within its own context.

It will then package this data and use postMessage to send it securely to the parent window.

The script on the parent page will have an event listener for message events. When it receives data from the iFrame, it will aggregate it with the data collected from the main page before sending it to BioCatch's servers.

This architecture respects browser security boundaries while allowing for complete data collection across different domains.

5. Backend vs. Frontend API Requests
Question: In a production bank application, where do we want to trigger the API request, from the backend or from the frontend?

Answer:

In a production application, especially for a bank, the Scoring API requests (init, getScore) must always be triggered from the backend.

The solution provided (using a Flask proxy) correctly demonstrates this principle.

Reasoning:

Security: This is the most critical reason. Frontend JavaScript is public and can be inspected by anyone. Placing API calls there would expose sensitive information like API keys, authentication tokens, or the direct endpoint URL. A malicious user could easily steal these and make unauthorized API calls.

Data Integrity: The backend is the single source of truth. If a transaction amount is part of the API call, sending it from the frontend means a user could manipulate the amount in their browser before the request is sent. The backend must validate all data and make the API call with authoritative, trusted information.

Control and Business Logic: The decision-making process based on the BioCatch score (e.g., "if score > 800, then block transaction") is sensitive business logic. This logic must reside on the server, where it cannot be seen or bypassed by a user.

Reliability and Logging: Server-to-server communication is typically more reliable than a client's internet connection. The backend can also implement robust logging, monitoring, and retry mechanisms that are not possible on the frontend.
