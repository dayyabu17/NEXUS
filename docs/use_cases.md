# Use Case Descriptions

This document outlines detailed use case descriptions for key functionalities in the Nexus Campus Event Management System, based on the backend implementation in `server/controllers` and `server/routes`.

## For Students/Guests

### Use Case 1: Search and Browse Events
**Use Case Name:** Search and Browse Events
**Actor:** Student/Guest
**Priority:** High
**Description:** Users can view a list of all approved events, or see a personalized dashboard with featured (Hero), recommended (based on interests), and recent events.
**Trigger:** `GET /api/events` or `GET /api/events/dashboard`
**Preconditions:** None (Public access). Personalization available if `userId` is provided in query.
**Normal Course:**
1. User sends a request to the events endpoint.
2. System queries the database for events with `status: 'approved'`.
3. (Dashboard) System prioritizes a 'Hero' event (Featured > Upcoming Popular > General Popular).
4. (Dashboard) System identifies user interests (if `userId` provided) and fetches matching recommended events.
5. (Dashboard) System fetches remaining events as 'Recent'.
6. System returns the event data in JSON format.
**Exceptions:** None found.

### Use Case 2: RSVP for Event
**Use Case Name:** RSVP for Event
**Actor:** Student/Guest
**Priority:** High
**Description:** Users can register for an event. The system handles both free tickets (immediate confirmation) and paid tickets (Paystack initialization).
**Trigger:** `POST /api/payment/rsvp/initialize`
**Preconditions:** User must provide `userId`, `eventId`, and `email`. Event must exist and have available capacity.
**Normal Course (Free Event):**
1. User submits RSVP request.
2. System validates event existence, capacity, and ensures user has no duplicate confirmed ticket.
3. System detects `unitPrice` is 0.
4. System creates a Ticket with status 'confirmed'.
5. System updates event `ticketsSold` and `rsvpCount`.
6. System sends a confirmation email to the user.
7. System returns success response with `{ isFree: true, ticketId }`.
**Alternative Course (Paid Event):**
1. System detects `unitPrice` > 0.
2. System calls Paystack API to initialize the transaction.
3. System returns `{ authorization_url, reference }` for the frontend to redirect the user.
**Exceptions:**
*   400: Missing fields, Event full.
*   404: Event not found.
*   409: User already has a ticket.
*   500: Payment gateway error.

### Use Case 3: Submit Feedback
**Use Case Name:** Submit Feedback
**Actor:** Student/Guest
**Priority:** Medium
**Description:** Attendees can leave a rating and textual feedback for an event they attended.
**Trigger:** `POST /api/events/:id/feedback`
**Preconditions:** User must be authenticated (`protect` middleware). User must have a 'confirmed' or 'checked-in' ticket. Event must have started.
**Normal Course:**
1. User submits message and/or rating (1-5).
2. System validates event has started (Current time > Event Start Time).
3. System verifies user holds a valid ticket for the event.
4. System creates or updates the Feedback document.
5. System returns the saved feedback.
**Exceptions:**
*   400: Message too short (< 5 chars), Rating invalid, or Event not started.
*   403: No valid ticket found.
*   404: Event not found.

## For Organizers

### Use Case 4: Create Event
**Use Case Name:** Create Event
**Actor:** Organizer
**Priority:** High
**Description:** Organizers can submit new events for approval.
**Trigger:** `POST /api/organizer/events`
**Preconditions:** Authenticated user with 'organizer' role (`protect`, `organizer` middleware).
**Normal Course:**
1. Organizer submits event details (Title, Date, Location, Capacity, Fee, etc.).
2. System validates input formats (Date, Numbers, Coordinates).
3. System creates a new Event document with status 'pending'.
4. System triggers internal logic to generate an 'event-created' notification for the organizer.
5. System returns the created event details.
**Exceptions:**
*   400: Missing required fields, Invalid date/capacity/fee format.

### Use Case 5: Emergency Update (Event Notifications)
**Use Case Name:** Emergency Update (Event Notifications)
**Actor:** Organizer
**Priority:** Medium
**Description:** Logic handles the generation of notifications when an event is updated. (Note: While the notification logic for 'event-updated' exists, the direct API endpoint for updating event details was not found in the current controller scan).
**Trigger:** System Logic (triggered when Event `updatedAt` timestamp changes).
**Preconditions:** Event exists.
**Normal Course:**
1. System builds notifications by checking event timestamps (`buildNotifications` function).
2. System detects `updatedAt` is different from `createdAt`.
3. System generates a notification with ID based on the timestamp.
4. Notification type is set to 'event-updated', headline "Event updated", message "Recent changes were saved successfully."
5. Organizer sees this notification in their dashboard.
**Exceptions:** None found in notification logic.

### Use Case 6: Guest Check-in
**Use Case Name:** Guest Check-in
**Actor:** Organizer
**Priority:** Medium
**Description:** Organizers can manually check in guests or revert a check-in status.
**Trigger:** `PATCH /api/organizer/events/:eventId/guests/:ticketId/check-in`
**Preconditions:** Authenticated as Organizer. Event must have started.
**Normal Course:**
1. Organizer requests check-in (set `checkedIn: true`) for a specific ticket.
2. System validates that the event belongs to the organizer.
3. System validates that the event has started.
4. System updates ticket status to 'checked-in' and records `checkedInAt` timestamp.
5. System returns the updated guest information.
**Exceptions:**
*   400: Event not started, Ticket not confirmed (pending), or invalid boolean flag.
*   404: Event or Ticket not found.

## For Admins

### Use Case 7: Approve / Reject Event
**Use Case Name:** Approve / Reject Event
**Actor:** Admin
**Priority:** High
**Description:** Admins can review pending events and change their status to 'approved' or 'rejected'.
**Trigger:** `PUT /api/admin/events/:id/status`
**Preconditions:** Authenticated as Admin.
**Normal Course:**
1. Admin submits the new status ('approved' or 'rejected').
2. System finds the event by ID.
3. System updates the `status` field.
4. System saves the event.
5. System returns a success message with the new status.
**Note:** The system contains logic in `eventController.js` to send email notifications upon status change, but the route currently utilizes `adminController.js` which performs the update without sending an email.
**Exceptions:**
*   400: Invalid status value.
*   404: Event not found.

### Use Case 8: Manage Users
**Use Case Name:** Manage Users
**Actor:** Admin
**Priority:** Low
**Description:** Admins can view a list of all users and update their roles (e.g., promote to Organizer or Admin).
**Trigger:** `GET /api/admin/users` (View) / `PUT /api/admin/users/:id/role` (Update)
**Preconditions:** Authenticated as Admin.
**Normal Course (Update Role):**
1. Admin submits a new role for a specific user.
2. System validates the role is one of ['admin', 'organizer', 'attendee'].
3. System checks if the target user exists.
4. System prevents the admin from changing their own role (Self-Demotion Prevention).
5. System updates the user's role.
6. System returns the updated user role.
**Exceptions:**
*   400: Invalid role value.
*   403: Attempt to change own role.
*   404: User not found.
