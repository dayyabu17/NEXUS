# Nexus MERN Event Platform – Deep Dive

## Project Architecture

- **Frontend (React + Vite)**: The client (`client/`) renders the event experience, handles route-based views, and interacts with the backend through the shared Axios instance (`src/api/axios.js`). It manages theme control, guest/organizer dashboards, ticket purchase flows, and orchestrates UI state using React hooks and context.
- **Backend (Express + Node.js)**: The server (`server/`) exposes RESTful APIs, enforces authorization (`middleware/authMiddleware.js`), and implements domain logic via modular controllers (e.g., `controllers/organizerController.js`, `controllers/eventController.js`). Routes under `/api/*` marshal requests to the appropriate controllers.
- **Database (MongoDB + Mongoose)**: MongoDB stores users, events, and tickets. Mongoose schemas (`server/models/*.js`) describe data structures and enforce relationships; tickets reference both users and events. Controllers use these models to persist and query domain entities.
- **Workflow**: The frontend calls an endpoint (e.g., `/api/organizer/events`); Express route parses the request, controller executes business logic, uses Mongoose model to read/write the database, and returns JSON to the frontend. The frontend consumes the response to update UI state and feedback.

## Folder Structure

```

NEXUS/
├── EXPLANATION.md             # (Added) Comprehensive walkthrough for final defense
├── organizer_prev.txt         # Historical notes, likely from prior iterations
├── client/                    # React + Tailwind frontend application
│   ├── eslint.config.js       # Frontend linting rules
│   ├── index.html             # SPA entry HTML file
│   ├── package.json           # Client-side dependencies and scripts
│   ├── postcss.config.js      # Tailwind/PostCSS configuration
│   ├── tailwind.config.js     # Tailwind theme/setup (darkMode: 'class')
│   ├── vite.config.js         # Vite bundler configuration
│   ├── public/                # Static assets served directly (images, etc.)
│   └── src/                   # Frontend source code
│       ├── App.css            # Global component styles
│       ├── App.jsx            # Main route map using React Router
│       ├── index.css          # Tailwind base styles + custom CSS
│       ├── main.jsx           # App bootstrap (ReactDOM + ThemeProvider)
│       ├── api/               # Axios instance for API calls
│       ├── assets/            # Icons and static SVGs
│       ├── components/        # Reusable React components (Dashboards, Layouts, etc.)
│       ├── constants/         # Shared constants (accent colors, categories)
│       ├── font/              # Custom font files
│       ├── hooks/             # Custom React hooks (e.g., theme sync)
│       ├── pages/             # Page-level React components (e.g., Guest views)
│       ├── services/          # Frontend service helpers (geolocation)
│       └── utils/             # Client-side utility functions (color helpers)
└── server/                    # Express backend
    ├── index.js               # Express entry point, routes mounting
    ├── package.json           # Backend dependencies and scripts
    ├── seed.js                # Seed script (populate database)
    ├── controllers/           # Request handlers per domain (admin, auth, events, organizer, payment, tickets)
    ├── middleware/            # Authorization middleware (JWT-based)
    ├── models/                # Mongoose schemas for User, Event, Ticket
    ├── public/                # Uploaded assets (e.g., profile pictures)
    ├── routes/                # Express routers (admin, auth, events, organizer, payment, ticket)
    └── utils/                 # Server utilities (file upload config)
```

## Key Workflows

### 1. User Login (Guest/Organizer/Admin)

1. **Frontend Component**: `client/src/components/SignIn.jsx` – renders login form, collects credentials, calls API.
2. **API Service**: Uses `api.post('/auth/login', payload)` from `client/src/api/axios.js`.
3. **Backend Route**: `server/routes/authRoutes.js` → `router.post('/login', loginUser)`.
4. **Controller**: `server/controllers/authController.js` → `loginUser` validates credentials, issues JWT.
5. **Model**: `server/models/User.js` – used via Mongoose to fetch user, compare hashed password.

### 2. Organizer Creates Event

