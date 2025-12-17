# Use Case Diagram

```mermaid
usecaseDiagram
    actor "Admin" as A
    actor "Organizer" as O
    actor "Student/Guest" as S

    package "Event Management System" {
        usecase "Login" as UC1
        usecase "Register" as UC2

        usecase "Create Event" as UC3
        usecase "Edit Event" as UC4
        usecase "Delete Event" as UC5
        usecase "View Event Status" as UC6
        usecase "Manage Guest List" as UC7
        usecase "Check-in Guests" as UC8
        usecase "View Analytics" as UC9

        usecase "Browse Events" as UC10
        usecase "Search Events" as UC11
        usecase "View Event Details" as UC12
        usecase "RSVP / Buy Ticket" as UC13
        usecase "View My Tickets" as UC14
        usecase "Submit Feedback" as UC15

        usecase "Approve/Reject Events" as UC16
        usecase "View Pending Events" as UC17
        usecase "Manage Users" as UC18
        usecase "View System Stats" as UC19
    }

    A --> UC1
    A --> UC16
    A --> UC17
    A --> UC18
    A --> UC19
    A --> UC5

    O --> UC1
    O --> UC3
    O --> UC4
    O --> UC5
    O --> UC6
    O --> UC7
    O --> UC8
    O --> UC9

    S --> UC1
    S --> UC2
    S --> UC10
    S --> UC11
    S --> UC12
    S --> UC13
    S --> UC14
    S --> UC15
```
