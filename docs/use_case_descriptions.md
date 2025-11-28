# Use Case Descriptions

## Authentication

### Use Case Name: Sign Up
**Priority:** High
**Actor:** Guest / Prospective Organizer
**Description:** Allows a new user to register an account with the system, selecting their role (Guest or Organizer).
**Trigger:** User clicks "Sign Up" on the Auth page.
**Preconditions:** User is not currently logged in.
**Normal Course:**
1. User enters name, email, and password.
2. User selects role (Guest or Organizer).
3. If Organizer, user enters Organization Name.
4. User clicks "Continue".
5. Frontend sends POST request to `/api/auth/register` (implied, or seed logic). *Note: Code review shows `server/seed.js` for creation, but `SignUp.jsx` exists. Assuming standard implementation based on `SignUp.jsx` UI.*
6. System creates new User document in database.
7. System returns success response.
8. User is redirected to Sign In page.
**Alternative Course:**
1. User enters existing email.
2. System returns "User already exists" error.
3. Frontend displays error message.
**Post Conditions:** New user account exists in MongoDB.
**Exceptions:** Database connection error, Validation error.

### Use Case Name: Sign In
**Priority:** High
**Actor:** User (Guest, Organizer, Admin)
**Description:** Authenticates a user and issues a JWT for session management.
**Trigger:** User clicks "Continue" on Sign In form.
**Preconditions:** User has a registered account.
**Normal Course:**
1. User enters email and password.
2. Frontend sends POST request to `/api/auth/login`.
3. Backend finds user by email.
4. Backend compares hashed password.
5. Backend generates JWT token.
6. Backend responds with user details and token.
7. Frontend stores token in localStorage.
8. Frontend redirects user to role-specific dashboard.
**Alternative Course:**
1. User enters incorrect password.
2. Backend returns 400 "Invalid email or password".
3. Frontend displays error alert.
**Post Conditions:** User is authenticated; `req.user` is available in protected routes.
**Exceptions:** 500 Server Error.

---

## Event Management (Organizer)

### Use Case Name: Create Event
**Priority:** High
**Actor:** Organizer
**Description:** Allows an organizer to propose a new event with detailed metadata.
**Trigger:** Organizer submits the "Create Event" form.
**Preconditions:** User is logged in as Organizer.
**Normal Course:**
1. Organizer fills in title, description, date, time, location, category, capacity, and price.
2. Organizer may upload a cover image or add tags.
3. Organizer clicks "Create event".
4. Frontend sends POST request to `/api/organizer/events`.
5. Backend validates required fields.
6. Backend creates Event document with status 'pending'.
7. Backend sends 201 Created response.
8. Frontend redirects to Event List.
**Alternative Course:**
1. Organizer leaves required field (e.g., location) blank.
2. Backend returns 400 Bad Request.
3. Frontend displays "Please fill out all required fields" error.
**Post Conditions:** Event exists in database with 'pending' status; visible to Admin.
**Exceptions:** Invalid date format, Database error.

### Use Case Name: View Organizer Dashboard
**Priority:** Medium
**Actor:** Organizer
**Description:** Provides an overview of performance metrics, upcoming events, and notifications.
**Trigger:** Organizer navigates to `/organizer/dashboard`.
**Preconditions:** User is logged in as Organizer.
**Normal Course:**
1. Frontend requests `/api/organizer/dashboard`.
2. Backend calculates total RSVPs, revenue, and active events.
3. Backend fetches recent activities/notifications.
4. Backend returns JSON with stats and lists.
5. Frontend renders statistics cards and charts.
**Alternative Course:** None.
**Post Conditions:** Dashboard data is displayed.
**Exceptions:** 401 Unauthorized (if token expired).

---

## Event Discovery & Ticketing (Guest)

### Use Case Name: RSVP / Purchase Ticket
**Priority:** High
**Actor:** Guest
**Description:** Allows a guest to book a spot for an event. Handles both free RSVPs and paid ticket processing via Paystack.
**Trigger:** Guest clicks "Get Ticket" on Event Details page.
**Preconditions:** Guest is logged in. Event has available capacity.
**Normal Course:**
1. Guest selects ticket quantity in modal.
2. Guest clicks "Confirm".
3. Frontend sends POST to `/api/payment/rsvp/initialize`.
4. **If Free:** Backend creates Ticket immediately and updates event counts. Returns success.
5. **If Paid:** Backend initializes Paystack transaction and returns authorization URL.
6. Frontend redirects user to Paystack checkout.
7. User completes payment.
8. Paystack redirects to `/payment/callback`.
9. Frontend calls `/api/payment/rsvp/verify` to confirm payment and generate ticket.
**Alternative Course:**
1. Event is fully booked.
2. Backend returns 400 "Event is fully booked".
3. Frontend displays error message.
**Post Conditions:** Ticket document created; Event `ticketsSold`/`rsvpCount` incremented.
**Exceptions:** Payment gateway failure, Database transaction error.

### Use Case Name: View My Tickets
**Priority:** Medium
**Actor:** Guest
**Description:** Displays a digital wallet of all purchased/RSVP'd tickets.
**Trigger:** Guest navigates to "My Tickets".
**Preconditions:** Guest is logged in.
**Normal Course:**
1. Frontend requests `/api/tickets/my-tickets`.
2. Backend queries Ticket collection for user ID.
3. Backend populates Event details for each ticket.
4. Backend returns list of tickets.
5. Frontend renders ticket cards with QR codes (flippable).
**Alternative Course:**
1. User has no tickets.
2. Frontend displays "No tickets yet" empty state.
**Post Conditions:** User views their tickets.
**Exceptions:** 401 Unauthorized.

---

## Administration

### Use Case Name: Approve/Reject Event
**Priority:** High
**Actor:** Admin
**Description:** Admin reviews pending events and decides whether to publish them.
**Trigger:** Admin clicks "Approve" or "Reject" on Event Details page.
**Preconditions:** Admin is logged in. Event status is 'pending'.
**Normal Course:**
1. Admin views event details.
2. Admin clicks "Approve".
3. Frontend sends PUT request to `/api/admin/events/:id/status` with status='approved'.
4. Backend updates Event document.
5. Backend returns success message.
6. Frontend updates UI to show "APPROVED" badge.
**Alternative Course:**
1. Admin clicks "Reject".
2. System updates status to 'rejected'.
3. Event remains hidden from public feeds.
**Post Conditions:** Event status is updated. If approved, event appears in Guest feeds.
**Exceptions:** 404 Event Not Found.

### Use Case Name: View Admin Dashboard
**Priority:** Medium
**Actor:** Admin
**Description:** Shows high-level system statistics and items requiring attention.
**Trigger:** Admin logs in or navigates to `/admin/dashboard`.
**Preconditions:** Admin is logged in.
**Normal Course:**
1. Frontend requests `/api/admin/stats` and `/api/admin/events/pending`.
2. Backend counts total users, events, and pending approvals.
3. Backend queries for events with `status: 'pending'`.
4. Frontend displays stat cards and a table of pending events.
**Alternative Course:** None.
**Post Conditions:** Admin sees current system state.
**Exceptions:** 403 Forbidden (if non-admin tries to access).
