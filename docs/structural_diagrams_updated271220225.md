# Structural Diagrams

## Class Diagram

This diagram represents the main backend classes (Controllers) and Data Models, showing their relationships and key methods/attributes based on the current codebase.

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +String organizationName
        +String profilePicture
        +List notificationReads
        +String accentPreference
        +String brandColor
        +List interests
        +Date createdAt
    }

    class Event {
        +ObjectId _id
        +String title
        +String description
        +Date date
        +String location
        +Number locationLatitude
        +Number locationLongitude
        +ObjectId organizer
        +String status
        +Boolean isFeatured
        +String category
        +Number capacity
        +Number ticketsSold
        +Number price
        +String imageUrl
        +String timezone
        +Date endDate
    }

    class Ticket {
        +ObjectId _id
        +ObjectId user
        +ObjectId event
        +Number quantity
        +String status
        +String paymentReference
        +Number amountPaid
        +Date checkedInAt
        +Boolean isCheckedIn
        +String email
        +Object metadata
    }

    class Feedback {
        +ObjectId _id
        +ObjectId event
        +ObjectId user
        +String message
        +Number rating
    }

    class AuthController {
        +registerUser(req, res)
        +loginUser(req, res)
        +getMe(req, res)
        +updateUser(req, res)
    }

    class EventController {
        +getPublicEvents(req, res)
        +getPublicEventById(req, res)
        +getDashboardData(req, res)
    }

    class AdminController {
        +getPendingEvents(req, res)
        +updateEventStatus(req, res)
        +getAllUsers(req, res)
        +getAdminStats(req, res)
    }

    class OrganizerController {
        +createOrganizerEvent(req, res)
        +getOrganizerEvents(req, res)
        +getEventGuests(req, res)
        +updateEventGuestCheckIn(req, res)
        +getOrganizerStats(req, res)
    }

    class TicketController {
        +createTicket(req, res)
        +getMyTickets(req, res)
    }

    class PaymentController {
        +initializeRSVP(req, res)
        +verifyRSVP(req, res)
    }

    User "1" -- "many" Event : creates >
    User "1" -- "many" Ticket : owns >
    Event "1" -- "many" Ticket : has >
    Event "1" -- "many" Feedback : receives >
    User "1" -- "many" Feedback : writes >

    AuthController ..> User : manages
    AdminController ..> Event : manages
    AdminController ..> User : manages
    OrganizerController ..> Event : manages
    OrganizerController ..> Ticket : reads/updates
    EventController ..> Event : reads
    TicketController ..> Ticket : creates/reads
    PaymentController ..> Ticket : creates
```
