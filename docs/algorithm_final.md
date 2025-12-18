# Section 4.2.2: Algorithms of Major Functionality

This section details the core algorithms governing the Nexus Campus Event System. The logic is presented in human-readable pseudocode to illustrate the data flow and decision-making processes for each major function.

### Algorithm 1: Search and Browse Events
**Logic:** Filters available events based on user preferences and current availability.

```text
Algorithm 1: Search and Browse Events
FUNCTION SEARCH_AND_BROWSE(SearchQuery, SelectedCategory)
    RETRIEVE CurrentDate FROM System
    INITIALIZE ResultsList AS Empty

    RETRIEVE AllEvents FROM EventDatabase

    FOR EACH Event IN AllEvents DO
        IF Event.Date IS LESS THAN CurrentDate THEN
            CONTINUE (Skip Past Event)
        END IF

        IF SelectedCategory IS PROVIDED AND Event.Category IS NOT SelectedCategory THEN
            CONTINUE
        END IF

        IF SearchQuery IS PROVIDED AND (Event.Title OR Event.Description DOES NOT CONTAIN SearchQuery) THEN
            CONTINUE
        END IF

        ADD Event TO ResultsList
    END FOR

    RETURN ResultsList
END FUNCTION
```

### Algorithm 2: RSVP for Event
**Logic:** Manages ticket booking by verifying capacity and handling payment flows for paid events.

```text
Algorithm 2: RSVP for Event
FUNCTION PROCESS_RSVP(EventID, UserID)
    RETRIEVE EventDetails FROM EventDatabase WHERE ID EQUALS EventID
    RETRIEVE ExistingTicket FROM TicketDatabase WHERE EventID EQUALS EventID AND UserID EQUALS UserID

    IF ExistingTicket EXISTS THEN
        RETURN ERROR "User already RSVP'd"
    END IF

    IF EventDetails.CurrentRSVPCount GREATER THAN OR EQUAL TO EventDetails.Capacity THEN
        RETURN ERROR "Event is Full"
    END IF

    IF EventDetails.IsFree IS TRUE THEN
        CREATE NewTicket FOR UserID
        INCREMENT EventDetails.CurrentRSVPCount
        SEND ConfirmationEmail TO User
        RETURN SUCCESS "RSVP Confirmed"
    ELSE
        INITIATE PaymentProcess WITH PaymentGateway
        IF Payment IS SUCCESSFUL THEN
            CREATE NewTicket FOR UserID
            INCREMENT EventDetails.CurrentRSVPCount
            SEND ConfirmationEmail TO User
            RETURN SUCCESS "Ticket Purchased"
        ELSE
            RETURN ERROR "Payment Failed"
        END IF
    END IF
END FUNCTION
```

### Algorithm 3: Submit Feedback
**Logic:** Allows attendees to rate and review events they have participated in.

```text
Algorithm 3: Submit Feedback
FUNCTION SUBMIT_FEEDBACK(EventID, UserID, Rating, Comment)
    RETRIEVE Ticket FROM TicketDatabase WHERE EventID EQUALS EventID AND UserID EQUALS UserID

    IF Ticket IS MISSING OR Ticket.Status IS NOT 'Checked-in' THEN
        RETURN ERROR "User did not attend the event"
    END IF

    VALIDATE Rating IS BETWEEN 1 AND 5

    CREATE NewFeedback
    SET NewFeedback.EventID TO EventID
    SET NewFeedback.UserID TO UserID
    SET NewFeedback.Rating TO Rating
    SET NewFeedback.Comment TO Comment

    SAVE NewFeedback TO FeedbackDatabase
    RETURN SUCCESS "Feedback Submitted"
END FUNCTION
```

### Algorithm 4: Create Event
**Logic:** Enables organizers to submit new events for administrator approval.

