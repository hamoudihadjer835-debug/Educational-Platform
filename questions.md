# Common Questions About The Platform

## Admin Operations

### How do I approve new user registrations?
Go to the Admin Dashboard and click on "Pending Approvals". You'll see a list of users waiting for approval. Click the "Approve" button next to each user to grant them access.

**How it works:** The system calls the `getPendingApprovals` API endpoint which queries the database for users with `isApproved: false`. When you approve a user, it updates their record in the MongoDB database by setting `isApproved: true`.

### How do I create a new module?
From the Admin Dashboard, go to "Modules" and click "Create New Module". Fill in the title, description, academic year, level, and semester, then click "Create".

**How it works:** The form data is sent to the `createModule` API endpoint which creates a new document in the Module collection. The frontend temporarily adds the module to the UI with a temporary ID before replacing it with the real one from the server response.

### How do I assign a teacher to a module?
In the Modules section, find the module you want to assign and click "Assign Teacher". Select a teacher from the dropdown list and click "Assign".

**How it works:** This triggers the `assignTeacher` endpoint which updates the module document in MongoDB by setting its `teacher` field to the selected teacher's ID. The system verifies that the teacher exists and is approved before making the assignment.

### Where can I see platform statistics?
The Admin Dashboard home page shows key statistics including total users, modules, enrollments, and pending approvals.

**How it works:** The dashboard calls the `getDashboardStats` endpoint which runs multiple database queries to count documents in various collections (Users, Modules, Lessons, Enrollments) and returns the aggregated data.

## Teacher Operations

### How do I add content to my module?
After logging in, go to "My Modules" and select the module you want to edit. Click "Add Chapter" to create a new section, then add text content and upload files as needed.

**How it works:** When you add a chapter, the system calls the `addChapter` endpoint which updates the module document by pushing a new object to its `chapters` array. File uploads are handled by Multer middleware which stores files in the server's filesystem and saves references in the database.

### How do I create a quiz?
From your module page, click "Create Quiz". Add a title, description, and questions. You can create multiple-choice, true/false, or short-answer questions. Set the availability dates and click "Save".

**How it works:** The quiz data is sent to the `createQuiz` endpoint which creates a new document in the Quiz collection with references to the module. Each question is stored as a subdocument with its type, text, options, and point value.

### How do I grade student submissions?
Go to "Quizzes" and select the quiz you want to grade. Click "View Submissions" and you'll see a list of student attempts. For submissions that need manual grading, click "Grade" to review answers and assign points.

**How it works:** The grading interface calls the `gradeQuizSubmission` endpoint which updates the submission document with the teacher's grades and feedback. The system recalculates the total score based on the points assigned to each answer and marks the submission as "graded".

### How can I track student progress?
From your module page, click "Student Progress" to see which students have viewed each chapter and completed quizzes. This helps identify students who may need additional support.

**How it works:** The system queries the Progress collection which tracks which chapters each student has viewed. It also fetches quiz submissions to show completion status and scores. This data is combined to calculate overall progress percentages.

## Student Operations

### How do I enroll in a module?
Go to "Available Modules" and browse the list. When you find a module you want to join, click "Enroll". The module will then appear in your dashboard.

**How it works:** Clicking "Enroll" calls the `enrollInModule` endpoint which creates a new document in the Enrollment collection linking your user ID to the module ID. The system checks if you're already enrolled before creating a new enrollment.

### How do I access module content?
From your dashboard, click on any enrolled module. You'll see a list of chapters - click on any chapter to view its content, including text, videos, and downloadable files.

**How it works:** The system fetches the module document from MongoDB including its chapters and files. When you view a chapter, it calls the `markChapterAsViewed` endpoint which updates your progress record in the database.

### How do I take a quiz?
In your module page, you'll see available quizzes listed in the "Quizzes" section. Click "Start Quiz" to begin. Answer all questions and click "Submit" when finished.

**How it works:** Starting a quiz creates a new document in the QuizSubmission collection with your user ID and the quiz ID. As you answer questions, your responses are saved to this document. When you submit, the system automatically grades objective questions and marks subjective ones for teacher review.

