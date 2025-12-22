<div align="center">

  <h1>
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=2E86C1&center=true&vCenter=true&width=600&lines=Campus+Event+Management+and+Notification+System;Full+Stack+Application;Built+with+MERN+Stack" alt="Typing SVG" />
  </h1>

  <p>
    <b>A comprehensive platform designed to streamline the management of campus events.</b>
  </p>

  <p>
    <a href="https://nexus-6753.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/LIVE_DEMO-Visit_Site-2ea44f?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/license-ISC-blue?style=for-the-badge" alt="License" />
  </p>

  <br />

  <!-- Placeholder for App Demo/Screenshot -->
  <img src="https://via.placeholder.com/800x400?text=Application+Dashboard+Preview" alt="App Screenshot" width="800" />

  <br />
</div>

<br />

## 📖 Project Overview

**Campus Event Management and Notification System** (Nexus) is a robust full-stack solution tailored for university environments. It bridges the gap between students, event organizers, and administrators by providing a seamless interface for event discovery, ticketing, and management.

Whether you're a student looking for the next big hackathon or an organizer managing a seminar, this system handles everything from **RSVPs** to **QR Code Check-ins**.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🔐 Role-Based Access** | Secure authentication for Students, Organizers, and Admins using JWT. |
| **🎫 Smart Ticketing** | Integrated **Paystack** payments for paid events and instant RSVP for free ones. |
| **📱 QR Check-in** | Organizers can scan attendee QR codes for real-time validation and attendance tracking. |
| **🗺️ Interactive Maps** | Location visualization using **Leaflet** to help attendees find venues easily. |
| **📊 Admin Dashboard** | Comprehensive oversight tools for approving events and managing user roles. |
| **📧 Notifications** | Automated email alerts for registration confirmations and event reminders. |
| **🎨 Modern UI/UX** | Built with **Tailwind CSS** and **Framer Motion** for a fluid, responsive experience. |

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white)

### Backend
![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-007ACC?style=flat&logo=mail.ru&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-F28D1A?style=flat&logo=files&logoColor=white)

### Database & Payments
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Paystack](https://img.shields.io/badge/Paystack-0BA4DB?style=flat&logo=visa&logoColor=white)

</div>

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **npm** or **yarn**
*   **MongoDB** (Local instance or Atlas URI)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/NEXUS.git
cd NEXUS
```

#### 2. Backend Setup
Navigate to the server directory and install dependencies.
```bash
cd server
npm install
```

Create a `.env` file in the `server/` root and configure the following:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus_db
JWT_SECRET=your_super_secure_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=no-reply@nexus.com
EMAIL_FROM_NAME=Nexus_Events

# Optional
PAYMENT_DEBUG=true
```

Start the server (with seeding optional):
```bash
# Seed the database (Optional: clears data and adds defaults)
npm run seed

# Start development server
npm run dev
```

#### 3. Frontend Setup
Open a new terminal tab and navigate to the client directory.
```bash
cd client
npm install
```

Start the React development server:
```bash
npm run dev
```

🚀 **The app should now be running at** `http://localhost:5173`

---

## 📂 Project Structure

```bash
/
├── 📂 client/              # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 api/         # Axios API configurations
│   │   ├── 📂 components/  # Reusable UI Components
│   │   ├── 📂 context/     # Global State (Auth, Theme)
│   │   ├── 📂 pages/       # Application Routes/Views
│   │   └── ...
├── 📂 server/              # Node.js Backend
│   ├── 📂 controllers/     # Route Logic
│   ├── 📂 models/          # Mongoose Schemas
│   ├── 📂 routes/          # API Endpoints
│   ├── 📂 utils/           # Helpers (Email, Uploads)
│   └── ...
├── 📂 docs/                # Documentation & UMLs
└── 📄 README.md            # You are here!
```

---

## 🔮 Future Roadmap

We are constantly improving! Here is what's coming next:

- [ ] 📱 **Mobile Application** (React Native) for easier access on the go.
- [ ] 🤖 **AI Recommendations** based on user interests and past event history.
- [ ] 📅 **Calendar Sync** (Google/Outlook/iCal) for event reminders.
- [ ] 💬 **Real-time Chat** functionality for event Q&A sessions.

---

<div align="center">

  ### 👤 Author

  **Built with ❤️ by Usman Dayyabu**

  <a href="https://github.com/dayyabu17/NEXUS">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username=dayyabu17&repo=NEXUS&theme=radical&hide_border=true" alt="NEXUS Repo Stats" />
  </a>

</div>