1. **Frontend Component**: `client/src/components/OrganizerCreateEvent.jsx` – handles form state, validates, submits to backend.
2. **API Request**: `api.post('/organizer/events', payload)` with JWT header.
3. **Backend Route**: `server/routes/organizerRoutes.js` → `router.route('/events').post(protect, organizer, createOrganizerEvent)`.
4. **Controller**: `server/controllers/organizerController.js` → `createOrganizerEvent` sanitizes/validates input, persists event.
5. **Model**: `server/models/Event.js` – schema for events, storing registrationFee, capacity, tags, date/time.

### 3. Guest Purchases Ticket / RSVPs

1. **Frontend Component**: `client/src/components/EventDetails.jsx` & `EventCheckoutModal.jsx` – shows event, opens checkout modal.
2. **API Request**: `api.post('/tickets/purchase', payload)` inside checkout component.
3. **Backend Route**: `server/routes/ticketRoutes.js` → `router.post('/purchase', protect, createTicket)`.
4. **Controller**: `server/controllers/ticketController.js` → `createTicket` processes payment metadata/quantity, updates counts.
5. **Model**: `server/models/Ticket.js` – stores user/event refs, payment info, status.

## Complex Logic – Top 3 Functions Explained

### 1. `buildNotifications` (server/controllers/organizerController.js)

```javascript
const buildNotifications = (events, readSet = new Set()) => {
  const notifications = [];

  const pushNotification = (payload) => {
    if (!payload.createdAt) {
      return;
    }
    const notificationId = payload.id || `${payload.eventId}-${payload.type}`;
    notifications.push({
      ...payload,
      id: notificationId,
      isRead: readSet.has(notificationId),
    });
  };

  events.forEach((event) => {
    const basePayload = {
      eventId: event._id,
      eventTitle: event.title,
      imageUrl: event.imageUrl,
    };

    const ticketsSold = event.registrationFee > 0 ? event.rsvpCount || 0 : undefined;
    const rsvpTotal = event.registrationFee > 0 ? undefined : event.rsvpCount || 0;

    if (event.createdAt) {
      const id = `${event._id.toString()}-created`;
      pushNotification({
        ...basePayload,
        id,
        type: 'event-created',
        headline: 'Event created',
        message: 'Your event is awaiting approval.',
        tone: 'success',
        stats:
          ticketsSold !== undefined
            ? { ticketsSold }
            : rsvpTotal !== undefined
              ? { rsvpTotal }
              : undefined,
        createdAt: event.createdAt,
      });
    }

    if (
      event.updatedAt &&
      event.createdAt &&
      event.updatedAt.getTime() !== event.createdAt.getTime()
    ) {
      const id = `${event._id.toString()}-updated-${event.updatedAt.getTime()}`;
      pushNotification({
        ...basePayload,
        id,
        type: 'event-updated',
        headline: 'Event updated',
        message: 'Recent changes were saved successfully.',
        tone: 'info',
        stats:
          ticketsSold !== undefined
            ? { ticketsSold }
            : rsvpTotal !== undefined
              ? { rsvpTotal }
              : undefined,
        createdAt: event.updatedAt,
      });
    }

    const attendeeCount = event.rsvpCount || 0;
    if (attendeeCount > 0) {
      const noun = event.registrationFee > 0 ? 'ticket' : 'attendee';
      const verb = event.registrationFee > 0 ? 'were bought' : "RSVP'd";
      const headline = event.registrationFee > 0 ? 'Ticket sales' : 'New RSVPs';
      const id = `${event._id.toString()}-attendance-${attendeeCount}`;

      pushNotification({
        ...basePayload,
        id,
        type: 'attendance',
        headline,
        message: `${attendeeCount} ${pluralize(attendeeCount, noun, `${noun}s`)} ${verb}`,
        tone: event.registrationFee > 0 ? 'highlight' : 'info',
        stats: event.registrationFee > 0
          ? { ticketsSold: attendeeCount }
          : { rsvpTotal: attendeeCount },
        createdAt: event.updatedAt || event.createdAt,
      });
    }
  });

  return notifications
    .filter((notification) => notification.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt);
};

```

- **Purpose**: Generates organizer-facing notifications summarizing event lifecycle changes and attendance metrics.