### How can I see my grades and progress?
Your dashboard shows your progress in each enrolled module. Click on a module and select "My Progress" to see which chapters you've completed and your quiz scores.

**How it works:** The system queries multiple collections (Progress, QuizSubmission, Enrollment) to gather your activity data. It calculates completion percentages based on viewed chapters versus total chapters and aggregates quiz scores.

## Account Management

### How do I reset my password?
Click "Forgot Password" on the login page. Enter your email and answer your security questions correctly. You'll then be able to create a new password.

**How it works:** The system first verifies your email exists in the database. Then it fetches your security questions from the SecurityQuestion collection. Your answers are hashed and compared with the stored hashes. If correct, you're allowed to set a new password which is hashed using bcrypt before being saved.

### How do I update my profile information?
After logging in, click on your name in the top-right corner and select "Profile". You can edit your personal information and click "Save Changes".

**How it works:** The form data is sent to the `updateProfile` endpoint which updates your user document in the database. The system validates the data before saving and returns the updated user object to refresh the UI.

### What should I do if my account is locked?
If you've made too many failed login attempts, your account will be temporarily locked. Wait 30 minutes and try again, or contact an administrator for assistance.

**How it works:** The system tracks failed login attempts in the user document. After 5 consecutive failures, it sets a `lockedUntil` timestamp. Login attempts are rejected until the current time exceeds this timestamp. The lock automatically expires after 30 minutes.

### How do I change my security questions?
Go to your profile page and select "Security Settings". You'll need to enter your current password before setting new security questions and answers.

**How it works:** The system first verifies your password using bcrypt comparison. If correct, it updates your record in the SecurityQuestion collection with your new questions and hashed answers. The `setSecurityQuestions` endpoint handles this process.

## Technical Implementation

### How does authentication work?
The platform uses JWT (JSON Web Tokens) for authentication. When you log in, the server generates a token containing your user ID and role, which is sent with subsequent requests to verify your identity.

**How it works:** The `login` endpoint verifies credentials and generates a token using the `jsonwebtoken` library. This token is stored in localStorage and added to request headers by the axios interceptor. The `authMiddleware` on the server verifies the token before allowing access to protected routes.

### How is user data protected?
Passwords are never stored in plain text. They're hashed using bcrypt before being saved to the database. Security question answers are also hashed.

**How it works:** The `bcrypt.hash()` function converts passwords into irreversible hashes with random salt values. When verifying passwords, `bcrypt.compare()` checks if the input matches the stored hash without ever decrypting the original password.

### How does the file upload system work?
Files are stored on the server's filesystem in the `/uploads` directory, with metadata stored in MongoDB.

**How it works:** The Multer middleware handles multipart form data, saving files to disk and providing file information to the route handler. The file path and metadata are then stored in the database, allowing the system to serve the files when requested.

### How are roles and permissions managed?
The platform has four user roles: Admin, Teacher, Student, and Visitor. Each role has specific permissions controlled by middleware.

**How it works:** User roles are stored in the user document. The `roleMiddleware` checks the user's role against the required role for each protected route. Routes are organized in separate files (adminRoutes.js, teacherRoutes.js, etc.) with appropriate middleware applied.

## Comprehensive Technical Overview

### Authentication & Authorization System
The platform implements a robust JWT-based authentication system. When users log in, the server validates their credentials against the database, where passwords are stored as bcrypt hashes. Upon successful authentication, the server generates a JWT token containing the user's ID and role, which is signed using a secret key and has a configurable expiration time.

For subsequent requests, the authMiddleware.js extracts the token from the Authorization header, verifies its signature and expiration, then attaches the user information to the request object. This middleware works in tandem with the roleMiddleware.js, which checks if the authenticated user has the required role to access specific routes.

The system handles expired tokens by checking the token's validity during verification. If a token is expired, the user is redirected to the login page. The frontend stores the token in localStorage and includes it in the Authorization header for all API requests.

### File Management System
The platform features a sophisticated file management system that handles uploads, storage, and retrieval of educational materials. Files are stored on the server's filesystem rather than in the database to optimize performance and reduce database load. The system uses multer for handling multipart/form-data, which is configured with disk storage.

