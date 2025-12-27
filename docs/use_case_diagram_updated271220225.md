# Use Case Diagram

```mermaid
usecaseDiagram
    actor Student as "Student (Guest)"
    actor Organizer
    actor Admin

    package "Campus Event System" {
        usecase "Register / Login" as UC1
        usecase "View Events" as UC2
        usecase "Search Events" as UC3
        usecase "Buy Ticket / RSVP" as UC4
        usecase "View My Tickets" as UC5
        usecase "Submit Feedback" as UC6

        usecase "Create Event" as UC7
        usecase "View My Events" as UC8
        usecase "Check-in Guest" as UC9
        usecase "View Event Stats" as UC10

        usecase "Approve/Reject Event" as UC11
        usecase "View System Stats" as UC12
        usecase "Manage Users" as UC13
    }

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6

    Organizer --> UC1
    Organizer --> UC7
    Organizer --> UC8
    Organizer --> UC9
    Organizer --> UC10

    Admin --> UC1
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
```
