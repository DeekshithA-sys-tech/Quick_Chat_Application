# Chat Application

A real-time chat application built with React, Express, MongoDB, and Socket.io. This application enables users to communicate in real-time with features like group chats, user profiles, and media sharing.

## Features

- **Real-time Messaging** - Instant message delivery using Socket.io
- **User Authentication** - JWT-based authentication with secure password hashing
- **Group Chats** - Create and manage group conversations
- **User Profiles** - Customizable user profiles with avatar support
- **Media Sharing** - Upload and share images via Cloudinary integration
- **Responsive Design** - Beautiful, responsive UI built with React and Tailwind CSS
- **Message History** - Persistent message storage with MongoDB

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **React Hot Toast** - Toast notifications

### Backend
- **Express** - Node.js web framework
- **MongoDB & Mongoose** - Database and ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting and management
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
Chat-application/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context for state management
│   │   ├── lib/           # Utility functions
│   │   ├── assets/        # Static assets
│   │   └── App.jsx        # Main app component
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Dependencies
│
└── server/                # Express backend application
    ├── controllers/       # Request handlers
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    ├── middleware/       # Custom middleware
    ├── lib/              # Utility functions
    ├── server.js         # Server entry point
    └── package.json      # Dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/chat-application.git
cd chat-application
```

### 2. Setup Backend

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the server directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Setup Frontend

Navigate to the client directory:
```bash
cd ../client
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the client directory (if needed):
```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Start Backend Server
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

### Start Frontend Development Server
In a new terminal:
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

### Server
- `npm start` - Start the server with nodemon (auto-reload)

## API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Message Routes
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

## Socket.io Events

### Client to Server
- `send_message` - Send a new message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server to Client
- `receive_message` - New message received
- `user_typing` - Someone is typing
- `user_stopped_typing` - Someone stopped typing

## Environment Variables

### Server (.env)
```env
PORT                    # Server port (default: 5000)
MONGODB_URI            # MongoDB connection string
JWT_SECRET             # Secret key for JWT tokens
CLOUDINARY_NAME        # Cloudinary account name
CLOUDINARY_API_KEY     # Cloudinary API key
CLOUDINARY_API_SECRET  # Cloudinary API secret
```

### Client (.env)
```env
VITE_API_URL           # Backend API URL
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the `server/package.json` file for details.

## Author

Deekshith_A

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running and connection string is correct
- Check if ports 5000 and 5173 are not in use
- Verify CORS settings in the backend

### Authentication Errors
- Make sure JWT_SECRET is set in environment variables
- Clear browser cookies/localStorage if having token issues

### Image Upload Issues
- Verify Cloudinary credentials are correct
- Check file size limits
- Ensure proper CORS headers are configured

## Support

For issues and questions, please open an issue on the GitHub repository.

---

Happy chatting! 🚀
