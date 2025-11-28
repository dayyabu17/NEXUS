# Use Case Diagram

```mermaid
flowchart LR
    %% --- ACTORS LEFT ---
    Admin((Admin))
    Organizer((Organizer))

    %% --- ACTORS RIGHT ---
    Guest((Guest / Student))

    %% --- SYSTEM BOUNDARY ---
    subgraph System [Event Management System]
        direction TB
        
        %% Common / Auth
        UC_Auth(Login & Account Mgmt)

        %% Admin Features (Top)
        UC_Approve(Approve/Reject Events)
        UC_ManageUsers(Manage Users)
        UC_SysDash(System Dashboard)

        %% Organizer Features (Middle)
        UC_Create(Create & Edit Event)
        UC_Track(Track RSVPs & Analytics)
        UC_CheckIn(Check-in Guests)

        %% Guest Features (Bottom)
        UC_Browse(Browse & Search Events)
        UC_RSVP(RSVP / Buy Ticket)
        UC_Ticket(Access Ticket & QR)
    end

    %% --- CONNECTIONS ---

    %% Admin (Left)
    Admin --> UC_Auth
    Admin --> UC_SysDash
    Admin --> UC_Approve
    Admin --> UC_ManageUsers

    %% Organizer (Left)
    Organizer --> UC_Auth
    Organizer --> UC_Create
    Organizer --> UC_Track
    Organizer --> UC_CheckIn

    %% Guest (Right) - Using solid lines for cleaner look
    UC_Auth --- Guest
    UC_Browse --- Guest
    UC_RSVP --- Guest
    UC_Ticket --- Guest
