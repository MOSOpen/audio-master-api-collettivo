# Audio Mastering API

## Overview

This is a Node.js Express API for uploading `.wav` audio files and simulating a mastering process. The application accepts file uploads, stores them in an uploads directory, creates "mastered" copies with a unique naming scheme, and provides download links for the processed files.

**Current Status**: Fully functional and running on port 5000

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js (v5.1.0) web framework for handling HTTP requests and routing
- **File Upload Handling**: Multer middleware (v2.0.2) for processing multipart/form-data file uploads
- **File Storage**: Local filesystem-based storage with two distinct directories:
  - `uploads/` - Stores incoming user-uploaded audio files
  - `master/` - Stores processed/mastered audio files for download
- **File Validation**: Server-side filtering to accept only `.wav` file extensions
- **Naming Strategy**: 
  - Uploaded files: `{timestamp}-{originalname}` to prevent naming conflicts
  - Mastered files: `SGL_666_{uuid}_MASTER.wav` using crypto.randomUUID() for collision-free unique identifiers
- **Unique ID Generation**: Uses Node.js built-in `crypto.randomUUID()` to generate globally unique identifiers, preventing file overwrites even with concurrent uploads

### API Design
- **RESTful Endpoints**:
  - `GET /` - Welcome endpoint providing API documentation
  - `POST /upload` - File upload endpoint (accepts `.wav` files only via multipart/form-data)
  - `GET /master/<filename>` - Static file serving for downloading mastered audio files
- **Response Format**: Consistent JSON structure with `success` field for all responses
  - Success: `{ success: true, originalFilename, masterFilename, downloadLink }`
  - Error: `{ success: false, error, details? }`
- **Static File Serving**: Express static middleware serves files from the `master/` directory
- **Server Binding**: Binds to `0.0.0.0:5000` for proper Replit environment compatibility

### Security & Validation
- **File Type Restrictions**: Multer fileFilter enforces `.wav` extension requirement
- **Error Handling**: 
  - Consistent JSON error responses across all endpoints
  - Multer-specific error handling middleware
  - Try/catch blocks for file operations
  - Detailed error logging to console
- **Directory Safety**: Automatic creation of required directories with recursive flag
- **Collision Prevention**: UUID-based naming eliminates race conditions from concurrent uploads

### Design Rationale
The architecture separates upload and output directories to maintain a clear distinction between raw user inputs and processed outputs. This design supports future expansion where actual audio processing logic could be inserted between upload and mastering stages. The UUID-based naming system ensures uniqueness even under high concurrent load. All responses follow a consistent JSON structure to simplify client integration.

### Mastering Simulation
Currently, the "mastering" process is simulated by copying the uploaded file to the `master/` directory with the standardized naming format. This provides the infrastructure foundation for integrating actual audio processing libraries in the future.

## External Dependencies

### NPM Packages
- **express** (^5.1.0) - Web application framework for routing and middleware
- **multer** (^2.0.2) - Middleware for handling multipart/form-data file uploads

### Node.js Built-in Modules
- **crypto** - For generating cryptographically strong random UUIDs
- **fs** - File system operations (directory creation, file copying)
- **path** - Cross-platform file path handling

### Runtime Environment
- **Node.js 20** - JavaScript runtime

### File System
- Local disk storage for persistence (no database currently used)
- Two primary directories: `uploads/` and `master/`

## Recent Changes (November 20, 2025)

1. Initial implementation of Express API with file upload functionality
2. Implemented mastering simulation with file copying and renaming
3. Enhanced unique ID generation from `Date.now()` to `crypto.randomUUID()` to prevent collision issues
4. Standardized all API responses to include `success` field for consistent error handling
5. Added comprehensive error handling middleware for Multer and general errors

## Future Integration Points

The application structure suggests potential future enhancements:
- Integration with actual audio processing libraries (e.g., sox, ffmpeg, Web Audio API)
- Database integration for tracking upload metadata, processing history, or user accounts
- Authentication/authorization mechanisms for securing endpoints
- Automated cleanup of temporary uploads after mastering
- Rate limiting and file size restrictions for production deployment
- Batch processing capabilities for multiple file uploads
- Progress tracking for long-running mastering operations
