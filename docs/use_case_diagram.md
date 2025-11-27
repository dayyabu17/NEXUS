# Use Case Diagram

```mermaid
usecaseDiagram
    actor "Guest/Student" as Guest
    actor "Organizer" as Organizer
    actor "Admin" as Admin

    package "Authentication" {
        usecase "Sign Up" as UC1
        usecase "Sign In" as UC2
        usecase "Update Profile" as UC3
    }

    package "Event Discovery" {
        usecase "Browse Events" as UC4
        usecase "Search Events" as UC5
        usecase "View Event Details" as UC6
        usecase "View Events on Map" as UC7
    }

    package "Ticket Management" {
        usecase "RSVP / Buy Ticket" as UC8
        usecase "View My Tickets" as UC9
    }

    package "Event Management" {
        usecase "Create Event" as UC10
        usecase "Manage Events" as UC11
        usecase "View Analytics" as UC12
        usecase "Check-in Attendees" as UC13
    }

    package "Administration" {
        usecase "View Admin Dashboard" as UC14
        usecase "Approve/Reject Events" as UC15
        usecase "Manage Users" as UC16
    }

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5
    Guest --> UC6
    Guest --> UC7
    Guest --> UC8
    Guest --> UC9

    Organizer --> UC1
    Organizer --> UC2
    Organizer --> UC3
    Organizer --> UC10
    Organizer --> UC11
    Organizer --> UC12
    Organizer --> UC13

    Admin --> UC2
    Admin --> UC3
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
```
