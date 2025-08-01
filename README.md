# CampusFlow - Campus Management System

CampusFlow is a comprehensive, all-in-one campus management solution designed to streamline academic and administrative processes. It features a mobile application for students and a web-based dashboard for administrators.

## Features

- **Student Authentication**: Secure sign-up and login for students using their official institute email.
- **Profile Management**: Students can manage their profile, including personal photos and ID cards.
- **QR-Based Late Entry Tracking**: A modern system for security personnel to record student late entries by scanning a unique QR code.
- **Manual Entry & Verification**: Admins and security can manually record entries and verify proofs submitted by students.
- **Real-time Notifications**: Students receive instant notifications regarding their late entries and other important updates.
- **Admin & Security Management**: A dedicated admin panel to manage student data, security personnel accounts, and oversee all late entries.

## Project Structure

The project is a monorepo containing two main components:

-   `./frontend`: An Expo (React Native) mobile application for students.
-   `./admin`: A web application for administrators, built with a React frontend and a Node.js/Express backend.

## Getting Started

To get the full system running, you will need to set up both the `frontend` mobile app and the `admin` panel.

### 1. Frontend (Student App)

The mobile app is built with Expo. For detailed instructions on how to set it up and run it, please refer to the frontend's README file.

-   [**Go to Frontend README**](./frontend/README.md)

### 2. Admin Panel (Web App)

The admin panel consists of a React frontend and a Node.js backend. For detailed instructions on setting up the server and the client, please refer to the admin's README file.

-   [**Go to Admin README**](./admin/README.md)

## Technology Stack

-   **Mobile App**: React Native, Expo, TypeScript, Firebase (Authentication, Firestore), Cloudinary
-   **Admin Frontend**: React, Vite, CSS
-   **Admin Backend**: Node.js, Express, Firebase Admin SDK, JWT, Bcrypt
-   **Database**: Google Firestore
-   **Cloud Services**: Cloudinary for image storage.

---

Thank you for checking out CampusFlow!