# User Requirements

## 1. Authentication & User Management
*   **The User** shall be able to sign up as a Guest or an Organizer.
*   **The User** shall be able to sign in using their email and password.
*   **The User** shall be able to update their profile information (name, email, password, profile picture).
*   **The Admin** shall be able to view a list of all registered users.
*   **The Admin** shall be able to update a user's role (Admin, Organizer, Student).

## 2. Event Management (Organizer)
*   **The Organizer** shall be able to create new events with details such as title, description, date, time, location, category, capacity, and price.
*   **The Organizer** shall be able to upload a cover image for their event.
*   **The Organizer** shall be able to view a list of their created events.
*   **The Organizer** shall be able to filter their events by status (Pending, Approved, Rejected).
*   **The Organizer** shall be able to view detailed analytics for their events (RSVPs, ticket sales, revenue).
*   **The Organizer** shall be able to manage a guest list and check in attendees.

## 3. Event Discovery & RSVP (Guest/Student)
*   **The Guest** shall be able to view a dashboard of upcoming events.
*   **The Guest** shall be able to filter events by category.
*   **The Guest** shall be able to search for events by title, organizer, or location.
*   **The Guest** shall be able to view detailed information about a specific event.
*   **The Guest** shall be able to view events on an interactive map.
*   **The Guest** shall be able to RSVP for free events or purchase tickets for paid events.
*   **The Guest** shall be able to view their purchased tickets with a QR code for entry.

## 4. Administration
*   **The Admin** shall be able to view a dashboard with system-wide statistics (total users, organizers, events, pending approvals).
*   **The Admin** shall be able to view a list of events pending approval.
*   **The Admin** shall be able to approve or reject pending events.
*   **The Admin** shall be able to delete events.
*   **The Admin** shall be able to view details of any event in the system.

## 5. Payments
*   **The System** shall securely process payments for paid events (via Paystack integration).
*   **The System** shall generate a unique ticket reference upon successful payment or RSVP.
*   **The System** shall verify payment transactions before issuing tickets.
