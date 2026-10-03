<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563eb,100:7c3aed&height=180&section=header&text=Educational%20Platform&fontSize=42&fontColor=ffffff&animation=fadeIn" alt="Educational Platform banner" />

### A full-stack educational platform for Computer Science students and teachers

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

[Live Demo](#live-application) | [Source Code](https://github.com/hamoudihadjer835-debug/Educational-Platform) | [Documentation](#documentation)

</div>

---

## Table of Contents

- [Academic Context](#academic-context)
- [Project Overview](#project-overview)
- [Main Features](#main-features)
- [Technology Stack](#technology-stack)
- [Authentication and Security](#authentication-and-security)
- [Project Structure](#project-structure)
- [Application Architecture](#application-architecture)
- [Getting Started](#getting-started)
- [Production Deployment](#production-deployment)
- [Live Application](#live-application)
- [Documentation](#documentation)
- [Development Notes](#development-notes)
- [Project Goals](#project-goals)
- [License](#license)

---

## Academic Context

| | |
|---|---|
| **Program** | 2nd Year Computer Science |
| **Academic Year** | 2024–2025 |
| **Project** | Educational Platform |

---

## Project Overview

The **Educational Platform** provides a centralized environment for managing educational content and interactions between students, teachers, and administrators.

The platform supports four user roles:

| Role | Description |
|------|-------------|
| **Administrator** | Manages users, modules, and platform settings |
| **Teacher** | Manages learning resources in assigned modules |
| **Student** | Accesses modules and learning materials by academic year |
| **Visitor** | Browses the public landing page and registers |

Students can access educational modules according to their academic year, while teachers can manage learning resources within modules assigned to them by administrators.

---

## Main Features

### Administrator

- Access the administration dashboard
- Manage users
- Approve student and teacher accounts
- Create educational modules
- Assign modules to teachers
- Manage modules and educational resources
- Manage platform settings

### Teacher

- Register and access the account after approval
- View modules assigned by an administrator
- Add educational resources to assigned modules
- Manage uploaded lessons and files
- Access the teacher dashboard
- Manage the profile

### Student

- Register and access the account after approval
- View available educational modules
- Access lessons and educational resources
- View or download supported learning materials
- Access the student dashboard
- Manage the profile

> **Student registration is restricted to users who:**
> - Are between **18 and 60 years old**
> - Select **Computer Science** as their field of study

### Visitor

- Access the public landing page
- Learn about the platform
- Access public information
- Choose whether to register as a student or teacher

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Vite, JSX, Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JSON Web Token (JWT), bcrypt |
| **Deployment** | GitHub, Vercel, MongoDB Atlas |

---

## Authentication and Security

- Password hashing using **bcrypt**
- **JWT**-based authentication
- Role-based authorization
- Protected routes based on user roles
- Server-side authentication and authorization
- Validation of student registration requirements
- Sensitive configuration stored using environment variables

> **Important:** Real database credentials, JWT secrets, API keys, and other sensitive values must **never** be committed to the repository.

---

## Project Structure

```
Educational-Platform/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── visitor/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── uploads/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

---

## Application Architecture

The application follows a **client-server architecture**:

```
React / Vite Client
        |
        | REST API
        v
Node.js / Express Server
        |
        | Mongoose
        v
MongoDB Database
```

The frontend communicates with the Express backend through REST API endpoints.

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- **Node.js** 16 or higher
- **npm**
- **MongoDB** or a **MongoDB Atlas** account
- **Git**

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/hamoudihadjer835-debug/Educational-Platform.git
cd Educational-Platform
```

**2. Install the root dependencies**

```bash
npm install
```

**3. Install the client dependencies**

```bash
cd client
npm install
```

**4. Install the server dependencies**

```bash
cd ../server
npm install
```


### Running the Application

**Start the backend** (from the project root):

```bash
npm run dev:server
```

**Start the frontend** (in a separate terminal):

```bash
npm run dev:client
```

The frontend runs on the Vite development server, while the backend runs on port **5000** by default.

### Building the Frontend

```bash
npm run build --prefix ./client
```

The generated files are placed in `client/dist/`.

---

## Production Deployment

The project is configured for deployment using **Vercel**. The deployment configuration supports:

- React/Vite frontend
- Express backend
- API routing
- Frontend-to-backend communication

Production environment variables must be configured through the **Vercel project settings**.

---

## Live Application

- **Deployed application:** [Open the deployed application](https://the-platform-gules.vercel.app/)
- **GitHub repository:** [View the source code](https://github.com/hamoudihadjer835-debug/Educational-Platform)

---

## Documentation

Additional documentation is available in the repository:

| File | Description |
|------|-------------|
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |
| `MONGODB_CONNECTION_GUIDE.md` | MongoDB connection configuration |
| `MONGODB_TROUBLESHOOTING.md` | Troubleshooting common MongoDB connection issues |
| `FILE_UPLOAD_README.md` | Information related to file uploads |
| `CROSS_PC_DEPLOYMENT.md` | Running the project on another computer |

---

## Development Notes

The project is organized into separate frontend and backend applications.

| Frontend responsibilities | Backend responsibilities |
|---|---|
| User interfaces | Authentication |
| Navigation | Authorization |
| Authentication views | User management |
| Dashboards | Module management |
| Educational content presentation | Educational resources |
| | Database communication |
| | API endpoints |

---

## Project Goals

- Provide a centralized educational platform
- Organize educational content by academic year and module
- Separate access according to user roles
- Allow teachers to manage educational resources
- Provide students with organized access to learning materials
- Provide administrators with centralized platform management
- Apply authentication and security principles in a full-stack web application

This project was developed as part of the **2nd Year Computer Science** program during the **2024–2025** academic year. It demonstrates the implementation of a complete web application using modern frontend, backend, database, authentication, and deployment technologies.

---

## License

This project is licensed under the **MIT License**.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,100:2563eb&height=100&section=footer" alt="footer" />

</div>
