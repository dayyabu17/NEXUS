# User Requirements

## 1. Introduction
This document outlines the functional requirements for the Campus Event Management and Notification System, categorized by user roles: Admin, Organizer, and Student (Guest).

## 2. Functional Requirements

### 2.1 Student (Guest)
*   **UR-STU-01:** The Student shall be able to register for an account using their name, email, and password.
*   **UR-STU-02:** The Student shall be able to log in to the system using their credentials.
*   **UR-STU-03:** The Student shall be able to browse a list of available events.
*   **UR-STU-04:** The Student shall be able to search for events by keywords or filter by category/location.
*   **UR-STU-05:** The Student shall be able to view detailed information about a specific event, including description, date, time, location, and organizer.
*   **UR-STU-06:** The Student shall be able to RSVP for free events.
*   **UR-STU-07:** The Student shall be able to purchase tickets for paid events using the integrated payment gateway (Paystack).
*   **UR-STU-08:** The Student shall be able to view their history of booked tickets.
*   **UR-STU-09:** The Student shall be able to update their profile information and theme preferences.
*   **UR-STU-10:** The Student shall receive email confirmations upon successful registration and ticket booking.

### 2.2 Organizer
*   **UR-ORG-01:** The Organizer shall be able to create new events with details such as title, description, category, date, time, location, capacity, and price.
*   **UR-ORG-02:** The Organizer shall be able to upload a promotional image for an event.
*   **UR-ORG-03:** The Organizer shall be able to view a dashboard summarizing their events and ticket sales.
*   **UR-ORG-04:** The Organizer shall be able to check in guests by scanning a ticket QR code or manually entering a ticket ID/User ID.
*   **UR-ORG-05:** The Organizer shall be able to manage payout accounts to receive funds from ticket sales.
*   **UR-ORG-06:** The Organizer shall be restricted from checking in guests for events they do not own.
*   **UR-ORG-07:** The Organizer shall be able to view a guest list for their events.

### 2.3 Admin
*   **UR-ADM-01:** The Admin shall be able to view system-wide statistics, including total users and events.
*   **UR-ADM-02:** The Admin shall be able to manage users, including verifying organizer accounts.
*   **UR-ADM-03:** The Admin shall be able to delete events or users if necessary for moderation.

## 3. System Constraints
*   **SC-01:** All file uploads (images) must be validated for type and size (max 2MB).
*   **SC-02:** Users must be authenticated to access private features like booking or creating events.