- Steps:
  1. Initializes `notifications` array and helper `pushNotification` to enforce ID uniqueness and read tracking.
  2. Iterates over each event to build base payload shared across notification types.
  3. For paid events, calculates `ticketsSold`; for free ones, `rsvpTotal` – used to contextualize stats.
  4. If the event has a `createdAt`, pushes a "created" notification with appropriate stats.
  5. Checks if `updatedAt` diverges from `createdAt` to capture subsequent edits, creating "event updated" entries.
  6. When RSVP count > 0, generates an attendance notification with dynamic phrasing ("tickets" vs. "attendees").
  7. Finally, removes entries missing `createdAt`, sorts descending by timestamp.
- Complexity arises from multiple event states, dynamic messaging, and merging read/unread state.

### 2. `fetchGuests` Hook (client/src/components/OrganizerEventView.jsx)

```javascript
const fetchGuests = useCallback(async () => {
  setGuestLoading(true);
  setGuestError('');

  if (!id) {
    setGuestLoading(false);
    return;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/sign-in');
    setGuestLoading(false);
    return;
  }

  try {
    const response = await api.get(`/organizer/events/${id}/guests`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const tickets = Array.isArray(response.data) ? response.data : [];

    const normalizedGuests = tickets.map((ticket) => ({
      id: ticket._id,
      name: ticket.user?.name || 'Unknown Guest',
      email: ticket.user?.email || ticket.email || 'unknown@nexus.app',
      status: ticket.status || 'confirmed',
      ticketId: ticket._id,
      avatar: ticket.user?.profilePicture || null,
      checkedInAt:
        ticket.status === 'checked-in'
          ? ticket.checkedInAt || ticket.updatedAt || ticket.createdAt || null
          : null,
    }));

    setGuestList(normalizedGuests);
  } catch (err) {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/sign-in');
    } else {
      setGuestError(err?.response?.data?.message || 'Unable to load guests right now.');
    }
  } finally {
    setGuestLoading(false);
  }
}, [id, navigate]);

```

- **Purpose**: Organizer-side logic to pull RSVP data for a specific event and transform it into UI-friendly records.

- Steps:
  1. Sets loading state and clears previous errors.
  2. Guards against missing event ID (e.g., route not ready).
  3. Confirms JWT presence; if absent, redirects to sign-in.
  4. Executes authenticated GET request to backend guests endpoint.
  5. Normalizes the ticket response into objects with fallback names/emails, surfaces status, avatars, and check-in timestamps.
  6. Updates component state with guest array.
  7. Handles unauthorized errors by clearing creds and redirecting; others set error banner.
  8. Always ends by clearing loading flag.
- Complexity lies in the branching for error handling, normalization of nested user references, and ensuring UI reacts gracefully.

### 3. `createOrganizerEvent` (server/controllers/organizerController.js)

```javascript
const createOrganizerEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    locationLatitude,
    locationLongitude,
    category,
    capacity,
    registrationFee,
    imageUrl,
    tags,
    timezone,
    endDate,
    endTime,
  } = req.body;

  if (!title || !description || !date || !location) {
    return res.status(400).json({ message: 'Title, description, date, and location are required.' });
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: 'Invalid event date supplied.' });
  }

  const parsedTagsSource = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',')
      : [];

  const normalizedTags = parsedTagsSource
    .map((tag) => (tag || '').toString().trim())
    .filter(Boolean);

  const normalizedCapacity =
    capacity === undefined || capacity === null || capacity === ''
      ? undefined
      : Number(capacity);

  if (normalizedCapacity !== undefined && Number.isNaN(normalizedCapacity)) {
    return res.status(400).json({ message: 'Capacity must be a valid number.' });
  }

  const normalizedFee =
    registrationFee === undefined || registrationFee === null || registrationFee === ''
      ? 0
      : Number(registrationFee);

  if (Number.isNaN(normalizedFee)) {
    return res.status(400).json({ message: 'Registration fee must be a valid number.' });
  }

  const parseCoordinate = (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  };

  let parsedEndDate;
  if (endDate) {
    const candidate = new Date(endDate);
    if (!Number.isNaN(candidate.getTime())) {
      parsedEndDate = candidate;
    }
  }

  const sanitizedEndTime = typeof endTime === 'string' && endTime.trim().length > 0 ? endTime.trim() : undefined;

  const event = await Event.create({
    title: title.trim(),
    description,
    date: parsedDate,
    location: location.trim(),
    category: category ? category.trim() : undefined,
    capacity: normalizedCapacity,
    registrationFee: normalizedFee,
    imageUrl: imageUrl ? imageUrl.trim() : undefined,
    tags: normalizedTags,
    organizer: req.user._id,
    status: 'pending',
    locationLatitude: parseCoordinate(locationLatitude),
    locationLongitude: parseCoordinate(locationLongitude),
    timezone: typeof timezone === 'string' && timezone.trim().length > 0 ? timezone.trim() : undefined,
    endDate: parsedEndDate,
    endTime: sanitizedEndTime,
  });

  res.status(201).json({
    id: event._id,
    title: event.title,
    status: event.status,
    date: event.date,
    location: event.location,
    rsvpCount: event.rsvpCount || 0,
    registrationFee: event.registrationFee || 0,
    imageUrl: event.imageUrl,
    tags: event.tags,
    category: event.category,
    locationLatitude: event.locationLatitude,
    locationLongitude: event.locationLongitude,
    timezone: event.timezone,
    endDate: event.endDate,
    endTime: event.endTime,
  });
});

```

