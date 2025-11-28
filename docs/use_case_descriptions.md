# Use Case Descriptions

| Use Case | Actor | Description | Preconditions | Post-conditions |
| :--- | :--- | :--- | :--- | :--- |
| **Sign Up** | User | User registers a new account as Guest or Organizer. | User is not logged in. | New user account is created in the database. |
| **Sign In** | User | User logs in with email and password. | User has an account. | User receives a JWT token and access to protected routes. |
| **Create Event** | Organizer | Organizer submits a new event for approval. | Organizer is logged in. | Event is created with 'pending' status. |
| **Approve/Reject Event** | Admin | Admin reviews and changes the status of an event. | Admin is logged in. | Event status is updated to 'approved' or 'rejected'. |
| **Browse Events** | Guest | Guest views a list of approved events. | None (Public access). | List of events is displayed. |
| **RSVP / Buy Ticket** | Guest | Guest registers for an event (free or paid). | Guest is logged in. | Ticket is created, event sales count updated. |
| **View My Tickets** | Guest | Guest views their purchased tickets. | Guest is logged in. | List of user's tickets is displayed. |
| **Manage Events** | Organizer | Organizer views and edits their own events. | Organizer is logged in. | Organizer sees their event list and details. |
| **View Admin Dashboard** | Admin | Admin views system stats and pending tasks. | Admin is logged in. | Dashboard with statistics is displayed. |
| **Check-in Attendees** | Organizer | Organizer marks an attendee as checked-in. | Organizer is logged in. | Ticket status is updated to checked-in. |
