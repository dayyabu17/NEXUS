# Database Design

## Entity Relationship Diagram (ERD)

This diagram represents the MongoDB schema design using Mongoose models.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email
        String password
        String role "admin, organizer, student"
        String profilePicture
        Object preferences
        Date createdAt
    }

    EVENT {
        ObjectId _id PK
        ObjectId organizer FK
        String title
        String description
        Date date
        Date endDate
        String location
        Number price
        Number capacity
        String category
        String status
        Date createdAt
    }

    TICKET {
        ObjectId _id PK
        ObjectId user FK
        ObjectId event FK
        String status "pending, confirmed, checked-in"
        String paymentReference
        Date checkedInAt
        Date createdAt
    }

    PAYOUT_ACCOUNT {
        ObjectId _id PK
        ObjectId user FK
        String subaccountCode
        String bankName
        String accountNumber
        String accountName
        Boolean isActive
    }

    FEEDBACK {
        ObjectId _id PK
        ObjectId user FK
        ObjectId event FK
        String message
        Number rating
    }

    %% Relationships
    USER ||--o{ EVENT : "organizes (if role=organizer)"
    USER ||--o{ TICKET : "purchases"
    USER ||--|| PAYOUT_ACCOUNT : "has"
    USER ||--o{ FEEDBACK : "writes"

    EVENT ||--o{ TICKET : "issues"
    EVENT ||--o{ FEEDBACK : "receives"
```
