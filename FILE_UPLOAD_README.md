# File Upload System Documentation

## Overview

The Edu CS platform uses a simple but effective file upload system that combines:

1. **Multer** - For handling file uploads and storing files on the server's filesystem
2. **MongoDB** - For storing file metadata and references to the physical files

This approach provides a good balance between performance and simplicity.

## How It Works

### Physical File Storage

Files uploaded by users are stored in the server's filesystem in the `/uploads` directory. This is handled by Multer, a middleware for Express.js that makes handling multipart/form-data (file uploads) easy.

Key configuration:
- Files are stored in: `server/uploads/`
- Maximum file size: 50MB
- Allowed file types: PDF, video, and document files

### Database Storage

The MongoDB database stores metadata about each file, including:
- `path` - The URL path to access the file (e.g., `/uploads/filename.pdf`)
- `fileType` - The type of file (pdf, video, document)
- `originalName` - The original filename as uploaded by the user
- `size` - The file size in bytes
- `uploadedAt` - When the file was uploaded

This metadata is stored in the `files` array within each chapter of a lesson.

## File Upload Flow

1. User selects a file to upload in the UI
2. The file is sent to the server via a POST request to `/api/teacher/lessons/:id/chapters/:chapterIndex/files`
3. Multer middleware processes the file and saves it to the filesystem
4. The server creates a metadata object for the file with a `temporary: true` flag and adds it to the chapter's files array
5. The updated lesson is saved to the database
6. The server responds with the file metadata, which is then displayed in the UI
7. When the user clicks "Save Edits" on the lesson, all files are marked as permanent (`temporary: false`)
8. If the user doesn't save the lesson, temporary files are filtered out when viewing the lesson and eventually cleaned up by a background process

## File Access Flow

1. When a user views a lesson, the server sends the lesson data including file metadata
2. The UI displays the files with links to download them
3. When a user clicks on a file, the browser requests the file from `/uploads/filename`
4. The server serves the file directly from the filesystem

## Benefits of This Approach

1. **Simplicity** - No need for complex cloud storage integration
2. **Performance** - Files are served directly from the filesystem
3. **Flexibility** - Easy to migrate to cloud storage in the future if needed
4. **Reliability** - Files are stored locally, reducing dependency on external services

## Temporary File Handling

The system implements a temporary file mechanism to ensure that uploaded files are only permanently associated with lessons when the user explicitly saves the lesson:

1. When a file is uploaded, it's marked as `temporary: true` in the database
2. When viewing a lesson, temporary files are filtered out from the response
3. When a lesson is saved, all its files are marked as permanent (`temporary: false`)
4. A background cleanup process runs periodically to remove temporary files that are older than 24 hours

This approach ensures that if a user uploads files but doesn't save the lesson, those files won't appear in the lesson view and will eventually be cleaned up.

## Future Improvements

If the application needs to scale, consider:
1. Moving to cloud storage (AWS S3, Google Cloud Storage, etc.)
2. Implementing file compression
3. Adding more robust file validation
4. Implementing file versioning
5. Adding a physical file cleanup process to remove files from the filesystem that are no longer referenced in the database
