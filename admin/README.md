# CampusFlow - Admin Panel

This is the web-based admin panel for CampusFlow, designed for administrators and security personnel. It provides tools to manage students, security accounts, and late entries.

The admin panel is composed of two parts:
1.  A **React (Vite) frontend** for the user interface.
2.  A **Node.js (Express) backend** server to handle API requests and business logic.

## Features

-   **Admin Login**: Secure login for the site administrator.
-   **Student Management**: View a list of all registered students, their details, and photos.
-   **Security Management**: Register new security personnel accounts and view existing ones.
-   **Late Entry Oversight**: Monitor all late entries recorded across campus.
-   **Verification System**: Approve or reject proofs submitted by students for their late entries.

## Technology Stack

-   **Frontend**: React, Vite, CSS, Axios
-   **Backend**: Node.js, Express.js
-   **Database**: Firebase (Firestore)
-   **Authentication**: JWT, Firebase Admin SDK

## Getting Started

To run the admin panel, you need to set up both the backend server and the frontend client.

### 1. Backend Setup (`/server`)

The server handles all interactions with the Firebase database.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the `server` directory.
    -   Copy the contents of `.env.example` (if available) or use the existing `.env` file.
    -   Ensure your Firebase Admin SDK credentials and a `JWT_SECRET` are correctly configured.

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5000` by default.

### 2. Frontend Setup (Root `/`)

The frontend is a React application built with Vite.

1.  **Navigate to the admin root directory (if you are in `/server`, go back one level):**
    ```bash
    cd .. 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The React application will be available at `http://localhost:5173` by default and will connect to the backend server.

### Default Admin Credentials

On the first run, the server will automatically create a default admin account if one doesn't exist:
-   **Email**: `admin@iiitg.ac.in`
-   **Password**: `admin@1234`