When a teacher uploads files for a module chapter, the files are initially marked as "temporary" in the database. This allows teachers to preview their uploads before finalizing the module. Once the teacher saves the module, these temporary flags are removed. This approach prevents orphaned files if a teacher abandons the upload process.

The system implements file type validation to ensure only appropriate file types (PDFs, videos, documents) are uploaded. File size limits are configurable through environment variables, with a default maximum of 50MB per file and 10 files per upload. Each file is stored with metadata including the original filename, size, upload date, and file type.

### Database Schema Design
The platform uses MongoDB, a NoSQL database, which provides flexibility for storing complex, nested data structures. The schema design follows a document-oriented approach that maps well to the educational domain.

The core collections include:
- Users: Stores user information with role-based differentiation
- Modules: Contains educational content organized into chapters
- Quizzes: Stores quiz questions, options, and correct answers
- Submissions: Records student quiz attempts and scores
- Enrollments: Tracks which students are enrolled in which modules

The Module schema is particularly sophisticated, with nested schemas for chapters and files. This design allows for efficient retrieval of module content without requiring multiple database queries. The schema includes validation rules to ensure data integrity, such as required fields, enum values for limited choices, and maximum string lengths.

### Quiz System Implementation
The quiz system is one of the most complex features of the platform. It supports multiple question types (multiple-choice, true/false, short-answer) and provides automated grading for objective questions.

When a teacher creates a quiz, they specify the questions, options, and correct answers. The quiz is associated with a specific module and can be time-limited. Students can attempt quizzes within the specified time frame, and their answers are stored in the Submission collection.

The grading system automatically evaluates multiple-choice and true/false questions by comparing student answers with the correct answers stored in the database. For short-answer questions, teachers can manually review and grade responses through a dedicated interface.

The system also supports quiz analytics, showing teachers statistics about student performance, including average scores, completion rates, and commonly missed questions.

### Error Handling System
The platform implements a comprehensive error handling system that gracefully manages various failure scenarios. At the API level, controllers use try-catch blocks to catch exceptions and return appropriate HTTP status codes and error messages.

For database connection issues, the system includes a specialized middleware that detects when the MongoDB connection is unavailable. For GET requests, it can return mock data to allow the frontend to continue functioning in a degraded mode. For write operations, it queues requests to be processed when the database connection is restored.

Client-side validation is implemented using form validation libraries to catch errors before submission. Server-side validation uses Mongoose schema validation and custom middleware to ensure data integrity. All API responses follow a consistent format with success flag, message, and data properties.

### Security Implementation
Security is a primary concern for the platform, which implements multiple layers of protection. Passwords are hashed using bcrypt with a configurable salt factor before storage. The system never returns password hashes to clients, even in error messages.

JWT tokens are signed with a secret key stored in environment variables and have a configurable expiration time. The system implements CORS protection to prevent unauthorized cross-origin requests.

Input validation is performed on both client and server sides to prevent injection attacks. For MongoDB, the system uses Mongoose's schema validation to ensure data types are correct before insertion. File uploads are validated for type and size to prevent malicious file uploads.

The platform also implements rate limiting on authentication endpoints to prevent brute force attacks, and all sensitive operations are logged for audit purposes.

### API Structure and Organization
The API is organized following RESTful principles, with routes grouped by user role and resource type. This structure makes the codebase more maintainable and easier to understand.

The main route groups include:
- /api/auth: Authentication endpoints (login, register, password reset)
- /api/admin: Admin-only endpoints for managing users and modules
- /api/teacher: Teacher endpoints for managing assigned modules and quizzes
- /api/student: Student endpoints for accessing modules and taking quizzes
- /api/quiz: Quiz-related endpoints for all authorized users

Each route group is protected by middleware that checks for authentication and appropriate role permissions. Controllers are separated from routes to maintain a clean separation of concerns. The controllers contain the business logic, while routes define the API endpoints and middleware chain.

### Enrollment System
The enrollment system manages student access to modules. It prevents duplicate enrollments by using a unique index on the combination of student ID and module ID in the Enrollment schema. When a student attempts to enroll in a module, the system first checks if an enrollment record already exists.

