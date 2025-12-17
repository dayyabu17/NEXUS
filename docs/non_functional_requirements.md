# Non-Functional Requirements

## Security
1. The system shall enforce role-based access control (RBAC) to restrict features to appropriate user roles (Admin, Organizer, Student).
2. The system shall use JWT (JSON Web Tokens) for secure authentication and session management.
3. Passwords shall be hashed using bcryptjs before storage in the database.
4. Payment transactions shall be processed securely through the Paystack integration, complying with relevant security standards.

## Performance
1. The system shall support fast loading times for the dashboard and event browsing pages.
2. The system shall optimize database queries to handle multiple concurrent users efficiently.
3. Frontend assets shall be optimized (e.g., using Vite's build process) to minimize load times.

## Usability
1. The user interface shall be intuitive and easy to navigate for all user types.
2. The system shall provide clear feedback for user actions (e.g., success messages, error notifications).
3. The design shall be responsive, ensuring usability on desktops, tablets, and mobile devices.

## Reliability
1. The system shall aim for high availability to ensure users can access events and tickets at any time.
2. The system shall handle errors gracefully, providing meaningful error messages to the user without exposing sensitive system details.

## Compatibility
1. The web application shall be compatible with modern web browsers (Chrome, Firefox, Safari, Edge).
2. The application shall function correctly on various screen sizes and resolutions.

## Tech Stack Constraints
1. **Frontend:** React, Vite, Tailwind CSS.
2. **Backend:** Node.js, Express.js.
3. **Database:** MongoDB with Mongoose.
4. **Authentication:** JWT, bcryptjs.
5. **External APIs:** Paystack (Payments), Distance Matrix AI / Leaflet (Maps).