```text
Algorithm 4: Create Event
FUNCTION CREATE_NEW_EVENT(EventData, OrganizerID)
    VALIDATE EventData.Title, EventData.Date, EventData.Location ARE NOT NULL

    IF EventData.Date IS LESS THAN CurrentDate THEN
        RETURN ERROR "Invalid Date"
    END IF

    CREATE NewEvent
    SET NewEvent.Details TO EventData
    SET NewEvent.OrganizerID TO OrganizerID
    SET NewEvent.Status TO 'Pending'
    SET NewEvent.CreatedDate TO CurrentDate

    SAVE NewEvent TO EventDatabase
    RETURN SUCCESS "Event Created and Awaiting Approval"
END FUNCTION
```

### Algorithm 5: Emergency Update
**Logic:** Permits organizers to modify critical event details and notifies all registered attendees.

```text
Algorithm 5: Emergency Update
FUNCTION EMERGENCY_UPDATE(EventID, UpdateData)
    RETRIEVE Event FROM EventDatabase WHERE ID EQUALS EventID

    IF Event IS MISSING THEN
        RETURN ERROR "Event Not Found"
    END IF

    UPDATE Event.Location WITH UpdateData.Location
    UPDATE Event.Time WITH UpdateData.Time
    UPDATE Event.Details WITH UpdateData.Details

    SAVE UpdatedEvent TO EventDatabase

    RETRIEVE AttendeeList FROM TicketDatabase WHERE EventID EQUALS EventID

    FOR EACH Attendee IN AttendeeList DO
        SEND Notification TO Attendee WITH MESSAGE "Urgent Update: Event details have changed."
    END FOR

    RETURN SUCCESS "Event Updated and Attendees Notified"
END FUNCTION
```

### Algorithm 6: Guest Check-in
**Logic:** Verifies ticket validity at the event entrance and records attendance.

```text
Algorithm 6: Guest Check-in
FUNCTION GUEST_CHECK_IN(TicketCode, EventID)
    RETRIEVE Ticket FROM TicketDatabase WHERE Code EQUALS TicketCode AND EventID EQUALS EventID

    IF Ticket IS MISSING THEN
        RETURN ERROR "Invalid Ticket"
    END IF

    IF Ticket.Status EQUALS 'Checked-in' THEN
        RETURN ERROR "Guest Already Checked In"
    END IF

    SET Ticket.Status TO 'Checked-in'
    SET Ticket.CheckInTime TO CurrentTime

    SAVE Ticket TO TicketDatabase
    RETURN SUCCESS "Check-in Successful"
END FUNCTION
```

### Algorithm 7: Approve / Reject Event
**Logic:** Facilitates administrative review of pending event submissions.

```text
Algorithm 7: Approve / Reject Event
FUNCTION REVIEW_EVENT(EventID, AdminDecision, RejectionReason)
    RETRIEVE Event FROM EventDatabase WHERE ID EQUALS EventID

    IF Event.Status IS NOT 'Pending' THEN
        RETURN ERROR "Event is not pending review"
    END IF

    IF AdminDecision EQUALS 'Approve' THEN
        SET Event.Status TO 'Approved'
        SEND Notification TO Event.Organizer WITH MESSAGE "Your event has been approved."
    ELSE IF AdminDecision EQUALS 'Reject' THEN
        SET Event.Status TO 'Rejected'
        SET Event.RejectionReason TO RejectionReason
        SEND Notification TO Event.Organizer WITH MESSAGE "Your event was rejected. Reason: " + RejectionReason
    END IF

    SAVE Event TO EventDatabase
    RETURN SUCCESS "Event Review Complete"
END FUNCTION
```

### Algorithm 8: Manage Users
**Logic:** Allows administrators to modify user roles and permissions.

```text
Algorithm 8: Manage Users
FUNCTION PROMOTE_USER(TargetUserID, NewRole)
    RETRIEVE UserProfile FROM UserDatabase WHERE ID EQUALS TargetUserID

    IF UserProfile IS MISSING THEN
        RETURN ERROR "User Not Found"
    END IF

    IF NewRole EQUALS 'Organizer' THEN
        SET UserProfile.Role TO 'Organizer'
        UPDATE UserProfile.Permissions TO Include 'CreateEvent', 'ManageEvent'
    END IF

    SAVE UserProfile TO UserDatabase
    RETURN SUCCESS "User Role Updated Successfully"
END FUNCTION
```
