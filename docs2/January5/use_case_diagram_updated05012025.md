# Use Case Diagram

```mermaid
usecaseDiagram
    actor Guest as "Student/Guest"
    actor Organizer as "Organizer"
    actor Admin as "Admin"

    package "Campus Event System" {
        usecase "Register/Login" as UC1
        usecase "View Events" as UC2
        usecase "Search/Filter Events" as UC3
        usecase "Book Ticket (Free/Paid)" as UC4
        usecase "View My Tickets" as UC5
        usecase "Update Profile" as UC6

        usecase "Create Event" as UC7
        usecase "View Organizer Dashboard" as UC8
        usecase "Check-in Guest" as UC9
        usecase "Manage Payout Account" as UC10

        usecase "Verify Organizer" as UC11
        usecase "View System Stats" as UC12
        usecase "Manage Users" as UC13
    }

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5
    Guest --> UC6

    Organizer --> UC1
    Organizer --> UC2
    Organizer --> UC7
    Organizer --> UC8
    Organizer --> UC9
    Organizer --> UC10

    Admin --> UC1
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
```
