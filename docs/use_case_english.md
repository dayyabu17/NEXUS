# Use Case Descriptions

This document outlines the core user interactions with the Nexus system, focusing on the interface flow from the user's perspective.

## 1. Student Registration
**Actor:** Student (Guest)
**Description:** A new student signs up for a Nexus account.
**Trigger:** User navigates to the Sign Up page.
**Normal Course:**
1. **User action:** User enters their full name, email address, password, and confirms the password.
2. **User action:** User ensures the "Guest" tab is selected (default).
3. **User action:** User clicks the "Continue" button.
4. **System response:** The system validates the input, creates the account, and redirects the user to the Sign In page.
**Alternative Course:**
*   If the passwords do not match, the system displays a red error message: "Passwords do not match." below the input fields.
*   If the email is already in use or another error occurs, a red error banner appears with the specific error message.

## 2. Browsing the Dashboard
**Actor:** Guest (Student)
**Description:** A student explores featured and recommended events on their dashboard.
**Trigger:** User logs in and lands on the Dashboard page.
**Normal Course:**
1. **System response:** The page loads displaying a large "Spotlight Event" or "Featured Event" banner at the top, followed by a category filter bar and a "Recommended for You" section.
2. **User action:** User clicks on the "Explore Details" button on the Spotlight Event banner.
3. **System response:** The system navigates to the detailed view of that specific event.
4. **User action:** User clicks on a category chip (e.g., "Music", "Tech") in the sticky filter bar.
5. **System response:** The system filters the visible events to match the selected category (visual update).
6. **User action:** User clicks "View details" on an event card in the "Recommended for You" list.
7. **System response:** The system navigates to the detailed page for that event.

## 3. Booking a Ticket
**Actor:** Guest (Student)
**Description:** A student reserves a ticket for a specific event.
**Trigger:** User is viewing an Event Details page.
**Normal Course:**
1. **User action:** User clicks the "Get Ticket" button in the ticket sidebar.
2. **System response:** A "Confirm RSVP" modal appears, showing the event title, date, price (or Free), and total amount.
3. **User action:** User clicks the "Confirm & Pay" (or "Confirm RSVP" for free events) button.
4. **System response:** The button text changes to "Connecting to Paystack..." (if paid) or processes the request.
5. **System response:**
    *   **For Free Events:** A success message "RSVP confirmed! Redirecting to your tickets..." appears, and the system redirects the user to the "My Tickets" page.
    *   **For Paid Events:** The system redirects the user to the Paystack payment page.
**Alternative Course:**
*   If the user already has a ticket, the "Get Ticket" button in the sidebar reads "You’re attending" and is disabled.
*   If the user tries to book a duplicate ticket via the modal, a red error message "You already have a ticket for this event." appears.

## 4. Creating an Event
**Actor:** Organizer
**Description:** An organizer designs and submits a new event.
**Trigger:** Organizer navigates to the Create Event page.
**Normal Course:**
1. **System response:** The page displays a "Design a new experience" form with sections for Title, Schedule, Location, Options, and Extras.
2. **User action:** User clicks on the "Untitled Event" placeholder text.
3. **System response:** An overlay opens for the user to enter the event title.
4. **User action:** User enters the title and confirms.
5. **User action:** User clicks on the schedule section (Date/Time).
6. **System response:** An overlay opens with a calendar and time picker.
7. **User action:** User selects the start/end dates and times, then confirms.
8. **User action:** User clicks on the location section and enters the address.
9. **User action:** User clicks on the options section to set capacity and ticket price (or mark as free).
10. **User action:** User clicks "Create event".
11. **System response:** The button displays "Creating…", and upon success, a message overlay appears: "Event created successfully...".
**Alternative Course:**
*   If mandatory fields are missing or invalid, a red error box appears with a description of the issue.
