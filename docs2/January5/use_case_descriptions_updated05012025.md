# Use Case Descriptions

## 1. Create Event

| Field | Description |
| :--- | :--- |
| **Actor** | Organizer |
| **Description** | The Organizer creates a new event to be listed on the platform. |
| **Preconditions** | User is logged in and has the 'Organizer' role. |
| **Post-conditions** | A new event record is created in the database and is visible to users. |
| **Main Flow** | 1. Organizer navigates to the "Create Event" page.<br>2. Organizer fills in event details (title, description, date, price, etc.).<br>3. Organizer uploads an event image.<br>4. Organizer submits the form.<br>5. System validates input and saves the event.<br>6. System redirects Organizer to the dashboard with a success message. |
| **Alternative Flow** | **Invalid Input:** If required fields are missing, the system displays an error message and prevents submission. |

## 2. Book Ticket

| Field | Description |
| :--- | :--- |
| **Actor** | Student (Guest) |
| **Description** | A Student books a ticket for an event. The process differs for free vs. paid events. |
| **Preconditions** | User is logged in. Event has available capacity. |
| **Post-conditions** | A ticket record is created. Inventory is reduced. User receives confirmation. |
| **Main Flow (Free)** | 1. Student views event details.<br>2. Student clicks "RSVP" or "Get Ticket".<br>3. System confirms availability.<br>4. System creates a confirmed ticket.<br>5. System sends confirmation email. |
| **Main Flow (Paid)** | 1. Student views event details.<br>2. Student clicks "Buy Ticket".<br>3. System initializes payment with Paystack.<br>4. Student completes payment on gateway.<br>5. Paystack verifies transaction.<br>6. System creates a confirmed ticket.<br>7. System sends confirmation email. |

## 3. Check-in Guest

| Field | Description |
| :--- | :--- |
| **Actor** | Organizer |
| **Description** | The Organizer marks a guest's ticket as "Checked In" at the event venue. |
| **Preconditions** | Organizer is logged in and owns the event. Event is currently active or starting soon. |
| **Post-conditions** | Ticket status updates to "checked-in". Timestamp is recorded. |
| **Main Flow** | 1. Organizer navigates to the Event Dashboard.<br>2. Organizer selects "Guest List" or "Check-in".<br>3. Organizer scans QR code or enters Ticket ID.<br>4. System validates the ticket against the event.<br>5. System updates ticket status to "Checked In".<br>6. System displays success message. |
| **Alternative Flow** | **Invalid Ticket:** If ticket belongs to another event or is already used, system displays an error. |
