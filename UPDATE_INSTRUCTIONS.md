# Update Instructions: Module Structure Change

This document provides instructions for updating the application to use the new module structure, where modules contain chapters, syllabus, and references directly, instead of having lessons as an intermediate entity.

## Overview of Changes

1. **Data Model Changes**:
   - Updated `Module` schema to include chapters, syllabus, and references directly
   - Removed the `Lesson` model

2. **Server-Side Changes**:
   - Created new controller files with updated functionality
   - Created new route files to work with the updated controllers
   - Updated server.js to use the new routes

3. **Client-Side Changes**:
   - Created new API service file with updated endpoints
   - Created new components for teachers and students to work with the new data model
   - Updated App.jsx to use the new components

## Update Steps

### 1. Database Migration

Run the migration script to move data from the old model to the new model:

```bash
cd server
node scripts/migrateData.js
```

This script will:
- Find all modules in the database
- For each module, find all its lessons
- Convert lesson chapters to module chapters
- Create references from lessons
- Save the updated modules

### 2. Server-Side Updates

1. Replace the existing controllers with the new ones:

```bash
cd server
mv controllers/adminController.new.js controllers/adminController.js
mv controllers/teacherController.new.js controllers/teacherController.js
mv controllers/studentController.new.js controllers/studentController.js
```

2. Replace the existing routes with the new ones:

```bash
cd server
mv routes/adminRoutes.new.js routes/adminRoutes.js
mv routes/teacherRoutes.new.js routes/teacherRoutes.js
mv routes/studentRoutes.new.js routes/studentRoutes.js
```

3. Update the server.js file to use the new controllers and routes:

```bash
cd server
# The server.js file has already been updated to use the new routes
```

### 3. Client-Side Updates

1. Replace the existing API service with the new one:

```bash
cd client/src/services
mv api.new.js api.js
```

2. Update the import statements in the components that use the API service:

```bash
# The AuthContext.jsx file has already been updated to use the new API service
```

3. Update the App.jsx file to use the new components:

```bash
cd client/src
# The App.jsx file has already been updated to use the new components
```

### 4. Testing

After completing the updates, test the application to ensure everything works correctly:

1. Start the server:

```bash
cd server
npm start
```

2. Start the client:

```bash
cd client
npm run dev
```

3. Test the following functionality:
   - Admin: Creating and managing modules
   - Teacher: Adding and managing chapters, syllabus, and references
   - Student: Viewing module content and downloading files

## Rollback Plan

If issues are encountered, you can roll back to the previous version:

1. Restore the original controllers and routes
2. Restore the original API service
3. Restore the original components
4. Restart the server and client

## Support

If you encounter any issues during the update process, please contact the development team for assistance.
