# Core System Algorithms

This document outlines the core algorithms used in the Nexus Campus Event Management System, presented in strict pseudocode format.

## 1. Authentication: Login Logic
**Goal:** Validate user credentials and issue a secure access token.

```text
FUNCTION LOGIN_USER(EMAIL, PASSWORD)
   INITIALIZE USER = DB_FIND(USER_COLLECTION, {email: EMAIL})
   IF USER IS NULL THEN
       RETURN ERROR "Invalid email or password"
   END IF

   INITIALIZE IS_MATCH = BCRYPT_COMPARE(PASSWORD, USER.PASSWORD)
   IF IS_MATCH IS FALSE THEN
       RETURN ERROR "Invalid email or password"
   END IF

   INITIALIZE TOKEN = JWT_SIGN({id: USER.ID, role: USER.ROLE})
   RETURN { USER_DETAILS, TOKEN }
END FUNCTION
```

## 2. Smart Event Booking: initializeRSVP Logic
**Goal:** Handle event registration, capacity checks, and initiate payment if necessary.

```text
FUNCTION INITIALIZE_RSVP(USER_ID, EVENT_ID, EMAIL)
   INITIALIZE EVENT = DB_FIND(EVENT_COLLECTION, EVENT_ID)
   IF EVENT IS NULL THEN
       RETURN ERROR "Event not found"
   END IF

   INITIALIZE EXISTING_TICKET = DB_FIND(TICKET_COLLECTION, {user: USER_ID, event: EVENT_ID, status: 'confirmed'})
   IF EXISTING_TICKET IS NOT NULL THEN
       RETURN ERROR "You already have a ticket"
   END IF

   INITIALIZE CAPACITY = EVENT.CAPACITY
   INITIALIZE CURRENT_SOLD = EVENT.TICKETS_SOLD + EVENT.RSVP_COUNT
   IF CAPACITY > 0 AND (CURRENT_SOLD + 1) > CAPACITY THEN
       RETURN ERROR "Event is fully booked"
   END IF

   INITIALIZE COST = EVENT.PRICE OR EVENT.REGISTRATION_FEE
   IF COST EQUALS 0 THEN
       INITIALIZE TICKET = DB_CREATE(TICKET_COLLECTION, {user: USER_ID, event: EVENT_ID, status: 'confirmed', paymentReference: 'FREE'})
       CALL UPDATE_EVENT_SALES(EVENT, 1)
       CALL SEND_NOTIFICATION_EMAIL(EMAIL, "Ticket Confirmed")
       RETURN { success: TRUE, isFree: TRUE, ticketId: TICKET.ID }
   ELSE
       INITIALIZE AMOUNT_KOBO = COST * 100
       INITIALIZE PAYSTACK_RESP = CALL PAYSTACK_API_INITIALIZE(EMAIL, AMOUNT_KOBO, METADATA={USER_ID, EVENT_ID})
       RETURN { success: TRUE, isFree: FALSE, authorization_url: PAYSTACK_RESP.URL, reference: PAYSTACK_RESP.REF }
   END IF
END FUNCTION
```

## 3. Payment Verification: verifyPayment Logic
**Goal:** Verify transaction status with Paystack and issue a ticket upon success.

```text
FUNCTION VERIFY_PAYMENT(REFERENCE)
   IF REFERENCE IS NULL THEN
       RETURN ERROR "Reference is required"
   END IF

   INITIALIZE API_RESP = CALL PAYSTACK_API_VERIFY(REFERENCE)
   IF API_RESP.STATUS IS NOT 'success' THEN
       RETURN ERROR "Transaction failed"
   END IF

   INITIALIZE METADATA = API_RESP.DATA.METADATA
   INITIALIZE EVENT_ID = METADATA.EVENT_ID
   INITIALIZE USER_ID = METADATA.USER_ID
   IF EVENT_ID IS NULL OR USER_ID IS NULL THEN
       RETURN ERROR "Payment metadata is incomplete"
   END IF

   INITIALIZE EXISTING_TICKET = DB_FIND(TICKET_COLLECTION, {paymentReference: REFERENCE})
   IF EXISTING_TICKET IS NOT NULL THEN
       RETURN { success: TRUE, ticketId: EXISTING_TICKET.ID }
   END IF

   INITIALIZE EXISTING_CONFIRMED = DB_FIND(TICKET_COLLECTION, {event: EVENT_ID, user: USER_ID, status: 'confirmed'})
   IF EXISTING_CONFIRMED IS NOT NULL THEN
       RETURN { success: TRUE, ticketId: EXISTING_CONFIRMED.ID, alreadyRegistered: TRUE }
   END IF

   INITIALIZE NEW_TICKET = DB_CREATE(TICKET_COLLECTION, {event: EVENT_ID, user: USER_ID, reference: REFERENCE, status: 'confirmed'})
   CALL DB_UPDATE(EVENT_COLLECTION, EVENT_ID, {INCREMENT: {ticketsSold: 1, rsvpCount: 1}})
   CALL SEND_NOTIFICATION_EMAIL(USER_EMAIL, "Payment Receipt")
   RETURN { success: TRUE, ticketId: NEW_TICKET.ID }
END FUNCTION
```