Administrators can enroll students in modules individually or in bulk by academic year. Teachers can view the list of enrolled students for their assigned modules. Students can view their enrolled modules on their dashboard.

The system also tracks enrollment dates, which can be used for analytics and reporting on student engagement over time.

### Performance Optimization
The platform incorporates several performance optimization strategies to ensure smooth operation even with large numbers of users and content. Database queries are optimized using MongoDB indexes on frequently queried fields, such as user email, module title, and enrollment combinations.

For content delivery, the system implements pagination for lists of modules, quizzes, and submissions to reduce payload size and improve response times. Large files are streamed rather than loaded entirely into memory, preventing server overload when handling video content.

The frontend implements lazy loading for module content, only fetching chapter details when a user expands that chapter. This reduces initial load time and bandwidth usage. React components are optimized to minimize re-renders, and the application uses memoization for expensive computations.

### Quiz Submission and Grading
The quiz submission and grading system is one of the most sophisticated features of the platform. When a student takes a quiz, the system records their answers along with metadata such as start time, end time, and time spent on each question.

For objective questions (multiple-choice, true/false), the system automatically grades submissions by comparing student answers with the correct answers stored in the quiz document. For subjective questions (short-answer), teachers can manually review and grade responses through a dedicated interface.

The grading algorithm calculates scores based on the points assigned to each question and provides detailed feedback on correct and incorrect answers. The system also tracks quiz statistics, such as average scores, completion rates, and commonly missed questions, which teachers can use to improve their teaching materials.

### Password Reset and Security Questions
The platform implements a secure password reset mechanism using security questions. During registration, users must provide answers to at least three security questions, which are stored in hashed form for security.

When a user initiates a password reset, they must correctly answer their security questions before being allowed to set a new password. This provides an additional layer of security beyond email-based reset links.

The system implements rate limiting on password reset attempts to prevent brute force attacks. After a configurable number of failed attempts, the account is temporarily locked for a period of time.

### Data Migration Strategy
The platform includes a robust data migration strategy for transitioning from the old lesson-based model to the new chapter-based model. This migration preserves all existing content while enabling the new, more flexible content structure.

The migration script iterates through all modules in the database, finds their associated lessons, and converts lesson chapters to module chapters. It creates references from lessons to the new structure and updates all the necessary relationships.

This approach ensures backward compatibility while allowing the platform to evolve. The migration is designed to be idempotent, meaning it can be run multiple times without creating duplicate data.

### Deployment and DevOps Strategy
The platform is designed for flexible deployment options, with configuration managed through environment variables. The project includes a Vercel configuration for easy cloud deployment, with separate build commands for the client and server.

For local development, the project uses nodemon to automatically restart the server when files change. The client uses Vite for fast development builds with hot module replacement.

The deployment strategy separates the frontend and backend, with the frontend built as static files that can be served from a CDN for optimal performance. API requests are routed to the backend server through a proxy configuration.

### Accessibility and User Experience
The platform is designed with accessibility in mind, following WCAG guidelines to ensure usability for all users. The frontend implements semantic HTML, proper ARIA attributes, and keyboard navigation support.

The user interface adapts to different screen sizes using responsive design principles, ensuring a consistent experience across devices. The design uses a high-contrast color scheme and readable font sizes to accommodate users with visual impairments.

For users with slower internet connections, the platform implements progressive loading, showing content as it becomes available rather than waiting for the entire page to load. This improves the perceived performance and user satisfaction.

The system also includes helpful error messages and validation feedback to guide users through complex processes like quiz creation and module management.

### Future Roadmap and Scalability
The platform is designed with scalability in mind, using a modular architecture that can be extended with new features. The roadmap includes:

- Real-time collaboration features for teachers to co-edit modules
- Advanced analytics dashboard for tracking student progress
- Integration with video conferencing tools for live sessions
- Mobile application for offline access to educational content
- AI-powered recommendations for personalized learning paths

The system can scale horizontally by adding more server instances behind a load balancer. Database scaling is addressed through MongoDB's sharding capabilities