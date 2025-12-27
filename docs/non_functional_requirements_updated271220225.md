# Non-Functional Requirements

## 1. Security
- **NFR-SEC-001:** Passwords shall be hashed using `bcryptjs` before storage in the database.
- **NFR-SEC-002:** Authentication shall be managed using JSON Web Tokens (JWT).
- **NFR-SEC-003:** API endpoints shall be protected by middleware to ensure only authorized users (based on role) can access sensitive operations.
- **NFR-SEC-004:** The system shall use environment variables to store sensitive configuration data (DB URI, JWT Secret, Payment Keys).

## 2. Performance & Scalability
- **NFR-PER-001:** The database shall use indexing on frequently queried fields (e.g., email, event dates) to optimize retrieval times.
- **NFR-PER-002:** File uploads (images) shall be handled asynchronously and restricted in size (max 2MB) to prevent server overload.
- **NFR-PER-003:** The application shall implement a separation of concerns between Client (Frontend) and Server (Backend) to allow independent scaling.

## 3. Technology Stack
- **NFR-TEC-001:** The Backend shall be built using Node.js and Express.js.
- **NFR-TEC-002:** The Database shall be MongoDB, utilized via Mongoose ODM.
- **NFR-TEC-003:** The Frontend shall be built using React.js (Vite).
- **NFR-TEC-004:** Payment processing shall be integrated using the Paystack SDK.
- **NFR-TEC-005:** Email notifications shall be delivered using Nodemailer.

## 4. Usability & Interface
- **NFR-USA-001:** The user interface shall provide clear feedback for actions (e.g., success messages, error alerts).
- **NFR-USA-002:** The application shall be responsive and accessible on standard web browsers.
