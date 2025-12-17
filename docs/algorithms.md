# Core Algorithms & System Logic

This document outlines the reverse-engineered logic for the core functionalities of the Nexus Campus Event Management System, derived from the `server/controllers` implementation.

---

## Algorithm 1: Authentication (Login & Registration)

**Goal:** Securely authenticate existing users and register new accounts with specific roles (Student, Organizer), ensuring data integrity.

**Pseudocode:**

```text
FUNCTION Register(name, email, password, role, organization):
  // Input Validation
  IF name OR email OR password OR role is MISSING THEN
    RETURN Error("Missing required registration fields")

  IF role is NOT 'student' AND NOT 'organizer' THEN
    RETURN Error("Invalid role selection")

  // Check for Duplicates
  NORMALIZED_EMAIL = Trim(Lowercase(email))
  IF User with NORMALIZED_EMAIL exists in DB THEN
    RETURN Error("User already exists")

  // Password Security
  GENERATE salt (10 rounds)
  HASHED_PASSWORD = Hash(password, salt)

  // Payload Construction
  USER_PAYLOAD = { name, email: NORMALIZED_EMAIL, password: HASHED_PASSWORD, role }

  IF role IS 'organizer' AND organization IS PROVIDED THEN
    USER_PAYLOAD.organizationName = Trim(organization)

  // Database Action
  CREATE User in DB with USER_PAYLOAD
  RETURN Success("Registration successful")

FUNCTION Login(email, password):
  // User Lookup
  FIND User in DB by email
  IF User NOT FOUND THEN
    RETURN Error("Invalid email or password")

  // Password Verification
  MATCH = Compare(password, User.password)
  IF MATCH is FALSE THEN
    RETURN Error("Invalid email or password")

  // Session Creation
  TOKEN = GenerateJWT(payload: { id: User.id, role: User.role }, secret: ENV.JWT_SECRET, expiry: '30d')

  // Response
  RETURN User Profile (id, name, email, role, preferences) AND TOKEN
```

---

## Algorithm 2: Event Booking (Free vs Paid)

**Goal:** Process event reservations by distinguishing between free events (direct ticket generation) and paid events (payment gateway initialization).

**Pseudocode:**

```text
FUNCTION InitializeRSVP(userId, eventId, email):
  // Validation
  IF userId OR eventId OR email is MISSING THEN
    RETURN Error("Missing required fields")

  FETCH Event by eventId
  IF Event NOT FOUND THEN RETURN Error("Event not found")

  // Check Existing Ticket
  CHECK for Ticket where user=userId AND event=eventId AND status='confirmed'
  IF Ticket EXISTS THEN
    RETURN Error("You already have a ticket")

  // Capacity Check
  COST = Event.price OR Event.registrationFee OR 0
  CAPACITY = Event.capacity
  SOLD = Event.ticketsSold OR Event.rsvpCount

  IF CAPACITY > 0 AND (SOLD + 1) > CAPACITY THEN
    RETURN Error("Event is fully booked")

  // Logic Branch: Free vs Paid
  IF COST EQUALS 0 THEN
    // Free Event Logic
    CREATE Ticket (
      user: userId, event: eventId, status: 'confirmed',
      paymentReference: "FREE-{Timestamp}", amountPaid: 0
    )
    INCREMENT Event.ticketsSold AND Event.rsvpCount
    SEND Email ("Ticket Confirmed")
    RETURN Success (isFree: true, ticketId)

  ELSE
    // Paid Event Logic
    TOTAL_KOBO = COST * 100
    CALLBACK_URL = "{Frontend_Base}/payment/callback"

    // External API Call
    CALL Paystack.InitializeTransaction(
      email: email, amount: TOTAL_KOBO, callback_url: CALLBACK_URL,
      metadata: { userId, eventId, quantity: 1 }
    )

    RETURN Success (isFree: false, authorization_url, reference)
```

---

## Algorithm 3: Payment Verification & Ticket Issuance

**Goal:** Validate the status of a transaction with the payment provider and issue a ticket if the payment was successful.

**Pseudocode:**

