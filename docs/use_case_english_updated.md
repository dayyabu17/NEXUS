# System Use Cases (Plain English)

This document outlines the core user workflows for the Nexus Campus Event Management System. It describes the user interface experience—what users see, click, and type—without referencing technical implementation details.

## Student / Guest Use Cases

### 1. Search and Browse Events
**Use Case Name:** Search and Browse Events
**Actor:** Student / Guest
**Priority:** High
**Description:** A student finds events by scrolling through recommendations, selecting categories, or using the search bar.
**Trigger:** User lands on the Guest Dashboard page.
**Preconditions:** The user is logged in, and the dashboard has loaded.
**Normal Course:**
1. **User Action:** The user scrolls down to the "Recommended for You" section to view event cards.
2. **System Response:** The system displays a horizontal list of event cards, each showing an image, title, date, and location.
3. **User Action:** The user clicks a category chip (e.g., "Academic", "Social") under "Browse by category".
4. **System Response:** The event list updates to show only events matching the selected category.
5. **User Action:** The user clicks the search icon in the navigation bar.
6. **System Response:** A global search modal opens with a text input field.
7. **User Action:** The user types a keyword (e.g., "Concert") and presses Enter.
8. **System Response:** The system displays a list of events matching the keyword.

**Alternative Course:**
*   **Clear Search:** If the user clears the search input, the system removes the filters and shows the default event feed.

**Exceptions:**
*   **No Results:** If no events match the search or category, the system displays a "No events found" message with a suggestion to try different keywords.
*   **Network Error:** If the internet connection is lost, a red "Network Error" banner appears at the top of the screen.

**Post Conditions:** The user sees a curated list of events relevant to their interests or search terms.

---

### 2. RSVP for Event
**Use Case Name:** RSVP for Event
**Actor:** Student / Guest
**Priority:** High
**Description:** A student books a ticket for an event and receives a confirmation.
**Trigger:** User clicks on an event card from the Dashboard.
**Preconditions:** The user is viewing the Event Details page.
**Normal Course:**
1. **User Action:** The user clicks the "Get Ticket" button in the sidebar.
2. **System Response:** The "Confirm RSVP" modal appears, displaying the event title, date, price, and total amount.
3. **User Action:** The user reviews the details and clicks the "Confirm & Pay" (or "Confirm RSVP" for free events) button.
4. **System Response:** The modal shows a loading state (e.g., "Connecting to Paystack..." or processing).
5. **System Response:** A success message "RSVP confirmed! Redirecting to your tickets..." appears, and the user is redirected to the My Tickets page.

**Alternative Course:**
*   **Cancel RSVP:** If the user clicks the "X" or "Cancel" button in the modal, the modal closes, and no ticket is booked.

**Exceptions:**
*   **Payment Failure:** If the payment fails, the system displays an error message "Unable to process payment" in the modal.
*   **Already Registered:** If the user already has a ticket, the system disables the "Get Ticket" button and shows "You already have a ticket".

**Post Conditions:** The user possesses a valid ticket for the event, visible in the "My Tickets" section.

---

### 3. Submit Feedback
**Use Case Name:** Submit Feedback
**Actor:** Student / Guest
**Priority:** Low
**Description:** A student rates and reviews an event they attended.
**Trigger:** User views the Event Details page for a past event they attended.
**Preconditions:** The event has started or finished, and the user holds a valid ticket.
**Normal Course:**
1. **User Action:** The user locates the "Share your feedback" panel on the Event Details page.
2. **User Action:** The user selects a star rating (1-5) from the dropdown menu.
3. **User Action:** The user types a review in the "Message" text box.
4. **User Action:** The user clicks the "Submit feedback" button.
5. **System Response:** The button changes to "Submitting...", then a green success message "Feedback saved. Thank you!" appears within the panel.

