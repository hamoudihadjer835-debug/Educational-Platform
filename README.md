 # Educational Platform

A full-stack educational platform for Computer Science students and teachers.

## Project Overview

This platform has 4 user roles:
- Admin
- Teacher
- Student
- Visitor

Only Computer Science students aged between 18 and 60 can sign up. Students enroll in courses depending on their academic year (e.g., 2024–2025).

Admin adds modules and assigns them to teachers. Teachers can then add lessons to the assigned modules. Students can download lessons or view them (video or document).

## Technology Stack

### Frontend
- React (JSX)
- Tailwind CSS
- React Router for navigation
- Axios for API calls

### Backend
- Node.js + Express
- MongoDB for database
- JWT for authentication
- bcrypt for password security

### Storage
- Lessons can be PDFs, videos, etc., available for download and streaming

## Security Features
- Passwords are hashed using bcrypt
- Sessions handled with JWT tokens
- Admin access only via hidden route /admin
- Role-based route protection
- Validation to restrict students:
  - Must be aged 18–60
  - Must select "Computer Science" as a field of study

## Project Structure

### Frontend Structure
```
/client
├── /pages
│   ├── /admin
│   ├── /teacher
│   ├── /student
│   ├── /auth (login/register)
│   └── /visitor
├── /components
├── /services (API calls)
├── /routes (Protected routes by role)
├── App.jsx
└── index.jsx
```

### Backend Structure
```
/server
├── /models
│   ├── User.js
│   ├── Module.js
│   ├── Lesson.js
├── /routes
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── teacherRoutes.js
│   ├── studentRoutes.js
├── /controllers (Business logic)
├── /middlewares
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
├── /utils
│   ├── jwt.js
│   ├── hash.js
├── config/db.js
├── .env
└── server.js
```

## Role-Based Functionality

### Admin
- Access: /admin (via direct URL)
- Login Required
- Pages:
  - /admin/login — Auth page
  - /admin/dashboard — View total users, courses, lessons
  - /admin/add-module — Add module with title, year
  - /admin/assign-teacher — Assign teacher to a specific module
  - /admin/manage-users — Block, delete, or modify users
  - /admin/manage-teachers — Approve teacher and students applications
  - /admin/manage-courses — View/delete lessons/modules
  - /admin/settings — Change credentials

### Teacher
- Register/Login: /register/teacher & /login/teacher
- Requires approval from admin to access dashboard
- Pages:
  - /teacher/dashboard — Overview of assigned modules and lessons
  - /teacher/add-lesson — Upload videos, PDFs, documents under assigned modules
  - /teacher/modules — View modules assigned by admin
  - /teacher/lessons — Manage uploaded lessons (edit/delete)
  - /teacher/profile — Update personal info

### Student
- Register/Login: /register/student & /login/student
- (Must be aged 18–60, CS students only)
- Pages:
  - /student/dashboard — Welcome page and quick stats
  - /student/courses — View available modules based on academic year
  - /student/lessons/:moduleId — View and download lesson files
  - /student/my-courses — View enrolled lessons/modules
  - /student/profile — Manage personal data, password

### Visitor
- No login required
- Pages:
  - / — Public landing page
  - /about — Platform overview
  - /contact — Get in touch
  - /choose-role — Register either as Student or Teacher

## Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd The-Platform
```

2. Install all dependencies
```
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# Or for local MongoDB: MONGODB_URI=mongodb://localhost:27017/educational_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Server Port (only used in development)
PORT=5000

# Cloudinary Configuration (if using Cloudinary for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the application
```
# Start the server (from the root directory)
npm run dev:server

# In a separate terminal, start the client
npm run dev:client
```

### Deployment to Another PC

For detailed instructions on deploying this project to another PC, please refer to the [Deployment Guide](DEPLOYMENT_GUIDE.md) included in this repository.

### Troubleshooting

If you encounter MongoDB connection issues when deploying to a new PC, please refer to:

1. **MongoDB Troubleshooting Guide**: See [MONGODB_TROUBLESHOOTING.md](MONGODB_TROUBLESHOOTING.md) for detailed solutions to common MongoDB connection issues.

2. **Connection Test Script**: Run the MongoDB connection test script to diagnose issues:
   ```bash
   cd server
   node testConnection.js
   ```

These resources will help you resolve common deployment issues, particularly related to database connectivity across different environments.

## License
This project is licensed under the MIT License.