- **Purpose**: Validates and persists a new event submission from an organizer.

- Steps:
  1. Destructures request payload.
  2. Validates required fields (title, description, date, location) and early-returns with 400 if missing.
  3. Parses and validates ISO date; rejects malformed dates.
  4. Normalizes tags string/array into trimmed list.
  5. Handles optional numeric capacity with conversion and validation.
  6. Normalizes registration fee with fallback to free when empty, ensures numeric.
  7. Defines helper `parseCoordinate` to safely convert lat/lng to numbers or undefined.
  8. Optionally parses end date/time.
  9. Calls `Event.create` with sanitized fields, linking `organizer` to authenticated user, defaulting status to pending.
  10. Returns 201 response with curated event data for the client.
- Complexity stems from numerous optional fields, type conversions, and cross-field validation.

## Defense Q&A

1. **Q:** How does the frontend ensure theme consistency between guest and organizer views?
   **A:** `ThemeProvider` (`client/src/context/ThemeContext.jsx`) toggles `html.dark` based on stored preference; organizer components lock dark styles while guest components add light/dark Tailwind classes.

2. **Q:** What prevents unauthorized users from accessing organizer routes?
   **A:** `protect` middleware verifies JWT, `organizer` middleware checks role before controller execution (`server/middleware/authMiddleware.js`).

3. **Q:** Why does the ticket schema enforce a unique index on `(event, user)`?
   **A:** To prevent duplicate ticket entries per user for the same event, ensuring data integrity on RSVPs/purchases.

4. **Q:** How are dark/light mode styles applied without flashing?
   **A:** `ThemeProvider` writes `dark` class synchronously to `<html>`/`<body>` on mount/localStorage change, and components use Tailwind `dark:` variants for smooth transitions.

5. **Q:** Describe the flow of creating an event from form submission to database write.
   **A:** `OrganizerCreateEvent.jsx` validates -> POST `/organizer/events` -> `createOrganizerEvent` controller validates/sanitizes -> `Event.create` persists -> response triggers UI success and navigation.

6. **Q:** How are guest RSVP lists fetched and normalized for organizer dashboards?
   **A:** `OrganizerEventView.jsx` fetches `/organizer/events/:id/guests`, maps tickets to normalized guest objects (name/email/status/avatar) before rendering the list.

7. **Q:** What strategy is used to compute organizer dashboard notifications?
   **A:** `buildNotifications` iterates events, infers event states (creation/update/attendance), and composes structured notification objects with read tracking.

8. **Q:** How are uploaded profile images served to the client?
   **A:** Backend stores them under `server/public/uploads/profile_pics/`, Express static middleware serves `/public`, and client resolves relative paths to `http://localhost:5000/public...`.

9. **Q:** How does the project ensure consistent accent colors across themes?
   **A:** Accent variables live in CSS custom properties (`index.css`), updated via `applyAccentVariables` (client constant), and referenced via Tailwind extended colors.

10. **Q:** Explain how payment callbacks are handled.
    **A:** Frontend `PaymentCallback.jsx` reads query params, calls `/payment/verify/:reference`, backend `paymentController` verifies via Paystack API, updates ticket status, and responds to update UI state.
