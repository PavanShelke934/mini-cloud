# Aura Cloud - Secure Encrypted Cloud Storage

A modern, secure cloud storage application with end-to-end encryption, multi-user support, OAuth authentication, and file sharing capabilities. Built with Node.js/Express backend and React frontend.

**Live Demo Available** | **Production Ready** | **Fully Encrypted**

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Security Implementation](#security-implementation)
- [File Encryption Details](#file-encryption-details)
- [Authentication System](#authentication-system)
- [Frontend Architecture](#frontend-architecture)
- [File Upload & Download Flow](#file-upload--download-flow)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

**Aura Cloud** is a full-stack web application that provides users with a personal encrypted file storage system. Users can upload files, organize them in folders, download them, and share them publicly with others. All files are encrypted using AES-256-CBC before being stored on the server, ensuring that even the server administrators cannot access user data.

### Core Philosophy
- **Privacy First**: All files encrypted before storage
- **User-Centric**: Intuitive UI with dark mode support
- **Secure**: Industry-standard encryption and authentication
- **Scalable**: RESTful API architecture with proper error handling

---

## Key Features

### 1. **Authentication System**
- **Email/Password Registration and Login**
  - Secure password hashing with bcrypt (10 salt rounds)
  - Email validation
  - Session persistence with JWT tokens
  - Token expiration (7 days)

- **Google OAuth 2.0 Integration**
  - One-click authentication with Google account
  - Automatic account linking for existing users
  - No password storage for OAuth users

- **Protected Routes**
  - All file operations require authentication
  - Frontend route protection with PrivateRoute component
  - Backend JWT middleware validation

### 2. **File Management**
- **Upload Multiple Files**
  - Drag-and-drop upload interface
  - Click-to-browse file picker
  - Multi-file parallel uploads
  - Real-time progress tracking per file

- **Download Files**
  - Server-side decryption on download
  - Original filename and MIME type preserved
  - Stream-based download for memory efficiency

- **Delete Files**
  - Removes database record and encrypted file
  - Automatic cleanup of temporary uploads

- **File Organization**
  - Hierarchical folder structure
  - Create unlimited nested folders
  - Move files between folders via folderId
  - Breadcrumb navigation for easy traversal

- **Search & Filter**
  - Search files by name (case-insensitive regex)
  - Filter by MIME type (images, documents, videos, etc.)
  - Multiple sort options: date (ascending/descending), size (ascending/descending)

### 3. **File Sharing**
- **Public Share Tokens**
  - Generate unique 32-character hex tokens
  - Enable/disable public access
  - Share via link (format: `/share/{token}`)

- **Public Share Page**
  - No authentication required for shared files
  - View file metadata (name, size)
  - Download shared files
  - Elegant UI for share recipients

### 4. **Storage & Encryption**
- **End-to-End AES-256-CBC Encryption**
  - 256-bit key encryption
  - Per-file random initialization vectors (IVs)
  - Server-side encryption before storage

- **Encrypted Storage**
  - Files stored as `{fileId}_encrypted` in hdfs_storage directory
  - Temporary uploads staged in temp_uploads directory
  - Automatic cleanup of temporary files

### 5. **User Interface**
- **Responsive Design**
  - Mobile-first approach
  - Works on desktop, tablet, and mobile
  - Flexbox and CSS Grid layouts

- **Dark Mode Support**
  - Automatic dark/light theme switching
  - User preference persistence

- **Visual Feedback**
  - Toast notifications for actions (success/error/info)
  - Progress bars during upload
  - Loading indicators
  - Smooth transitions and hover states

- **Accessibility**
  - Semantic HTML
  - Keyboard navigation support
  - ARIA labels and roles

---

## Technology Stack

### Backend
```
Node.js 18+
├── Framework: Express.js 5.2.1
├── Database: MongoDB + Mongoose 9.5.0
├── Authentication:
│   ├── JWT (jsonwebtoken 9.0.3)
│   ├── Passport.js 0.7.0
│   ├── Passport Google OAuth 2.0.0
│   └── bcrypt 6.0.0
├── File Upload: Multer 2.1.1
├── Encryption: Node.js crypto (built-in)
├── Environment: dotenv 16.4.5
└── Session: express-session 1.17.3
```

### Frontend
```
React 19.2.5 + Vite 8.0.10
├── Routing: React Router DOM 7.14.2
├── HTTP Client: Axios 1.15.2
├── Styling: Tailwind CSS 3.4.19
├── UI Components:
│   ├── Lucide React 1.9.0 (icons)
│   ├── React Dropzone 15.0.0 (drag-drop)
│   └── React Toastify 11.1.0 (notifications)
├── Build Tool: Vite 8.0.10
└── Linting: ESLint 9.x
```

### Infrastructure
```
Development:
├── Node environment variables (.env)
├── MongoDB local/Atlas connection
└── Vite dev server (hot reload)

Production:
├── Environment-based configuration
├── HTTPS support ready
└── Scalable to cloud deployment
```

---

## Project Structure

```
mini-cloud/
│
├── README.md                          # This file (root documentation)
│
├── backend/                           # Express.js REST API server
│   ├── package.json                   # Dependencies & scripts
│   ├── server.js                      # Express app entry point
│   ├── test_auth.js                   # Authentication testing script
│   │
│   ├── middleware/
│   │   └── auth.js                    # JWT verification middleware
│   │
│   ├── models/                        # Mongoose schemas
│   │   ├── User.js                    # User schema (email, password, googleId)
│   │   ├── File.js                    # File schema (metadata, encryption IV)
│   │   └── Folder.js                  # Folder schema (hierarchy)
│   │
│   ├── routes/                        # API endpoint definitions
│   │   ├── authRoutes.js              # POST /register, /login, /google, /google/callback
│   │   ├── fileRoutes.js              # POST /upload, GET /, GET /:id, DELETE /:id, etc.
│   │   ├── folderRoutes.js            # POST /, GET / (folders)
│   │   └── publicRoutes.js            # GET /:token (public share)
│   │
│   ├── utils/                         # Utility functions
│   │   ├── cryptoUtils.js             # Encryption/decryption functions
│   │   └── storageUtils.js            # File storage management
│   │
│   ├── hdfs_storage/                  # Encrypted file storage directory
│   │   ├── {fileId}_encrypted         # Encrypted file chunks
│   │   └── ... (multiple encrypted files)
│   │
│   └── temp_uploads/                  # Temporary upload staging directory
│       ├── {uploadTemp}               # Temporary files (deleted after processing)
│       └── ... (multiple temp files)
│
├── frontend/                          # React + Vite SPA
│   ├── package.json                   # Dependencies & scripts
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── eslint.config.js               # ESLint configuration
│   ├── index.html                     # HTML entry point
│   │
│   ├── public/                        # Static assets
│   │   └── ... (favicon, images, etc.)
│   │
│   └── src/
│       ├── main.jsx                   # Vite entry point
│       ├── App.jsx                    # Main app component with routing
│       ├── App.css                    # Global app styles
│       ├── index.css                  # Global CSS and Tailwind imports
│       │
│       ├── components/                # Reusable React components
│       │   ├── Login.jsx              # Login/Register form component
│       │   ├── Navbar.jsx             # Top navigation bar
│       │   ├── Sidebar.jsx            # Sidebar navigation
│       │   ├── Layout.jsx             # Common layout wrapper
│       │   ├── PrivateRoute.jsx       # Route protection component
│       │   ├── ProfileDropdown.jsx    # User profile menu
│       │   ├── Dashboard.jsx          # Dashboard component
│       │   ├── FileList.jsx           # File list display component
│       │   ├── UploadArea.jsx         # Drag-drop upload component
│       │   └── ThemeToggle.jsx        # Dark/light mode toggle
│       │
│       ├── pages/                     # Page components
│       │   ├── Home.jsx               # Dashboard page (/)
│       │   ├── Files.jsx              # File explorer page (/files)
│       │   └── PublicShare.jsx        # Public share page (/share/:token)
│       │
│       └── utils/
│           └── api.js                 # Axios API client configuration
│
└── .gitignore                         # Git ignore rules
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas cloud)
- **Google OAuth Credentials** (optional, for Google login)

### 5-Minute Setup

```bash
# 1. Clone/navigate to project
cd mini-cloud

# 2. Setup backend
cd backend
npm install
# Create .env file (see Environment Variables section)
node server.js

# 3. In a new terminal, setup frontend
cd frontend
npm install
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
```

---

## Detailed Setup Instructions

### Step 1: Prerequisites Installation

#### Install Node.js
- **Windows**: Download from [nodejs.org](https://nodejs.org), choose LTS version
- **Mac**: `brew install node`
- **Linux**: `sudo apt-get install nodejs npm`

Verify installation:
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
```

#### Install MongoDB

**Option A: Local MongoDB**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Follow installation guide for your OS
- Verify: `mongod --version`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster (free tier available)
- Get connection string in format: `mongodb+srv://username:password@cluster.mongodb.net/database`

#### (Optional) Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google+ API"
4. Create "OAuth 2.0 Client ID" credentials:
   - Choose "Web application"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/auracloud
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auracloud

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# Encryption (IMPORTANT: Must be exactly 64 hex characters = 32 bytes)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Session
SESSION_SECRET=your-session-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
FRONTEND_URL=http://localhost:5173
EOF

# Verify .env file has all required variables
cat .env
```

**Generate Strong Encryption Key (Important!)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and replace ENCRYPTION_KEY value in .env
```

### Step 3: MongoDB Verification

```bash
# Test MongoDB connection (from backend directory)
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auracloud')
  .then(() => console.log('✓ MongoDB connected!'))
  .catch(err => console.error('✗ MongoDB error:', err));
"
```

If fails, ensure MongoDB is running:
```bash
# macOS/Linux
mongod

# Windows (if installed as service)
# Just verify MongoDB is running in Services
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# No .env needed - hardcoded API URL (localhost:5000)
# If backend is on different URL, edit frontend/src/utils/api.js:
# const API_URL = 'http://localhost:5000/api';
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
# OR for development with auto-reload:
npm run dev  # (if nodemon is installed)
# OR manual:
node server.js

# Expected output:
# ✓ Server running on http://localhost:5000
# ✓ MongoDB connected
```

**Backend runs on:**
- API: `http://localhost:5000/api`
- Health check: `GET http://localhost:5000/health`

### Start Frontend Development Server

```bash
# In a NEW terminal window
cd frontend
npm run dev

# Expected output:
#   VITE v8.0.10  ready in 245 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: http://192.168.x.x:5173/
```

**Frontend runs on:**
- Main app: `http://localhost:5173`
- Vite dev server with HMR (Hot Module Replacement)

### Verify Everything Works

1. **Check Backend**
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok"}
   ```

2. **Open Frontend**
   - Visit `http://localhost:5173` in browser
   - Should see login page
   - No console errors (check browser DevTools)

3. **Test Authentication**
   - Register new account (any email, password 6+ chars)
   - Login with credentials
   - Should redirect to Files page
   - Check localStorage for `token`

4. **Test File Upload**
   - Create folder
   - Upload a test file
   - File should appear in list
   - Download should work
   - Verify encrypted file in `backend/hdfs_storage/`

### Stopping the Servers

```bash
# In each terminal, press Ctrl+C to stop the server
Ctrl+C

# Verify ports are freed
# macOS/Linux:
lsof -i :5000
lsof -i :5173

# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

---

## API Endpoints

### Authentication Endpoints

#### Register New User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "user_id", "email": "user@example.com" }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "user_id", "email": "user@example.com" }
}
```

#### Google OAuth (Start)
```
GET /api/auth/google

Redirects to: Google OAuth consent screen
```

#### Google OAuth (Callback)
```
GET /api/auth/google/callback?code=...&state=...

Redirects to: http://localhost:5173/?token=...&email=...
```

### File Endpoints

#### Upload File(s)
```
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- file: (binary file data)
- file: (multiple files allowed)
- folderId: (optional, folder ObjectId)

Response: 201 Created
{
  "files": [
    {
      "_id": "file_id",
      "originalName": "document.pdf",
      "size": 1024000,
      "uploadDate": "2026-04-24T10:30:00Z",
      "mimeType": "application/pdf"
    }
  ]
}
```

#### List User's Files
```
GET /api/files?search=test&mimeType=image&sort=uploadDate&order=desc&folderId=folder_id
Authorization: Bearer {token}

Query Parameters:
- search: Filter by filename (regex, case-insensitive)
- mimeType: Filter by MIME type (e.g., 'image', 'document')
- sort: Field to sort by (uploadDate, size, originalName)
- order: asc or desc
- folderId: Filter files in specific folder

Response: 200 OK
{
  "files": [
    {
      "_id": "file_id",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 2048000,
      "uploadDate": "2026-04-24T10:30:00Z",
      "isPublic": false,
      "folderId": "folder_id"
    }
  ]
}
```

#### Download File (Decryption Happens Here)
```
GET /api/files/download/{fileId}
Authorization: Bearer {token}

Response: 200 OK (file stream)
- Content-Type: original MIME type
- Content-Length: original file size
- Content-Disposition: attachment; filename="original.pdf"
- Body: decrypted file data
```

#### Get File Metadata
```
GET /api/files/{fileId}
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "file_id",
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 1024000,
  "uploadDate": "2026-04-24T10:30:00Z",
  "isPublic": true,
  "shareToken": "a1b2c3d4e5f6..."
}
```

#### Delete File
```
DELETE /api/files/{fileId}
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "File deleted successfully"
}
```

#### Enable Public Sharing
```
POST /api/files/{fileId}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "isPublic": true
}

Response: 200 OK
{
  "shareToken": "a1b2c3d4e5f6...",
  "shareUrl": "http://localhost:5173/share/a1b2c3d4e5f6..."
}
```

### Folder Endpoints

#### Create Folder
```
POST /api/folders
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Folder",
  "parentFolder": null  // or parent folder ObjectId
}

Response: 201 Created
{
  "_id": "folder_id",
  "name": "New Folder",
  "userId": "user_id",
  "parentFolder": null,
  "createdAt": "2026-04-24T10:30:00Z"
}
```

#### List Folders
```
GET /api/folders?parentFolder=folder_id
Authorization: Bearer {token}

Query Parameters:
- parentFolder: Filter by parent folder (null = root level)

Response: 200 OK
{
  "folders": [
    {
      "_id": "folder_id",
      "name": "Documents",
      "parentFolder": null,
      "createdAt": "2026-04-24T10:30:00Z"
    }
  ]
}
```

### Public Sharing Endpoints (No Auth Required)

#### Get Public File Info
```
GET /api/public/{shareToken}

Response: 200 OK
{
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

#### Download Public File
```
GET /api/public/{shareToken}/download

Response: 200 OK
- File stream (decrypted)
- Same as authenticated download
```

---

## Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    // Optional - OAuth users don't have password
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### File Schema

```javascript
{
  _id: ObjectId,
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  chunks: [String],  // Array of encrypted file paths
  iv: {
    type: String,    // Hex-encoded initialization vector
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,    // 32-char hex token for public sharing
    sparse: true,
    unique: true
  },
  folderId: {
    type: ObjectId,
    ref: 'Folder',
    default: null    // null = file in root
  }
}
```

### Folder Schema

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  parentFolder: {
    type: ObjectId,
    ref: 'Folder',
    default: null    // null = root level folder
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

---

## Security Implementation

### 1. Encryption at Rest

**Algorithm**: AES-256-CBC (Advanced Encryption Standard, 256-bit key, Cipher Block Chaining)

**Key Generation**:
```javascript
// 64 hex characters = 32 bytes = 256 bits
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
// Key must be exactly 32 bytes
if (encryptionKey.length !== 32) throw new Error('Invalid encryption key length');
```

**Per-File Random IV**:
```javascript
const iv = crypto.randomBytes(16);  // 16 bytes for CBC
// IV is stored hex-encoded in database, never reused
```

**Encryption Process**:
```javascript
const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
const encrypted = Buffer.concat([
  cipher.update(fileData),
  cipher.final()
]);
// Write encrypted data to storage
```

**Decryption Process**:
```javascript
const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
const decrypted = Buffer.concat([
  decipher.update(encryptedData),
  decipher.final()
]);
// Stream to client
```

### 2. Authentication & Authorization

**JWT Token Structure**:
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { id: userId, iat: timestamp, exp: timestamp + 7days }
Signature: HMAC-SHA256
```

**Token Usage**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Middleware**:
```javascript
// Validates token in Authorization header
// Extracts user ID and attaches to req.user
// Returns 401 if token invalid/expired
```

**Access Control**:
- User can only access their own files
- Public files accessible via share token (no auth)
- Server verifies ownership on every request

### 3. Password Security

**Hashing**:
```javascript
// bcrypt with 10 salt rounds (recommended)
const hash = await bcrypt.hash(password, 10);
// ~100ms per hash (intentional slowdown to prevent brute force)
```

**Validation**:
```javascript
// Timing-safe comparison
const match = await bcrypt.compare(inputPassword, storedHash);
```

**Requirements**:
- Minimum 6 characters (enforced in frontend)
- No plaintext storage
- No password sent in API responses

### 4. OAuth Security

**Google OAuth Flow**:
1. User clicks "Login with Google"
2. Frontend redirects to `/api/auth/google`
3. Backend redirects to Google consent screen
4. User grants permission
5. Google redirects to `/api/auth/google/callback` with code
6. Backend exchanges code for ID token
7. Backend verifies ID token and user email
8. Backend creates/links user account
9. Backend generates JWT token
10. Backend redirects to frontend with token in URL

**Security Measures**:
- Code exchange done server-side (not exposed client)
- HTTPS required in production
- Client ID/Secret never exposed to frontend

### 5. File Upload Security

**Validation**:
- File size limits (configurable, e.g., 100MB)
- MIME type validation
- Filename sanitization
- User authentication required

**Storage**:
- Files encrypted before storage
- Original filename never used as file path
- File stored as `{fileId}_encrypted`
- Temporary files deleted after processing

### 6. CORS & Headers

```javascript
// Express CORS configuration
// Only frontend URL allowed to make requests
// Credentials included in requests
// Prevents CSRF attacks
```

### 7. Data Minimization

**What Server Never Sees (Encrypted)**:
- File contents
- File names (sent encrypted during upload)
- File metadata

**What Server Stores (Unencrypted)**:
- User email (required for login)
- File size (needed for UI display)
- Encrypted file paths (not sensitive)
- Original filename (for download, stored unencrypted - LIMITATION)

---

## File Encryption Details

### Upload Encryption Flow

```
User selects file
         ↓
Frontend sends to /api/files/upload
         ↓
Backend receives multipart form data
         ↓
Multer saves to temp_uploads/{tempId}
         ↓
Backend generates File document with _id
         ↓
Backend reads temp file
         ↓
Generate random 16-byte IV
         ↓
Create AES-256-CBC cipher with IV
         ↓
Stream encrypt temp file content
         ↓
Save encrypted content to hdfs_storage/{_id}_encrypted
         ↓
Update File document with encryption IV
         ↓
Delete temp file
         ↓
Return success to frontend
```

### Download Decryption Flow

```
User clicks download
         ↓
Frontend calls GET /api/files/download/{fileId}
         ↓
Backend validates user owns file
         ↓
Get File document (includes IV)
         ↓
Read encrypted file from hdfs_storage/{fileId}_encrypted
         ↓
Create AES-256-CBC decipher with stored IV
         ↓
Stream decrypt to HTTP response
         ↓
Set proper MIME type and filename headers
         ↓
Browser downloads decrypted file
         ↓
Decrypted data never stored on disk
```

### Encryption Security Notes

- **IV Randomness**: RandomBytes(16) ensures each file has unique IV
- **Key Length**: Exactly 32 bytes (256 bits) required
- **Mode**: CBC mode with PKCS7 padding (automatic in Node.js)
- **No Key Derivation**: Key used directly (make sure to store securely)
- **IV Storage**: Hex-encoded in MongoDB, can be public (part of security)
- **Decryption On-Demand**: Files never stored decrypted server-side

---

## Authentication System

### Registration Flow

```
1. User enters email and password
   ↓
2. Frontend validates password (6+ chars)
   ↓
3. Frontend sends POST /api/auth/register
   ↓
4. Backend validates email format
   ↓
5. Backend checks if user already exists
   ↓
6. Backend hashes password with bcrypt (10 rounds)
   ↓
7. Backend creates User document
   ↓
8. Backend generates JWT token (expires 7 days)
   ↓
9. Response includes token and user info
   ↓
10. Frontend stores token in localStorage
   ↓
11. Frontend redirects to /home
```

### Login Flow

```
1. User enters email and password
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend finds user by email
   ↓
4. Backend compares password with bcrypt
   ↓
5. If match: generate JWT token
   ↓
6. Response includes token
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend redirects to /home
```

### Google OAuth Flow

```
1. User clicks "Login with Google" button
   ↓
2. Frontend redirects to /api/auth/google
   ↓
3. Backend initiates PassportJS Google strategy
   ↓
4. User is redirected to Google consent screen
   ↓
5. User grants permission
   ↓
6. Google redirects to /api/auth/google/callback?code=...
   ↓
7. Backend exchanges code for ID token
   ↓
8. Backend extracts email and googleId
   ↓
9. Backend checks if user exists:
      - If exists: return JWT
      - If not: create new User with googleId
   ↓
10. Backend generates JWT token
   ↓
11. Backend redirects to /home?token=...&email=...
   ↓
12. Frontend extracts token from URL
   ↓
13. Frontend stores token in localStorage
   ↓
14. Frontend redirects to file explorer
```

### Token Refresh & Expiration

**Current Implementation**:
- Tokens expire in 7 days
- No refresh token mechanism
- Manual re-login required after expiration

**Production Consideration**:
To add token refresh functionality:
1. Create refresh token endpoint
2. Generate refresh tokens (longer expiry, e.g., 30 days)
3. Implement token refresh in frontend interceptor
4. Refresh automatically when access token expires

### Protected Routes

**Frontend**:
```javascript
// PrivateRoute component wraps protected routes
// Checks for token in localStorage
// Redirects to /login if token missing
// Allows access if token present
```

**Backend**:
```javascript
// auth middleware validates JWT in every request
// Extracts user ID from token payload
// Attaches user to request object
// Returns 401 if token invalid
// All file operations require this middleware
```

---

## Frontend Architecture

### App Routing

```
GET /                → RootHandler (token extraction)
GET /login           → Login component
GET /home            → Home page (protected)
GET /files           → Files page (protected)
GET /files/:folderId → Files page (protected, filtered by folder)
GET /share/:token    → PublicShare page (public)
*                    → Redirect to /home
```

### State Management

**LocalStorage**:
- `token` - JWT token for authentication
- `email` - User email (convenience)

**Component State (React Hooks)**:
- `useState` for local component state
- `useCallback` for memoized functions
- Direct API calls via axios (no Redux/Context)

### Component Hierarchy

```
App
├── Router
│   ├── Route: / (RootHandler)
│   ├── Route: /login (Login)
│   ├── Route: /home (Layout + Home)
│   ├── Route: /files (Layout + Files)
│   └── Route: /share/:token (PublicShare)
│
├── Layout (for protected pages)
│   ├── Navbar
│   │   ├── Logo
│   │   ├── ThemeToggle
│   │   └── ProfileDropdown
│   │
│   ├── Sidebar
│   │   ├── Nav Links
│   │   └── Logout Button
│   │
│   └── Main Content
│       └── Component (Home, Files, etc.)
│
├── Login Component
│   ├── Email/Password Form
│   ├── Google OAuth Button
│   └── Register/Login Toggle
│
├── Home Component
│   ├── Welcome Message
│   ├── Quick Upload
│   ├── Recent Files List
│   └── Quick Actions
│
├── Files Component
│   ├── Breadcrumb Navigation
│   ├── Folder Creation
│   ├── Search & Filter Bar
│   ├── FileList Component
│   │   ├── File Rows
│   │   └── Action Buttons
│   └── UploadArea Component
│       ├── Drag-Drop Zone
│       └── File Progress
│
└── PublicShare Component
    ├── File Information
    ├── Download Button
    └── Error Handling
```

### Styling Approach

**Tailwind CSS**:
- Utility-first CSS framework
- Responsive design (mobile-first)
- Dark mode via class-based theming
- Custom configuration in `tailwind.config.js`

**Color Scheme**:
- Light mode: White backgrounds, dark text
- Dark mode: Dark backgrounds, light text
- Brand colors: Blue for primary, Red for destructive

**Responsive Breakpoints**:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

---

## File Upload & Download Flow

### Complete Upload Process

```
Step 1: User Interface
  - User drags files to UploadArea OR clicks to browse
  - UploadArea creates FormData with file(s)
  - Optional folderId selected for upload destination

Step 2: Frontend Upload
  - POST /api/files/upload with FormData
  - Axios tracks onUploadProgress event
  - UI shows progress bar per file (0-100%)
  
Step 3: Backend Receive
  - Multer middleware processes multipart/form-data
  - Each file saved to temp_uploads/{tempId}
  
Step 4: Backend Processing
  - Create File document in MongoDB (gets _id)
  - Generate random 16-byte IV with crypto.randomBytes
  - Stream read temp file
  - Create cipher with AES-256-CBC, key, and IV
  - Stream encrypt to hdfs_storage/{fileId}_encrypted
  - Update File document with IV (hex-encoded)
  - Delete temp file from temp_uploads
  
Step 5: Backend Response
  - Return 201 with file metadata:
    {
      _id, originalName, mimeType, size, uploadDate
    }
  
Step 6: Frontend Update
  - Show success toast notification
  - Refresh file list
  - Clear progress bar
  - Optionally move file to folder
```

### Complete Download Process

```
Step 1: User Action
  - User clicks download button on file
  - Frontend calls GET /api/files/download/{fileId}

Step 2: Backend Validation
  - Middleware validates JWT token
  - Extract user ID from token
  - Find File document by ID
  - Verify req.user.id === file.uploadedBy
  - If public file: skip validation, allow download
  
Step 3: Backend Decryption
  - Read encrypted file from hdfs_storage/{fileId}_encrypted
  - Retrieve IV from File document (convert from hex to Buffer)
  - Create decipher with AES-256-CBC, key, and stored IV
  - Stream decrypt file content
  
Step 4: Backend Response
  - Set HTTP headers:
    - Content-Type: {original MIME type}
    - Content-Length: {original file size}
    - Content-Disposition: attachment; filename="{originalName}"
  - Pipe decrypted stream to HTTP response
  
Step 5: Browser Download
  - Browser receives Content-Disposition header
  - Automatic download triggered
  - File saved to user's Downloads folder
  - Decrypted file never stored on server
```

### Progress Tracking

**Upload Progress**:
```javascript
axios.post('/api/files/upload', formData, {
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    setProgress(percentCompleted);  // 0-100
  }
});
```

**Download Progress**:
```javascript
// Download handled by browser
// No client-side progress tracking
// Server streams file data
```

---

## Environment Variables

### Backend (.env file)

```bash
# Server Configuration
PORT=5000                                  # Port to run Express server
NODE_ENV=development                       # development or production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/auracloud
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/auracloud

# JWT Configuration
JWT_SECRET=super-secret-key-change-in-prod # Secret key for signing JWT tokens
JWT_EXPIRY=7d                              # Token expiration (7 days)

# Encryption Configuration (CRITICAL)
# Must be exactly 64 hex characters (32 bytes = 256 bits)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Session Configuration
SESSION_SECRET=session-secret-key          # Secret for express-session

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173         # Frontend URL for CORS

# Optional: Storage Configuration
# STORAGE_PATH=./hdfs_storage              # Path for encrypted file storage
# TEMP_UPLOAD_PATH=./temp_uploads          # Path for temporary uploads
# MAX_FILE_SIZE=104857600                  # Maximum file size (100MB default)
```

### Frontend Configuration

**No .env file needed for development.**

Hardcoded configuration in `frontend/src/utils/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';

// To change API URL for production:
// const API_URL = 'https://api.yourproduction.com/api';
```

---

## Development Workflow

### Code Structure Overview

**Backend Folder**:
- `server.js` - Express app initialization and middleware setup
- `middleware/auth.js` - JWT verification middleware
- `models/` - Mongoose schemas (User, File, Folder)
- `routes/` - Route handlers for different API sections
- `utils/` - Utility functions for encryption and storage

**Frontend Folder**:
- `src/App.jsx` - Main app component with routing
- `src/main.jsx` - Vite entry point
- `src/components/` - Reusable React components
- `src/pages/` - Full page components
- `src/utils/api.js` - Axios configuration

### Development Commands

**Backend Development**:
```bash
cd backend

# Install dependencies
npm install

# Start server (standard)
npm start
node server.js

# Development mode with auto-reload (if nodemon installed)
npm run dev

# Run tests
npm test

# Run specific test file
node test_auth.js
```

**Frontend Development**:
```bash
cd frontend

# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint

# Format code (if prettier installed)
npm run format
```

### Common Development Tasks

**Adding New API Endpoint**:
1. Create route handler in `backend/routes/`
2. Add middleware for auth if needed
3. Implement validation and business logic
4. Export route and import in `server.js`
5. Register route with `app.use('/api/path', route)`
6. Document in API section above

**Adding New Frontend Component**:
1. Create component file in `src/components/` or `src/pages/`
2. Import and use in parent component
3. Setup state with `useState`
4. Make API calls with axios
5. Handle loading/error states
6. Add styling with Tailwind CSS classes

**Testing Authentication Locally**:
```bash
# Run the test script
cd backend
node test_auth.js

# Or make manual requests:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Troubleshooting

### Backend Issues

#### "Port 5000 already in use"
```bash
# Find and kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# macOS/Linux:
lsof -i :5000
kill -9 {PID}

# Or change PORT in .env file
```

#### "MongoDB connection error"
```bash
# Check MongoDB is running
mongod --version

# Verify connection string in .env
# Test connection:
mongo "mongodb://localhost:27017/auracloud"

# For MongoDB Atlas:
# 1. Check username/password correct (URL-encode special chars)
# 2. Add your IP to Atlas whitelist
# 3. Use full connection string provided by Atlas
```

#### "ENCRYPTION_KEY error"
```bash
# Error: Encryption key validation failed
# Solution: Regenerate 64-char hex key

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and update .env:
ENCRYPTION_KEY=<paste-output-here>

# Verify:
node -e "console.log(Buffer.from(process.env.ENCRYPTION_KEY, 'hex').length)"
# Should output: 32
```

#### "JWT token invalid/expired"
```bash
# Frontend issue: Token corrupted or expired
# Solution: Clear localStorage and re-login

# In browser console:
localStorage.clear();
location.reload();

# Then login again
```

### Frontend Issues

#### "Cannot GET /"
```bash
# Frontend dev server not running
# Solution: Start dev server in frontend directory
cd frontend
npm run dev

# Should see: ➜  Local:   http://localhost:5173/
```

#### "API calls failing (CORS error)"
```bash
# Error in console: "Access to XMLHttpRequest blocked by CORS policy"
# Causes: 
# 1. Backend not running
# 2. API URL incorrect
# 3. CORS misconfigured

# Solutions:
# 1. Check backend running: curl http://localhost:5000/api/health
# 2. Check API URL in frontend/src/utils/api.js
# 3. Check FRONTEND_URL in backend/.env matches http://localhost:5173
```

#### "Login page not loading"
```bash
# Check browser console for errors
# Common issues:
# 1. Frontend dev server not started
# 2. Backend not running (needed for Google OAuth)
# 3. JavaScript bundle not loading

# Solutions:
# 1. Restart frontend: cd frontend && npm run dev
# 2. Restart backend: cd backend && npm start
# 3. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### File Upload Issues

#### "File not uploading"
```bash
# Check:
# 1. File size under limit (default 100MB)
# 2. User authenticated (check localStorage token)
# 3. Folder exists (if specifying folderId)

# Debug:
# - Check browser Network tab for failed request
# - Check browser Console for error messages
# - Check backend logs for server-side error
```

#### "File upload successful but not appearing"
```bash
# Check:
# 1. Refresh file list (page reload)
# 2. File in correct folder (check breadcrumb)
# 3. Search filter not hiding file

# Debug:
# - Check MongoDB: find files by user
# - Check hdfs_storage for encrypted file: ls backend/hdfs_storage
# - Check temp_uploads cleaned up: ls backend/temp_uploads (should be empty)
```

### Download Issues

#### "Download fails"
```bash
# Possible causes:
# 1. File deleted
# 2. Encryption key changed (files become inaccessible)
# 3. IV corrupted in database

# Test:
# 1. Check file still in MongoDB
# 2. Check encrypted file exists in hdfs_storage
# 3. Check IV has valid hex format

# Recovery:
# If ENCRYPTION_KEY was changed, files are unrecoverable
# Always backup .env file before changing ENCRYPTION_KEY
```

### Performance Issues

#### "Uploads/downloads slow"
```bash
# Causes:
# 1. Large files (expected for multi-MB files)
# 2. Slow internet connection
# 3. Disk I/O bottleneck
# 4. MongoDB query slow

# Optimization:
# 1. Add indexes to MongoDB: db.files.createIndex({uploadedBy: 1})
# 2. Implement request compression: npm install compression
# 3. Use CDN for static assets
# 4. Implement chunked upload for large files
```

#### "Application using lots of memory"
```bash
# Cause: Large files stored in memory
# Node.js has single-threaded event loop

# Optimization:
# 1. Ensure using streams (not loading full file in memory)
# 2. Increase Node heap: node --max-old-space-size=4096 server.js
# 3. Implement clustering or load balancing
```

### Google OAuth Issues

#### "Google OAuth not working"
```bash
# Check:
# 1. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
# 2. Redirect URI in Google Console matches exactly:
#    http://localhost:5000/api/auth/google/callback
# 3. Authorized JavaScript origins includes: http://localhost:5173

# Common mistakes:
# - Using https instead of http (local)
# - Missing /api/auth/google/callback (common typo)
# - Port number wrong (5000, not 3000)

# Test:
# Visit: http://localhost:5000/api/auth/google
# Should redirect to Google consent screen
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Generate strong JWT_SECRET (min 32 chars)
- [ ] Generate strong ENCRYPTION_KEY (64 hex chars)
- [ ] Use MongoDB Atlas or managed MongoDB service
- [ ] Enable HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Update API_URL for production domain
- [ ] Configure FRONTEND_URL for production domain
- [ ] Disable debug logging
- [ ] Setup environment variables securely
- [ ] Test file encryption/decryption
- [ ] Backup encryption key (cannot recover files if lost)
- [ ] Setup monitoring and error logging
- [ ] Setup automated backups for MongoDB
- [ ] Test OAuth with production URLs
- [ ] Setup rate limiting and DDoS protection

### Deployment Platforms

**Heroku**:
```bash
heroku create your-app-name
heroku config:set ENCRYPTION_KEY=...
heroku config:set MONGODB_URI=...
git push heroku main
```

**AWS / Google Cloud / Azure**:
- Use managed services for MongoDB
- Deploy with Docker containers
- Use Kubernetes for scaling
- Setup CI/CD pipeline

**DigitalOcean / Linode**:
```bash
# SSH into server
# Install Node.js
# Clone repository
# Setup environment variables
# Use PM2 or systemd for process management
# Use Nginx as reverse proxy
```

---

## Additional Resources

### Documentation Links
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [JWT Introduction](https://jwt.io/introduction)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

### Useful Tools
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing tool
- **VS Code** - Code editor with extensions
- **Git** - Version control

---

## License & Contribution

This project is created for educational and personal use.

**Contributing**: If you want to improve this project:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## Support & Issues

For issues or questions:
1. Check Troubleshooting section above
2. Check browser console for errors
3. Check backend logs: `node server.js`
4. Verify all environment variables set correctly
5. Check MongoDB connection
6. Try clearing browser cache and localStorage

---

## Quick Reference Commands

```bash
# Backend
cd backend && npm install                   # Install dependencies
node server.js                              # Start server
npm start                                   # Start server (via package.json)

# Frontend
cd frontend && npm install                  # Install dependencies
npm run dev                                 # Start dev server
npm run build                               # Production build
npm run preview                             # Preview production build

# Database
mongo                                       # Connect to local MongoDB
mongod                                      # Start MongoDB daemon

# Utilities
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # Generate encryption key
curl http://localhost:5000/api/health      # Check backend health
```

---

*Last Updated: April 24, 2026*

This README covers comprehensive documentation for the Aura Cloud project. For updates or corrections, please refer to the individual component files and test the application regularly.