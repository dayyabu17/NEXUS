# Use Case Descriptions

## 1. Buy Ticket / RSVP

| Field | Description |
| :--- | :--- |
| **Use Case Name** | Buy Ticket / RSVP |
| **Actor** | Student (Guest) |
| **Description** | The student registers for an event. If the event is paid, they complete a payment process. If free, they receive a ticket immediately. |
| **Preconditions** | User is logged in. Event has available capacity. |
| **Post-conditions** | A Ticket record is created. Event `ticketsSold` count increases. User receives confirmation. |

## 2. Create Event

| Field | Description |
| :--- | :--- |
| **Use Case Name** | Create Event |
| **Actor** | Organizer |
| **Description** | The organizer submits details for a new event to be hosted on the platform. |
| **Preconditions** | User is logged in with 'organizer' role. |
| **Post-conditions** | An Event record is created with status 'pending'. Admin must approve it before it becomes public. |

## 3. Approve Event

| Field | Description |
| :--- | :--- |
| **Use Case Name** | Approve Event |
| **Actor** | Admin |
| **Description** | The admin reviews a pending event and approves it for public viewing. |
| **Preconditions** | User is logged in with 'admin' role. Event status is 'pending'. |
| **Post-conditions** | Event status updates to 'approved'. Event appears in public search and dashboards. |

## 4. Check-in Guest

| Field | Description |
| :--- | :--- |
| **Use Case Name** | Check-in Guest |
| **Actor** | Organizer |
| **Description** | The organizer marks a guest's ticket as 'checked-in' at the venue. |
| **Preconditions** | Organizer owns the event. Guest has a valid confirmed ticket. |
| **Post-conditions** | Ticket status updates to 'checked-in'. `checkedInAt` timestamp is recorded. |
