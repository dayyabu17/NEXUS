# Nexus Campus Event Management System

## Project Overview

Nexus is a comprehensive web-based platform designed to streamline the management of campus events. It connects students, event organizers, and administrators, facilitating event discovery, registration, and management.

**Key Features:**
- **Role-Based Access:** Distinct features for Students (Guests), Organizers, and Admins.
- **Event Discovery:** Students can browse, search, and view details of approved events.
- **Event Management:** Organizers can create, edit, and manage events.
- **Ticketing & RSVP:** Seamless ticket purchase (via Paystack) and RSVP system.
- **Check-in:** Digital QR code check-in for attendees.
- **Admin Oversight:** Administrators approve events and manage user roles.
- **Interactive Maps:** Integration with Leaflet for event location visualization.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Leaflet
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcryptjs
- **Payments:** Paystack API

## Project Structure

```
/
├── client/                 # Frontend application (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── api/            # Axios setup
│   │   └── ...
├── server/                 # Backend application (Express)
│   ├── models/             # Mongoose schemas (User, Event, Ticket)
│   ├── controllers/        # Business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth and error handling
│   └── ...
├── docs/                   # System documentation
│   ├── user_requirements.md
│   ├── use_case_diagram.md
│   ├── database_design.md
│   └── ...
└── ...
```

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas connection string)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus_db
JWT_SECRET=your_super_secret_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
# Add other necessary keys as required (e.g., EMAIL_USER, EMAIL_PASS)
```

(Optional) Seed the database with initial data:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173` (or the port specified by Vite).

## Usage Guide

### Admin
- **Login:** Use admin credentials (created via seed or manually).
- **Dashboard:** Approve pending events, view site statistics.
- **Users:** Manage user roles.

### Organizer
- **Login:** Sign up as an organizer or request a role change.
- **Create Event:** Submit new events for approval.
- **Manage:** Track RSVPs, check in guests via QR code scanner.

### Student/Guest
- **Browse:** Explore the "Discover" page for events.
- **RSVP/Buy:** Secure your spot.
- **Tickets:** View your tickets in "My Tickets" and present QR code at the venue.

## Documentation

Detailed system documentation can be found in the `docs/` folder:
- [User Requirements](docs/user_requirements.md)
- [Use Case Diagram](docs/use_case_diagram.md)
- [Database Design](docs/database_design.md)
- [Class Diagram](docs/structural_diagrams.md)

## License
[License Name]
