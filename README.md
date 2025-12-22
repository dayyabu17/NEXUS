# Nexus Campus Event Management System

## Project Purpose

Nexus is a comprehensive campus event management system designed to bridge the gap between students, event organizers, and university administration. It provides a centralized platform for discovering, organizing, and managing events within a university ecosystem.

The system aims to:
- **Simplify Event Discovery:** Enable students to easily find events that match their interests.
- **Streamline Organization:** Provide organizers with tools to create, manage, and track event performance.
- **Ensure Quality Control:** Empower administrators to oversee event approval and user management.
- **Facilitate Ticketing:** Offer a secure and integrated payment solution for paid events and simple RSVP for free ones.

## Server Setup

Follow these steps to set up and run the backend server.

### 1. Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or Atlas URI)

### 2. Installation
Navigate to the `server` directory and install the required dependencies:

```bash
cd server
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory. This file must contain the following configuration variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb://localhost:27017/nexus_db

# Security
JWT_SECRET=your_jwt_secret_key_here

# Payment Gateway (Paystack)
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
FRONTEND_BASE_URL=http://localhost:5173

# Email Service (Nodemailer - Gmail Example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=noreply@nexus.com
EMAIL_FROM_NAME=Nexus Events
```

### 4. Database Seeding (Optional)
To populate the database with initial dummy data (including a default Admin, Organizer, and Events), run:

```bash
node seed.js
```

### 5. Start the Server
To run the server in development mode (with auto-reload):

```bash
npm run dev
```

To run the server in production mode:

```bash
npm start
```

The server will typically run on `http://localhost:5173` if configured as such, or port `5000` by default.

## API Usage

The Nexus backend provides a RESTful API organized into several resource groups. Below is a high-level overview of the main routes.

### Auth (`/api/auth`)
- `POST /login`: Authenticate a user and receive a JWT.
- `POST /register`: Register a new Student or Organizer account.
- `GET /profile`: Retrieve the authenticated user's profile.

### Events (`/api/events`)
- `GET /`: Retrieve a list of approved public events.
- `GET /:id`: Get details for a specific public event.
- `GET /dashboard`: Get personalized dashboard data (Hero, Recommended, Recent events).
- `POST /:id/feedback`: Submit feedback for an attended event.

### Organizer (`/api/organizer`)
- `GET /dashboard`: Get organizer-specific stats and upcoming events.
- `POST /events`: Create a new event (starts as 'pending').
- `GET /events/:id/guests`: View the guest list for an event.
- `PATCH /events/:eventId/guests/:ticketId/check-in`: Check in a guest.

### Admin (`/api/admin`)
- `GET /stats`: Get system-wide statistics.
- `GET /events/pending`: View events waiting for approval.
- `PUT /events/:id/status`: Approve or Reject an event.
- `PUT /users/:id/role`: Update a user's role.

### Tickets (`/api/tickets`)
- `GET /my-tickets`: List all tickets owned by the current user.
- `GET /status/:eventId`: Check if the user has a ticket for a specific event.

### Payment (`/api/payment`)
- `POST /rsvp/initialize`: Initialize a payment (Paystack) or confirm a free RSVP.
- `GET /rsvp/verify`: Verify a successful payment callback.

## Documentation

For more detailed information about the system architecture and requirements, please refer to the `docs/` directory.
