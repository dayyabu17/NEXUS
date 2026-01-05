# Non-Functional Requirements

## 1. Introduction
This document defines the non-functional requirements for the Campus Event Management and Notification System, detailing technical constraints, quality attributes, and stack specifications.

## 2. Technical Stack
*   **Frontend Framework:** React (Vite)
*   **Styling:** Tailwind CSS
*   **State Management/Routing:** React Router DOM
*   **Maps/Location:** Leaflet, React-Leaflet
*   **Backend Runtime:** Node.js
*   **Web Framework:** Express.js
*   **Database:** MongoDB (via Mongoose ODM)
*   **Authentication:** JSON Web Tokens (JWT)
*   **Payment Gateway:** Paystack
*   **Email Service:** Nodemailer

## 3. Performance Requirements
*   **NFR-PERF-01:** The system shall support concurrent user requests for event browsing and ticket booking without significant latency.
*   **NFR-PERF-02:** Database queries for event listings shall be optimized using indexing to ensure fast retrieval times.
*   **NFR-PERF-03:** The frontend shall utilize code splitting and lazy loading where appropriate to minimize initial load time.

## 4. Security Requirements
*   **NFR-SEC-01:** All user passwords must be hashed using bcryptjs before storage.
*   **NFR-SEC-02:** API endpoints requiring authorization must be protected using JWT middleware.
*   **NFR-SEC-03:** File uploads must be validated on the server side to prevent execution of malicious scripts.
*   **NFR-SEC-04:** Cross-Origin Resource Sharing (CORS) must be configured to allow requests only from trusted domains (e.g., localhost during dev, production domain).
*   **NFR-SEC-05:** Sensitive environment variables (e.g., Payment Secret Keys, DB URI) must not be exposed to the client or committed to version control.

## 5. Reliability and Availability
*   **NFR-REL-01:** The system shall handle payment gateway failures gracefully, informing the user of the error without crashing.
*   **NFR-REL-02:** The application shall be deployable on cloud platforms (e.g., Vercel, Render) to ensure high availability.

## 6. Usability
*   **NFR-USA-01:** The user interface shall be responsive and accessible across desktop and mobile devices.
*   **NFR-USA-02:** Feedback messages (success/error) shall be clearly displayed to the user for all interactive actions (e.g., booking, login).