## 4. Recommendation Engine: getDashboardData Logic
**Goal:** curate a personalized list of events including a Hero event, recommended matches, and popular fallbacks.

```text
FUNCTION GET_DASHBOARD_DATA(USER_ID)
   INITIALIZE NOW = GET_CURRENT_DATE()
   INITIALIZE WEEK_AHEAD = NOW + 7 DAYS

   INITIALIZE HERO_EVENT = DB_FIND_ONE(EVENT_COLLECTION, {status: 'approved', date >= NOW, isFeatured: TRUE})
   IF HERO_EVENT IS NULL THEN
       HERO_EVENT = DB_FIND_ONE(EVENT_COLLECTION, {status: 'approved', date >= NOW, date <= WEEK_AHEAD}, SORT BY rsvpCount DESC)
   END IF
   IF HERO_EVENT IS NULL THEN
       HERO_EVENT = DB_FIND_ONE(EVENT_COLLECTION, {status: 'approved', date >= NOW}, SORT BY rsvpCount DESC)
   END IF

   INITIALIZE INTERESTS = []
   IF USER_ID IS NOT NULL THEN
       INITIALIZE USER = DB_FIND(USER_COLLECTION, USER_ID)
       INTERESTS = USER.INTERESTS
   END IF

   INITIALIZE RECOMMENDED_EVENTS = []
   IF INTERESTS IS NOT EMPTY THEN
       RECOMMENDED_EVENTS = DB_FIND(EVENT_COLLECTION, {status: 'approved', date >= NOW, category IN INTERESTS}, LIMIT 5, SORT BY rsvpCount DESC)
   END IF

   IF LENGTH(RECOMMENDED_EVENTS) < 5 THEN
       INITIALIZE EXCLUDE_IDS = [HERO_EVENT.ID] + MAP(RECOMMENDED_EVENTS, ID)
       INITIALIZE REMAINING_COUNT = 5 - LENGTH(RECOMMENDED_EVENTS)
       INITIALIZE GENERAL_EVENTS = DB_FIND(EVENT_COLLECTION, {status: 'approved', date >= NOW, ID NOT IN EXCLUDE_IDS}, LIMIT REMAINING_COUNT, SORT BY rsvpCount DESC)
       RECOMMENDED_EVENTS = CONCAT(RECOMMENDED_EVENTS, GENERAL_EVENTS)
   END IF

   IF HERO_EVENT IS NOT NULL THEN
       FILTER RECOMMENDED_EVENTS WHERE ID != HERO_EVENT.ID
   END IF

   INITIALIZE RECENT_EVENTS = DB_FIND(EVENT_COLLECTION, {status: 'approved', ID != HERO_EVENT.ID}, LIMIT 18, SORT BY createdAt DESC)
   RETURN { heroEvent: HERO_EVENT, recommendedEvents: RECOMMENDED_EVENTS, recentEvents: RECENT_EVENTS }
END FUNCTION
```

## 5. Notification Builder: buildGuestNotifications Logic
**Goal:** Generate notifications for guests based on ticket status and event proximity.

```text
FUNCTION BUILD_GUEST_NOTIFICATIONS(TICKETS)
   INITIALIZE NOTIFICATIONS = []
   INITIALIZE NOW = GET_CURRENT_DATE()

   FOR EACH TICKET IN TICKETS DO
       INITIALIZE EVENT = TICKET.EVENT
       IF EVENT.STATUS IS NOT 'approved' THEN
           CONTINUE
       END IF

       IF TICKET.CREATED_AT IS VALID THEN
           ADD {type: 'ticket-confirmed', message: 'Your ticket is secured'} TO NOTIFICATIONS
       END IF

       INITIALIZE MS_UNTIL_EVENT = EVENT.DATE - NOW
       IF MS_UNTIL_EVENT >= 0 AND MS_UNTIL_EVENT <= 24 HOURS THEN
           ADD {type: 'event-reminder', message: 'Happening soon'} TO NOTIFICATIONS
       ELSE IF MS_UNTIL_EVENT > 24 HOURS AND MS_UNTIL_EVENT <= 7 DAYS THEN
           ADD {type: 'event-upcoming', message: 'Upcoming event'} TO NOTIFICATIONS
       END IF

       INITIALIZE MS_SINCE_EVENT = NOW - EVENT.DATE
       IF MS_SINCE_EVENT >= 0 AND MS_SINCE_EVENT <= 3 DAYS THEN
           ADD {type: 'event-complete', message: 'Thanks for joining'} TO NOTIFICATIONS
       END IF
   END FOR

   SORT NOTIFICATIONS BY CREATED_AT DESC
   RETURN NOTIFICATIONS
END FUNCTION
```
