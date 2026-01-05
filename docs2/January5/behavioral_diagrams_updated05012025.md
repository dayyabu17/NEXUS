# Behavioral Diagrams

## 1. Event Creation Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant Org as Organizer
    participant FE as Client (React)
    participant API as API (Express)
    participant DB as MongoDB

    Org->>FE: Fills Event Form & Uploads Image
    FE->>API: POST /api/organizers/events (FormData)
    activate API
    API->>API: Validate Token & Role
    API->>API: Validate Input (Multer/Validator)
    API->>DB: Save Event Details
    activate DB
    DB-->>API: Event Document
    deactivate DB
    API-->>FE: 201 Created (Event Data)
    deactivate API
    FE-->>Org: Display Success Message
```

## 2. Guest Ticket Booking Flow (Sequence Diagram)

This diagram illustrates the flow for a **Paid** event booking.

```mermaid
sequenceDiagram
    participant User as Student
    participant FE as Client
    participant API as API
    participant PS as Paystack Gateway
    participant DB as MongoDB

    User->>FE: Click "Buy Ticket"
    FE->>API: POST /api/payment/initialize
    activate API
    API->>PS: Initialize Transaction (Amount, Email)
    activate PS
    PS-->>API: Authorization URL & Ref
    deactivate PS
    API-->>FE: Return Auth URL
    deactivate API

    FE->>User: Redirect to Paystack
    User->>PS: Enter Payment Details & Confirm
    PS-->>FE: Redirect back to Callback URL

    FE->>API: GET /api/payment/verify?reference=...
    activate API
    API->>PS: Verify Transaction Status
    activate PS
    PS-->>API: Status: "success"
    deactivate PS

    API->>DB: Create Ticket (Status: Confirmed)
    activate DB
    DB-->>API: Ticket ID
    deactivate DB

    API-->>FE: Booking Successful
    deactivate API
    FE->>User: Show Ticket Confirmation
```

## 3. Check-in Flow (Activity Diagram)

```mermaid
graph TD
    A[Start Check-in] --> B{Input Method?}
    B -->|Scan QR| C[Read QR Code Data]
    B -->|Manual Input| D[Enter Ticket/User ID]

    C --> E[Send Request to Server]
    D --> E

    E --> F{Validate Ticket}
    F -->|Invalid/Not Found| G[Show Error: Ticket Not Found]
    F -->|Wrong Event| H[Show Error: Wrong Event]
    F -->|Already Checked In| I[Show Error: Already Used]

    F -->|Valid| J[Update Ticket Status to 'checked-in']
    J --> K[Record Timestamp]
    K --> L[Return Success Response]
    L --> M[Display Guest Details on Screen]
    M --> N[End Check-in]
```