**Alternative Course:**
*   **Partial Input:** If the user selects a rating but leaves the message empty (and it's optional), the system accepts the rating.

**Exceptions:**
*   **Short Message:** If the message is too short, the system shows an error "Feedback must be at least 5 characters long."

**Post Conditions:** The feedback is recorded and displayed in the system.

---

## Organizer Use Cases

### 4. Create Event
**Use Case Name:** Create Event
**Actor:** Organizer
**Priority:** High
**Description:** An organizer fills out a multi-step form to publish a new event.
**Trigger:** User clicks the "Create Event" button or navigates to the Create Event page.
**Preconditions:** The user is logged in as an Organizer.
**Normal Course:**
1. **User Action:** The user types the event name in the "Title" field.
2. **User Action:** The user uploads a cover image by clicking the upload area.
3. **System Response:** The uploaded image appears as the event preview.
4. **User Action:** The user selects the date and time using the schedule picker.
5. **User Action:** The user enters location details, capacity, and ticket price in the respective fields.
6. **User Action:** The user clicks the "Create event" button.
7. **System Response:** A success notification appears: "Event created successfully! Pending approval."

**Alternative Course:**
*   **Missing Fields:** If required fields are empty, the system highlights them in red and prevents submission.

**Exceptions:**
*   **Submission Error:** If the server is unreachable, a "Failed to create event" error message appears.

**Post Conditions:** The event appears in the pending state on the screen, awaiting approval.

---

### 5. Emergency Update
**Use Case Name:** Emergency Update
**Actor:** Organizer
**Priority:** Medium
**Description:** An organizer edits details of an existing event, such as the venue or time.
**Trigger:** User clicks the edit pencil icon on an event card or details page.
**Preconditions:** The organizer is viewing their event dashboard or specific event details.
**Normal Course:**
1. **User Action:** The user clicks the edit pencil icon next to the event details.
2. **System Response:** The event details become editable fields (or an edit modal opens).
3. **User Action:** The user changes the "Location" or "Time" field to the new value.
4. **User Action:** The user clicks the "Save Changes" button.
5. **System Response:** A green "Success" notification appears, confirming the update.

**Alternative Course:**
*   **Discard Changes:** If the user clicks "Cancel", the fields revert to their original values.

**Exceptions:**
*   **Update Failed:** If the system cannot save the change, an error message "Could not update event" is displayed.

**Post Conditions:** The event details are visually updated on the screen.

---

### 6. Guest Check-in
**Use Case Name:** Guest Check-in
**Actor:** Organizer
**Priority:** Medium
**Description:** An organizer marks a guest as attended from the guest list.
**Trigger:** User navigates to the "Guests" tab of a specific event.
**Preconditions:** The event has started, and the guest list is loaded.
**Normal Course:**
1. **User Action:** The user finds the guest's name in the "Guest list".
2. **User Action:** The user clicks the "Mark checked in" button next to the guest's name.
3. **System Response:** The button text changes to "Updating...", then to "Undo", and the status label changes to a green "Checked in".

**Alternative Course:**
*   **Undo Check-in:** If the user clicks "Undo", the status reverts to "Not checked in" (or the button reverts to "Mark checked in").

**Exceptions:**
*   **Sync Error:** If the check-in fails, the button reverts to its previous state, and an error message appears.

**Post Conditions:** The guest's status on the list updates to "Checked In".

---

## Admin Use Cases

### 7. Approve / Reject Event
**Use Case Name:** Approve / Reject Event
**Actor:** Admin
**Priority:** High
**Description:** An admin reviews a pending event and decides whether to publish it.
**Trigger:** User logs in and views the Admin Dashboard.
**Preconditions:** There are events in the "Pending Events for Approval" list.
**Normal Course:**
1. **User Action:** The user clicks "View Details" on a pending event in the list.
2. **System Response:** The system navigates to the Admin Event Details page.
3. **User Action:** The user reviews the details and clicks the green "Approve" button.
4. **System Response:** A confirmation dialog "Are you sure you want to approve this event?" appears.
5. **User Action:** The user clicks "OK" or "Confirm".
6. **System Response:** A success alert "Event approved successfully!" appears, and the user is redirected to the dashboard.

**Alternative Course:**
*   **Reject Event:** If the user clicks the red "Reject" button, confirms the dialog, the event status changes to Rejected.

**Exceptions:**
*   **Action Failed:** If the approval request fails, an error message is displayed.

**Post Conditions:** The event card in the list updates to show an "Approved" badge, or it is removed from the pending list.

---

### 8. Manage Users
**Use Case Name:** Manage Users
**Actor:** Admin
**Priority:** Medium
**Description:** An admin searches for a user and changes their system role.
**Trigger:** User clicks on "User Management" in the admin navigation.
**Preconditions:** The User Management page is loaded.
**Normal Course:**
1. **User Action:** The user types a name or email into the search bar "Search by name or email".
2. **System Response:** The user table filters to show matching users.
3. **User Action:** The user clicks the role dropdown menu (e.g., showing "Student") for a specific user.
4. **User Action:** The user selects "Organizer" from the dropdown.
5. **System Response:** The dropdown updates to show "Organizer", and the change is saved automatically (or a success indicator appears).

**Alternative Course:**
*   **Clear Search:** If the user clears the search bar, the list shows all users again.

**Exceptions:**
*   **Update Error:** If the role change fails, the dropdown reverts to the previous role, and an error message is shown.

**Post Conditions:** The user's role is updated in the list.
