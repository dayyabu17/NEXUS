# Structural Diagrams

## Class Diagram

This diagram represents the core backend modules (Models and Controllers) and their relationships. It exhaustively covers all controllers and models found in the codebase.

```mermaid
classDiagram
    %% Models
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +String profilePicture
        +Object preferences
        +String notificationReads
        +String organizationName
    }

    class Event {
        +ObjectId _id
        +ObjectId organizer
        +String title
        +String description
        +Date date
        +Date endDate
        +String location
        +Number price
        +Number capacity
        +String category
        +String status
        +Number locationLatitude
        +Number locationLongitude
        +String imageUrl
        +Number registrationFee
        +Boolean isFeatured
        +String timezone
        +Array tags
    }

    class Ticket {
        +ObjectId _id
        +ObjectId user
        +ObjectId event
        +String status
        +String paymentReference
        +Date checkedInAt
        +Number amountPaid
        +Object metadata
    }

    class PayoutAccount {
        +ObjectId _id
        +ObjectId user
        +String subaccountCode
        +String bankName
        +String bankCode
        +String accountNumber
        +String accountName
        +Number splitPercentage
        +Boolean isActive
    }

    class Feedback {
        +ObjectId _id
        +ObjectId user
        +ObjectId event
        +String message
        +Number rating
    }

    %% Controllers
    class AdminController {
        +getSystemStats(req, res)
        +getAllUsers(req, res)
        +updateUserStatus(req, res)
        +getAllEvents(req, res)
        +deleteEvent(req, res)
        +verifyOrganizer(req, res)
    }

    class AuthController {
        +registerUser(req, res)
        +loginUser(req, res)
        +getMe(req, res)
        +updateProfile(req, res)
        +updateThemePreference(req, res)
        +updateUserRole(req, res)
    }

    class EventController {
        +getPublicEvents(req, res)
        +getPublicEventById(req, res)
        +getDashboardData(req, res)
        +getGuestNotifications(req, res)
        +markGuestNotificationRead(req, res)
        +markAllGuestNotificationsRead(req, res)
        +updateEventStatus(req, res)
        +updateEvent(req, res)
        +deleteEvent(req, res)
    }

    class FeedbackController {
        +createEventFeedback(req, res)
        +getMyEventFeedback(req, res)
        +getOrganizerEventFeedback(req, res)
    }

    class OrganizerController {
        +createEvent(req, res)
        +getMyEvents(req, res)
        +getEventGuests(req, res)
        +updateEventGuestCheckIn(req, res)
    }

    class PaymentController {
        +initializeRSVP(req, res)
        +verifyPayment(req, res)
    }

    class PayoutController {
        +fetchPaystackBanks(req, res)
        +resolveBankAccount(req, res)
        +createOrUpdatePayoutAccount(req, res)
    }

    class TicketController {
        +getMyTickets(req, res)
        +getTicketStatus(req, res)
        +purgeTickets(req, res)
        +checkInUser(req, res)
    }

    class UserController {
        +updateThemePreference(req, res)
    }

    %% Relationships - Models
    User "1" --> "0..*" Event : organizes
    User "1" --> "0..*" Ticket : owns
    Event "1" --> "0..*" Ticket : has
    User "1" -- "1" PayoutAccount : has
    User "1" --> "0..*" Feedback : writes
    Event "1" --> "0..*" Feedback : receives

    %% Relationships - Controllers to Models (Dependencies)
    AdminController ..> User : manages
    AdminController ..> Event : manages

    AuthController ..> User : manages

    EventController ..> Event : manages
    EventController ..> Ticket : queries
    EventController ..> User : notifies

    FeedbackController ..> Feedback : manages
    FeedbackController ..> Event : validates
    FeedbackController ..> Ticket : verifies

    OrganizerController ..> Event : manages
    OrganizerController ..> Ticket : manages

    PaymentController ..> Ticket : creates
    PaymentController ..> Event : updates
    PaymentController ..> User : notifies

    PayoutController ..> PayoutAccount : manages

    TicketController ..> Ticket : manages
    TicketController ..> Event : queries

    UserController ..> User : updates
```
