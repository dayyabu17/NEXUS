# User Requirements

## 1. Student (Guest)
The Student (also referred to as Guest) is the primary end-user of the system, attending events and interacting with the platform.

### Account Management
- **REQ-STU-001:** The Student shall be able to register for an account using their name, email, and password.
- **REQ-STU-002:** The Student shall be able to log in to their account securely.
- **REQ-STU-003:** The Student shall be able to view and edit their profile details, including profile picture and interests.

### Event Discovery
- **REQ-STU-004:** The Student shall be able to view a dashboard of featured and recommended events.
- **REQ-STU-005:** The Student shall be able to browse all approved public events.
- **REQ-STU-006:** The Student shall be able to search for events by keywords or categories.
- **REQ-STU-007:** The Student shall be able to view detailed information about a specific event, including location, time, and price.

### Ticketing & RSVP
- **REQ-STU-008:** The Student shall be able to RSVP for free events.
- **REQ-STU-009:** The Student shall be able to purchase tickets for paid events via an integrated payment gateway (Paystack).
- **REQ-STU-010:** The Student shall be able to view their history of purchased/reserved tickets.
- **REQ-STU-011:** The Student shall be able to receive a confirmation (ticket) upon successful registration.

### Feedback
- **REQ-STU-012:** The Student shall be able to submit feedback and ratings for events they have attended.

## 2. Organizer
The Organizer is responsible for creating and managing events.

### Event Management
- **REQ-ORG-001:** The Organizer shall be able to create new events with details such as title, description, date, location, category, and price.
- **REQ-ORG-002:** The Organizer shall be able to upload a cover image for their event.
- **REQ-ORG-003:** The Organizer shall be able to view a list of all events they have created, including their approval status (pending, approved, rejected).
- **REQ-ORG-004:** The Organizer shall be able to view a dashboard with statistics about their events (e.g., tickets sold, revenue).

### Guest Management
- **REQ-ORG-005:** The Organizer shall be able to view the guest list for a specific event.
- **REQ-ORG-006:** The Organizer shall be able to check in guests manually by updating their ticket status.

## 3. Admin
The Admin oversees the entire system, ensuring content quality and user management.

### System Management
- **REQ-ADM-001:** The Admin shall be able to view system-wide statistics (total users, total events, total revenue).
- **REQ-ADM-002:** The Admin shall be able to view a list of all registered users in the system.

### Event Moderation
- **REQ-ADM-003:** The Admin shall be able to view a list of events pending approval.
- **REQ-ADM-004:** The Admin shall be able to approve pending events, making them visible to students.
- **REQ-ADM-005:** The Admin shall be able to reject pending events.
