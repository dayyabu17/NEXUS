# Requirements

## Functional Requirements
3.4.3.1 Functional Requirements

User Management (Admin):

Admin login to secure dashboard.

View pending events list.

Approve/Reject events.

Event Management (Organizer):

Organizer login to secure dashboard.

Create events (title, description, date, time, location/map).

Edit/Delete own events.

Submit events for Admin approval.

View own event list and status.

Guest/Student Functionality:

Browse/Search approved public events.

View event details (including map).

RSVP for events.

Pay for tickets (Payment Integration).

Digital Check-in (QR/Button).

Submit feedback (rating/comment) after attending.

Data and Reporting (Organizer):

Track RSVPs and attendee lists.

View guest feedback.

View reports (attendance/revenue).

Notification System:

Automated notifications to Guests (RSVP confirmation, reminder, payment receipt).

Notifications to Organizers (Approval status, new feedback).

## Optional/Value-Added Features
- Global Event Search Palette (`client/src/components/GlobalSearch.jsx`): full-screen command palette with quick links, upcoming previews, and debounced search that routes guests or organizers to the right event detail view.
- Interactive Campus Map Explorer (`client/src/components/GuestMap.jsx` + `client/src/components/LocationPicker.jsx`): Leaflet-powered live map that auto-detects user coordinates, toggles between "Explore" and "My Schedule", and lets organizers pinpoint venues via geocoded search.
- Digital Nexus ID Card (`client/src/components/NexusIDCard.jsx`): 3D animated membership card with QR code generation and share action for fast attendee verification.
- Gamified Achievement Badges (`client/src/components/AchievementBadges.jsx`): Framer Motion badge cabinet that unlocks achievements based on attendance stats to encourage repeat participation.
- Organizer Branding Controls (`client/src/components/OrganizerPreferences.jsx` + `server/controllers/organizerController.js`): Accent palette, custom hex brand color, and avatar ring settings persisted via dedicated preferences endpoints.
- Earnings & Payout Analytics (`client/src/components/OrganizerEarnings.jsx` + `server/controllers/organizerController.js#getOrganizerEarnings`): Revenue trend charts, payout timeline estimates, and recent settlement ledger beyond baseline attendance reporting.
- Admin User & Event Oversight (`client/src/components/UserManagement.jsx` + `server/controllers/adminController.js`): Role reassignment UI, full event inventory views, and hard delete operations extending past approval workflow.
- Guest Notification Inbox (`client/src/components/GuestNotifications.jsx` + `server/routes/eventRoutes.js` guest notification endpoints): In-app notification center with unread filters, mark-all actions, and local storage sync for badge counts.
- Personalized Guest Dashboard (`client/src/components/GuestDashboard.jsx`): Animated hero spotlight, recommendation carousels, and scroll-driven parallax storytelling to elevate browsing beyond simple lists.

## Non-Functional Requirements
3.4.3.2 Non-Functional Requirements

Security: Role-based access (Admin/Organizer), secure payment handling.

Performance: Fast loading times under load.

Usability: Intuitive interface for all users.

Reliability: High uptime (24/7 availability).

Compatibility: Responsive on all major browsers (Chrome, Firefox, Safari) and mobile devices.
