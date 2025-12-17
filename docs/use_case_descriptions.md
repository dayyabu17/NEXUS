# Use Case Descriptions

## UC3: Create Event

| Field | Description |
|---|---|
| **Actor** | Organizer |
| **Description** | The Organizer creates a new event by providing necessary details. |
| **Preconditions** | Organizer must be logged in. |
| **Post-conditions** | A new event is created in the database with "pending" status. Admin receives a notification (conceptually) or sees it in the pending list. |
| **Trigger** | Organizer clicks "Create Event" button. |
| **Courses** | 1. Organizer navigates to "Create Event" page.<br>2. Organizer fills in title, description, date, time, location, capacity, and price.<br>3. Organizer submits the form.<br>4. System validates input.<br>5. System saves event and displays success message. |
| **Exceptions** | - Validation error (e.g., missing required fields).<br>- Server error during save. |

## UC13: RSVP / Buy Ticket

| Field | Description |
|---|---|
| **Actor** | Student/Guest |
| **Description** | The Student reserves a spot or purchases a ticket for an event. |
| **Preconditions** | Student must be logged in. Event must be approved and have available capacity. |
| **Post-conditions** | A ticket is generated for the student. Event capacity is updated. Payment is processed (if paid). |
| **Trigger** | Student clicks "RSVP" or "Buy Ticket" on event details page. |
| **Courses** | **Free Event:**<br>1. Student clicks RSVP.<br>2. System confirms availability.<br>3. System creates ticket and confirms success.<br><br>**Paid Event:**<br>1. Student clicks Buy Ticket.<br>2. System redirects to payment gateway.<br>3. Student completes payment.<br>4. Payment gateway confirms transaction.<br>5. System creates ticket and updates status to confirmed. |
| **Exceptions** | - Event is full.<br>- Payment failure.<br>- User already has a ticket. |

## UC16: Approve/Reject Events

| Field | Description |
|---|---|
| **Actor** | Admin |
| **Description** | The Admin reviews pending events and approves or rejects them. |
| **Preconditions** | Admin must be logged in. There must be pending events. |
| **Post-conditions** | Event status is updated to "approved" or "rejected". Organizer can see the updated status. Public can see approved events. |
| **Trigger** | Admin selects an event from the pending list and clicks Approve or Reject. |
| **Courses** | 1. Admin views list of pending events.<br>2. Admin reviews event details.<br>3. Admin clicks Approve or Reject.<br>4. System updates event status.<br>5. System removes event from pending list (or updates view). |
| **Exceptions** | - Event ID not found.<br>- Database error. |

## UC8: Check-in Guests

| Field | Description |
|---|---|
| **Actor** | Organizer |
| **Description** | The Organizer checks in a guest who has arrived at the event. |
| **Preconditions** | Organizer is logged in. Guest has a valid ticket/QR code. |
| **Post-conditions** | Ticket status is updated to "checked-in". Check-in timestamp is recorded. |
| **Trigger** | Organizer scans QR code or manually checks in guest. |
| **Courses** | 1. Organizer views guest list or scans QR.<br>2. System verifies ticket validity.<br>3. Organizer confirms check-in.<br>4. System updates ticket status.<br>5. System displays success message. |
| **Exceptions** | - Invalid ticket.<br>- Ticket already checked in. |
