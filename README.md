# 3W Social

3W Social is a mini social media application built for the 3W Full Stack Internship Round 1 assignment. It allows users to sign up, log in, create posts with text and image uploads, like and comment on posts, and browse a paginated feed.

## Features

- User signup and login with JWT authentication
- Secure password hashing with bcryptjs
- Public post feed with newest posts first
- Create text-only, image-only, and text + image posts
- Like and unlike posts without page reload
- Comment on posts with embedded comment data
- Username-based social interactions
- Pagination with Load More support
- Protected routes for authenticated actions
- Responsive MUI-based interface
- Clean error handling and snackbar feedback

## Tech Stack

Frontend
- React.js
- Vite
- Material UI
- Axios
- React Router

Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary-ready image handling

## Architecture

The application is split into a frontend and backend service:

- Frontend: Vite React app served locally on port 5173
- Backend: Express API served on port 5000 by default
- Database: MongoDB Atlas
- Images: stored as URL strings in MongoDB; binary data is not stored in documents

## Database Design

MongoDB contains exactly two collections:

- users
- posts

Likes and comments are embedded inside each post document and are not stored in separate collections.

Example post structure:

- user: { userId, username }
- text
- image
- likes: [{ userId, username }]
- comments: [{ userId, username, text, createdAt }]

## Authentication

- Signup: POST /api/auth/signup
- Login: POST /api/auth/login
- Current user: GET /api/auth/me
- JWT tokens are attached automatically in the frontend API client
- Protected actions require a valid bearer token
- Invalid and expired tokens are handled centrally in the backend

## API Endpoints

Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

Posts
- GET /api/posts?page=1&limit=10
- GET /api/posts/:id
- POST /api/posts
- DELETE /api/posts/:id
- POST /api/posts/:id/like
- POST /api/posts/:id/comment

Health
- GET /
- GET /api/health

## Local Setup

1. Install backend dependencies:
   cd backend
   npm install

2. Install frontend dependencies:
   cd frontend
   npm install

3. Create environment files from the examples:
   - backend/.env from backend/.env.example
   - frontend/.env from frontend/.env.example

4. Configure the values in the .env files.

5. Start the backend:
   cd backend
   npm run dev

6. Start the frontend:
   cd frontend
   npm run dev

## Environment Variables

Backend (.env)
- PORT=5000
- MONGODB_URI=
- JWT_SECRET=
- CLIENT_URL=http://localhost:5173
- Optional image storage variables depending on the deployment setup

Frontend (.env)
- VITE_API_URL=http://localhost:5000/api

If Supabase is used in a future variation, keep the keys in .env only and do not commit them to GitHub.

## Image Upload

The current implementation uses a URL-based image flow to avoid storing large binary data in MongoDB. Images are uploaded through the backend and stored as a public URL in the post. Local development may use a filesystem fallback and production deployments can use Cloudinary-compatible storage configuration.

Important requirements:
- Valid image types only: JPG, PNG, WEBP
- File size limit enforced on upload
- Image URL stored in MongoDB
- Raw image binary not stored in the database document

## Deployment

Frontend
- Platform: Vercel
- Root directory: frontend
- Build command: npm run build
- Output directory: dist
- Environment: VITE_API_URL=<RENDER_BACKEND_URL>/api

Backend
- Platform: Render
- Root directory: backend
- Build command: npm install
- Start command: npm start
- Environment: MONGODB_URI, JWT_SECRET, and any required storage credentials

Database
- MongoDB Atlas connection string configured in the backend environment

## Testing

The project has been audited and the frontend production build was verified locally. Backend startup was also checked to confirm runtime requirements and missing environment configuration.

Manual validation checklist:
- Signup
- Login
- Post creation (text, image, text+image)
- Feed refresh
- Like/unlike behavior
- Commenting
- Deletion permissions
- Pagination
- Mobile responsive layout
- Logout and protected route enforcement

## Screenshots

Add screenshots of the login, feed, post composer, and mobile views here before final submission.

## Future Improvements

- Add richer post editing functionality
- Add profile pages and follower logic
- Improve analytics and moderation tooling
- Add infinite scrolling as an alternative to pagination
- Expand media storage options and CDN optimization
