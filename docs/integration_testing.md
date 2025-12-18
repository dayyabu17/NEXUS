# Section 4.3.2: Integration Testing

Integration testing is a critical phase in the software testing lifecycle designed to verify the interactions between distinct software modules when they are combined. For the Nexus Campus Event Management System, this process was conducted to ensure that separate subsystems—specifically the Authentication Module, Database Layer, Payment Gateway, and Mapping Services—communicate effectively and data flows seamlessly across interface boundaries. The primary objective was to validate that the integration of these components functions according to the system requirements and to identify any discrepancies in the data exchange processes or API calls between the frontend, backend, and external services.

### Table 4.2: Integration Test Cases

| Test Case ID | Interacting Modules | Test Scenario | Expected Data Flow | Status |
| :--- | :--- | :--- | :--- | :--- |
| **IT-01** | Authentication + Database (MongoDB) | User Sign Up and Dashboard Redirection | 1. User submits registration form.<br>2. Backend processes request and persists user data in MongoDB.<br>3. Database confirms successful write operation.<br>4. System generates JWT and redirects User to the Dashboard. | **Passed** |
| **IT-02** | Event Module + Mapping Service (Leaflet) | Event Location Rendering | 1. Organizer enters event coordinates during creation.<br>2. Backend stores location data in the Event document.<br>3. Frontend retrieves Event Details including coordinates.<br>4. Leaflet API renders the map component with the correct marker at the specified location. | **Passed** |
| **IT-03** | Booking System + Payment Gateway (Paystack) | Paid Ticket Transaction Processing | 1. User initiates payment by clicking "Pay".<br>2. System interfaces with Paystack API to process the transaction.<br>3. Paystack returns a success response upon completion.<br>4. System updates the specific Ticket Status to 'Paid' in the database. | **Passed** |
| **IT-04** | Feedback Module + User Profile/Reporting | Feedback Submission and Reporting | 1. User submits feedback for an attended event.<br>2. Feedback data is linked to the specific Event ID and saved.<br>3. Organizer accesses the Event Report.<br>4. System queries and displays the linked feedback on the Organizer's interface. | **Passed** |
