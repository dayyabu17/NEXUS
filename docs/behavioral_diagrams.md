# Behavioral Diagrams

## Event Creation and Approval Sequence

This sequence diagram illustrates the process of an Organizer creating an event and an Admin approving it.

```mermaid
sequenceDiagram
    actor Org as Organizer
    participant FE as Frontend (Client)
    participant BE as Backend (API)
    participant DB as Database
    actor Adm as Admin

    Org->>FE: Fills Event Details & Submits
    FE->>BE: POST /api/organizer/events (Token, EventData)
    BE->>BE: Validate Data
    BE->>DB: Save Event (status: "pending")
    DB-->>BE: Event Saved
    BE-->>FE: Return Success & Event ID
    FE-->>Org: Show Success Message

    Note over Adm: Later...
    Adm->>FE: View Pending Events
    FE->>BE: GET /api/admin/events/pending
    BE->>DB: Query { status: "pending" }
    DB-->>BE: Return List
    BE-->>FE: Return List
    FE-->>Adm: Display Pending List

    Adm->>FE: Click Approve on Event
    FE->>BE: PUT /api/admin/events/:id/status { status: "approved" }
    BE->>DB: Update Event Status
    DB-->>BE: Success
    BE-->>FE: Return Updated Event
    FE-->>Adm: Show "Event Approved"

    Note over Org: Organizer Notification
    Org->>FE: View Dashboard
    FE->>BE: GET /api/organizer/events
    BE->>DB: Query Events
    DB-->>BE: Return Events (including Approved)
    BE-->>FE: Return List
    FE-->>Org: See Event as "Approved"
```

## Ticket Purchase Sequence

This diagram shows the flow for a student purchasing a ticket for a paid event.

```mermaid
sequenceDiagram
    actor Stu as Student
    participant FE as Frontend
    participant BE as Backend
    participant PG as Payment Gateway (Paystack)
    participant DB as Database

    Stu->>FE: Click "Buy Ticket"
    FE->>FE: Open Checkout Modal
    Stu->>FE: Confirm Purchase
    FE->>BE: POST /api/payment/rsvp/initialize (EventID, UserID)
    BE->>DB: Check Availability
    DB-->>BE: Available
    BE->>PG: Initialize Transaction
    PG-->>BE: Return Authorization URL
    BE-->>FE: Return URL
    FE->>Stu: Redirect to Payment Page

    Stu->>PG: Enter Payment Details & Pay
    PG-->>Stu: Redirect to Callback URL (Client)

    Stu->>FE: Load Callback Page (verify=true)
    FE->>BE: GET /api/payment/rsvp/verify?reference=REF
    BE->>PG: Verify Transaction
    PG-->>BE: Transaction Success
    BE->>DB: Create Ticket (status: "confirmed")
    DB-->>BE: Ticket Created
    BE->>DB: Update Event Stats (ticketsSold)
    BE-->>FE: Return Success & Ticket Info
    FE-->>Stu: Show "Ticket Confirmed"
```