```text
FUNCTION VerifyPayment(reference):
  IF reference is MISSING THEN RETURN Error

  // Verify with Provider
  RESPONSE = CALL Paystack.VerifyTransaction(reference)
  IF RESPONSE.status IS NOT 'success' THEN
    RETURN Error("Transaction failed")

  EXTRACT metadata (eventId, userId) FROM RESPONSE

  // Idempotency Check
  IF Ticket with paymentReference == reference EXISTS THEN
    RETURN Success (ticketId: ExistingTicket.id)

  // Duplicate Check
  IF Ticket exists for (user=userId, event=eventId, status='confirmed') THEN
    RETURN Success (ticketId: ExistingTicket.id, alreadyRegistered: true)

  // Fulfillment
  CREATE Ticket (
    event: eventId, user: userId, status: 'confirmed',
    paymentReference: reference, amountPaid: RESPONSE.amount / 100
  )

  INCREMENT Event.ticketsSold AND Event.rsvpCount
  SEND Email ("Payment Receipt")

  RETURN Success (ticketId: NewTicket.id)
```

---

## Algorithm 4: Dashboard Recommendation Engine

**Goal:** Curate a personalized list of events for the user dashboard, prioritizing a "Hero" event, interest-based recommendations, and recent listings.

**Pseudocode:**

```text
FUNCTION GetDashboardData(userId):
  DEFINE Now = CurrentDate
  DEFINE WeekAhead = Now + 7 Days

  // 1. Select Hero Event (Featured or Popular)
  FIND Event WHERE status='approved' AND date >= Now AND isFeatured=true
  IF NOT FOUND THEN
    FIND Event WHERE status='approved' AND date BETWEEN Now AND WeekAhead
    SORT BY rsvpCount DESC, LIMIT 1
  IF NOT FOUND THEN
    FIND Event WHERE status='approved' AND date >= Now
    SORT BY rsvpCount DESC, LIMIT 1

  HERO_ID = HeroEvent.id

  // 2. Select Recommended Events (Personalized)
  FETCH User Interests (if userId provided)

  RECOMMENDED = []
  IF User has Interests THEN
    FIND Events WHERE status='approved' AND date >= Now AND category IN Interests
    SORT BY rsvpCount DESC
    LIMIT 5
    ADD to RECOMMENDED

  // Fill gaps if fewer than 5 recommendations
  IF RECOMMENDED.length < 5 THEN
    EXCLUDE_IDS = [HERO_ID] + RECOMMENDED.ids
    FIND Events WHERE status='approved' AND date >= Now AND id NOT IN EXCLUDE_IDS
    SORT BY rsvpCount DESC
    LIMIT (5 - RECOMMENDED.length)
    APPEND to RECOMMENDED

  FILTER RECOMMENDED to exclude HERO_ID

  // 3. Select Recent Events
  FIND Events WHERE status='approved' AND id != HERO_ID
  SORT BY createdAt DESC
  LIMIT 18

  RETURN { HeroEvent, RecommendedEvents, RecentEvents }
```

---

## Algorithm 5: Guest Notification Constructor

**Goal:** Generate timely notifications for guests based on the proximity of their registered events and ticket status.

**Pseudocode:**

```text
FUNCTION BuildGuestNotifications(tickets, readSet):
  NOTIFICATIONS = []
  NOW = CurrentDate

  FOR EACH ticket IN tickets:
    EVENT = ticket.event
    IF EVENT is INVALID OR status != 'approved' THEN CONTINUE

    // 1. Ticket Confirmation Notification
    IF ticket.createdAt IS VALID THEN
      PUSH {
        type: 'ticket-confirmed',
        message: 'Your ticket is secured.',
        tone: 'success',
        trigger: Ticket Creation Time
      }

    // Calculate Time Difference
    MS_UNTIL_EVENT = EVENT.date - NOW
    MS_SINCE_EVENT = NOW - EVENT.date

    // 2. Event Reminder (Less than 24 hours to go)
    IF MS_UNTIL_EVENT BETWEEN 0 AND 24_Hours THEN
      PUSH {
        type: 'event-reminder',
        headline: 'Happening soon',
        message: 'Starts in less than a day.',
        tone: 'highlight',
        trigger: NOW
      }

    // 3. Upcoming Event (1 to 7 days away)
    ELSE IF MS_UNTIL_EVENT BETWEEN 24_Hours AND 7_Days THEN
      PUSH {
        type: 'event-upcoming',
        headline: 'Upcoming event',
        message: 'Coming up this week.',
        tone: 'info',
        trigger: EVENT.date
      }

    // 4. Post-Event Feedback (Finished within last 3 days)
    IF MS_SINCE_EVENT BETWEEN 0 AND 3_Days THEN
      PUSH {
        type: 'event-complete',
        headline: 'Thanks for joining',
        message: 'Hope you enjoyed the experience.',
        tone: 'default',
        trigger: EVENT.date + 12_Hours
      }

  SORT NOTIFICATIONS by trigger time (Newest First)
  MARK 'isRead' if ID in readSet

  RETURN NOTIFICATIONS
```
