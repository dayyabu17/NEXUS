# Nexus Campus Event Management System

Nexus is a comprehensive web application designed to streamline event management for university campuses. It connects students, organizers, and administrators in a unified platform, facilitating event discovery, organization, and approval processes.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage](#usage)

## Project Overview

Nexus aims to enhance campus life by providing a centralized hub for events.

*   **Students** can browse and discover upcoming events.
*   **Organizers** (student clubs, departments) can propose and manage events.
*   **Administrators** oversee the platform, approve event requests, and manage user roles.

## Key Features

*   **User Authentication**: Secure Sign Up and Sign In functionality with JWT-based authentication.
*   **Role-Based Access Control (RBAC)**: Distinct roles for Guests/Students, Organizers, and Administrators.
*   **Event Management**:
    *   Organizers can create events with details like title, description, date, location, and capacity.
    *   Admins can view pending events and approve or reject them.
    *   Event filtering by status, category, and organizer.
*   **User Management**: Admins can view all users and update their roles (e.g., promote a student to an organizer).
*   **Dashboard**: A data-rich dashboard for admins showing key statistics like pending approvals and total users.
*   **Profile Management**: Users can update their profile information and upload profile pictures.

## Technology Stack

### Backend
*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **MongoDB**: NoSQL database for storing users and events.
*   **Mongoose**: ODM library for MongoDB.
*   **JWT (JSON Web Tokens)**: For secure user authentication.
*   **Multer**: Middleware for handling file uploads (profile pictures).

### Frontend
*   **React**: JavaScript library for building user interfaces.
*   **Vite**: Next-generation frontend tooling.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **React Router**: For client-side routing.
*   **Axios**: For making HTTP requests to the backend.

## Project Structure

The project is organized into two main directories:

*   **`client/`**: Contains the React frontend application.
    *   `src/components/`: Reusable UI components and page views.
    *   `src/api/`: Axios configuration for API requests.
*   **`server/`**: Contains the Node.js/Express backend application.
    *   `models/`: Mongoose schemas for MongoDB (User, Event).
    *   `controllers/`: Logic for handling API requests.
    *   `routes/`: API route definitions.
    *   `middleware/`: Custom middleware (Authentication, Error handling).
    *   `utils/`: Utility functions (File upload configuration).

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   **Node.js** (v14 or higher)
*   **npm** (Node Package Manager)
*   **MongoDB**: Ensure you have a running MongoDB instance (local or Atlas).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd nexus
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

1.  **Server Environment Variables:**
    Create a `.env` file in the `server/` directory and add the following:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/nexus_db  # Or your MongoDB Atlas URI
    JWT_SECRET=your_jwt_secret_key_here
    ```

### Running the Application

1.  **Start the Server:**
    Open a terminal, navigate to the `server/` directory, and run:
    ```bash
    npm start
    # OR for development with nodemon:
    # npm run dev
    ```
    The server will start on `http://localhost:5000`.

2.  **Seed the Database (Optional):**
    To populate the database with initial dummy data (Admin user, Organizer, Events), run:
    ```bash
    # In the server/ directory
    node seed.js
    ```
    *   **Admin Credentials**: `admin@nexus.com` / `admin123`
    *   **Organizer Credentials**: `organizer@nexus.com` / `organizer123`

3.  **Start the Client:**
    Open a new terminal, navigate to the `client/` directory, and run:
    ```bash
    npm run dev
    ```
    The frontend will launch, usually at `http://localhost:5173`.

## API Documentation

The backend API exposes the following endpoints:

### Authentication (`/api/auth`)
*   `POST /login`: Authenticate a user and return a token.
*   `PUT /profile`: Update user profile details.
*   `PUT /profile/picture`: Upload a profile picture.

### Admin (`/api/admin`)
*   `GET /stats`: Get dashboard statistics.
*   `GET /events`: Get all events.
*   `GET /events/pending`: Get pending events.
*   `GET /events/:id`: Get details of a specific event.
*   `PUT /events/:id/status`: Approve or reject an event.
*   `DELETE /events/:id`: Delete an event.
*   `GET /users`: Get all users.
*   `PUT /users/:id/role`: Update a user's role.

## Usage

1.  **Login**: Use the seeded credentials or sign up for a new account.
2.  **Admin Dashboard**: Log in as an admin to view statistics, manage pending events, and manage users.
3.  **Events**: Organizers can submit events (functionality to be fully implemented on frontend), which will appear in the pending list for admins.
4.  **Profile**: Users can update their personal information and upload a profile photo from the settings page.

---
Developed for the Nexus Campus Event Management System.
