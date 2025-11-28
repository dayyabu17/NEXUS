# Use Case Diagram

```mermaid
usecaseDiagram
    actor "Guest (Student)" as Guest
    actor "Organizer" as Organizer
    actor "Admin" as Admin

    package "Authentication & Profile" {
        usecase "Sign Up" as UC_Auth_1
        usecase "Sign In" as UC_Auth_2
        usecase "Update Profile" as UC_Auth_3
        usecase "Upload Profile Picture" as UC_Auth_4
    }

    package "Event Discovery (Public)" {
        usecase "Browse All Events" as UC_Disc_1
        usecase "Search Events" as UC_Disc_2
        usecase "Filter Events by Category" as UC_Disc_3
        usecase "View Event Details" as UC_Disc_4
        usecase "View Events on Map" as UC_Disc_5
    }

    package "Ticketing & Attendance" {
        usecase "RSVP / Purchase Ticket" as UC_Ticket_1
        usecase "View My Tickets" as UC_Ticket_2
        usecase "Access QR Code" as UC_Ticket_3
    }

    package "Organizer Operations" {
        usecase "View Organizer Dashboard" as UC_Org_1
        usecase "Create New Event" as UC_Org_2
        usecase "View My Events" as UC_Org_3
        usecase "Receive Notifications" as UC_Org_4
        usecase "View Event Analytics (Earnings/RSVPs)" as UC_Org_5
        usecase "Check-in Guests" as UC_Org_6
    }

    package "Admin Operations" {
        usecase "View System Dashboard" as UC_Admin_1
        usecase "View Pending Events" as UC_Admin_2
        usecase "Approve/Reject Events" as UC_Admin_3
        usecase "Delete Events" as UC_Admin_4
        usecase "Manage Users" as UC_Admin_5
        usecase "Update User Roles" as UC_Admin_6
    }

    %% Relationships

    %% Guest Interactions
    Guest --> UC_Auth_1
    Guest --> UC_Auth_2
    Guest --> UC_Auth_3
    Guest --> UC_Disc_1
    Guest --> UC_Disc_2
    Guest --> UC_Disc_3
    Guest --> UC_Disc_4
    Guest --> UC_Disc_5
    Guest --> UC_Ticket_1
    Guest --> UC_Ticket_2
    Guest --> UC_Ticket_3

    %% Organizer Interactions
    Organizer --> UC_Auth_1
    Organizer --> UC_Auth_2
    Organizer --> UC_Auth_3
    Organizer --> UC_Auth_4
    Organizer --> UC_Org_1
    Organizer --> UC_Org_2
    Organizer --> UC_Org_3
    Organizer --> UC_Org_4
    Organizer --> UC_Org_5
    Organizer --> UC_Org_6
    %% Organizers can also explore events
    Organizer --> UC_Disc_1

    %% Admin Interactions
    Admin --> UC_Auth_2
    Admin --> UC_Auth_3
    Admin --> UC_Admin_1
    Admin --> UC_Admin_2
    Admin --> UC_Admin_3
    Admin --> UC_Admin_4
    Admin --> UC_Admin_5
    Admin --> UC_Admin_6
```
