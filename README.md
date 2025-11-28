# Nexus Campus Event Management System

## Project Overview
Nexus is a comprehensive campus event management system designed to streamline the organization, discovery, and attendance of university events. It provides distinct interfaces for Students (Guests), Organizers, and Administrators, facilitating a seamless experience for all stakeholders.

## Features
*   **User Roles:**
    *   **Guest/Student:** Explore events, view details, search/filter, and purchase tickets/RSVP.
    *   **Organizer:** Create and manage events, track analytics (RSVPs, revenue), and manage guest lists.
    *   **Admin:** Oversee the platform, approve/reject events, and manage users.
*   **Event Management:** Detailed event creation with location mapping, categorization, and image uploads.
*   **Ticketing & Payments:** Integration with **Paystack** for secure payments and ticket generation with QR codes.
*   **Interactive Maps:** Visual event discovery using Leaflet maps.
*   **Responsive Design:** Modern UI built with React and Tailwind CSS.

## Tech Stack
### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose ODM)
*   **Authentication:** JSON Web Tokens (JWT), bcryptjs
*   **File Upload:** Multer

### Frontend
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS, Framer Motion
*   **HTTP Client:** Axios
*   **Maps:** React Leaflet
*   **State Management:** React Hooks

## Setup Instructions

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Local or Atlas)
*   Paystack Account (for payments)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd nexus-campus-events
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

1.  **Backend Environment Variables:**
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/nexus_db
    JWT_SECRET=your_jwt_secret_key
    PAYSTACK_SECRET_KEY=your_paystack_secret_key
    FRONTEND_BASE_URL=http://localhost:5173
    ```

2.  **Frontend Environment Variables:**
    Create a `.env` file in the `client/` directory:
    ```env
    VITE_GEOCODING_API_KEY=your_geocoding_api_key
    VITE_DISTANCE_MATRIX_API_KEY=your_distance_matrix_api_key
    ```

### Running the Application

1.  **Seed the Database (Optional):**
    Populate the database with initial data (Admin, Organizer, Guest users, and sample events).
    ```bash
    # From the root directory
    node server/seed.js
    ```

2.  **Start the Backend Server:**
    ```bash
    cd server
    npm start
    # Server runs on http://localhost:5000
    ```

3.  **Start the Frontend Development Server:**
    ```bash
    cd client
    npm run dev
    # Client runs on http://localhost:5173
    ```

## Usage Guide

1.  **Admin Access:**
    *   Login with `admin@nexus.com` / `admin123` (from seed data).
    *   Navigate to the Admin Dashboard to approve pending events.

2.  **Organizer Access:**
    *   Login with `organizer@nexus.com` / `organizer123` (from seed data).
    *   Create new events and view your dashboard analytics.

3.  **Guest Access:**
    *   Login with `guest@nexus.com` / `guest123` (from seed data) or sign up.
    *   Browse events, view details, and book tickets.

## Documentation
Detailed system documentation can be found in the `docs/` folder:
*   [User Requirements](docs/user_requirements.md)
*   [System Architecture & Diagrams](docs/structural_diagrams.md)
*   [Database Design](docs/database_design.md)
*   [API Routes](server/routes/) (See source code documentation)

## License
[MIT License](LICENSE)
