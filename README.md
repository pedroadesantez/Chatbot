# AI Chatbot Application

A modern, full-stack chatbot application built with Next.js, Express, and OpenAI. Features real-time streaming responses, dark mode, and a clean, responsive design.

## Features

- 🤖 **AI-Powered Chat**: Integration with OpenAI GPT models (GPT-3.5/GPT-4)
- 💬 **Real-time Streaming**: Messages stream in real-time for better UX
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- 📱 **Mobile Friendly**: Fully responsive design for all devices
- 💾 **Conversation Persistence**: Chat history stored locally and optionally in MongoDB
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed
- 🔒 **Security**: Rate limiting, CORS protection, and secure API endpoints
- 📝 **TypeScript**: Full type safety across frontend and backend

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **next-themes** - Dark mode support

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **OpenAI API** - AI responses
- **MongoDB** - Database (optional)
- **Mongoose** - ODM for MongoDB

## Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- MongoDB (optional, for persistent storage)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd chatbot
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your settings
# Required: OPENAI_API_KEY
# Optional: MONGODB_URI for persistence
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local if needed (default points to localhost:3001)
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to start chatting!

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# MongoDB (OPTIONAL - for persistent storage)
MONGODB_URI=mongodb://localhost:27017/chatbot

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

### POST /api/chat
Send a message to the AI and get a response.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "uuid-string",
  "stream": true
}
```

**Response (streaming):**
```
data: {"chunk": "Hello", "messageId": "uuid", "conversationId": "uuid", "done": false}
data: {"chunk": "!", "messageId": "uuid", "conversationId": "uuid", "done": false}
data: {"chunk": "", "messageId": "uuid", "conversationId": "uuid", "done": true, "fullMessage": "Hello!"}
```

### GET /api/chat/conversation/:id
Get conversation history.

### DELETE /api/chat/conversation/:id
Clear conversation history.

### GET /health
Health check endpoint.

## Development

### Code Quality

**Backend:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

**Frontend:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

### Building for Production

**Backend:**
```bash
npm run build       # Compile TypeScript
npm start           # Run production server
```

**Frontend:**
```bash
npm run build       # Build optimized bundle
npm start           # Start production server
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
4. Deploy automatically

### Backend (Render/Railway/Heroku)

1. Push your code to GitHub
2. Create a new service on your platform
3. Set all required environment variables
4. Deploy

**For Render:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## Project Structure

```
chatbot/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Main server file
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/               # Next.js React app
│   ├── app/               # Next.js 14 App Router
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript types
│   ├── .env.local.example # Environment variables template
│   └── package.json
│
└── README.md              # This file
```

## Features Explanation

### 🤖 AI Integration
- Uses OpenAI's GPT models for natural conversations
- Configurable model selection (GPT-3.5-turbo, GPT-4)
- Proper context management for coherent conversations

### 💬 Real-time Streaming
- Server-Sent Events (SSE) for real-time message streaming
- Smooth typing animation while AI responds
- Optimized for better user experience

### 🎨 Modern UI/UX
- Clean, minimalist design inspired by modern chat apps
- Smooth animations with Framer Motion
- Responsive layout that works on all devices
- Dark mode with system preference detection

### 💾 Data Persistence
- Local storage for immediate message persistence
- Optional MongoDB integration for cross-device sync
- Conversation history management

### 🔒 Security & Performance
- Rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests
- Request/response compression
- Optimized bundle splitting with Next.js

## Troubleshooting

### Common Issues

**"OpenAI API error"**
- Check your OPENAI_API_KEY is correct
- Ensure you have sufficient API credits
- Verify the model name is correct

**"Connection refused" / Network errors**
- Ensure backend is running on port 3001
- Check CORS configuration
- Verify NEXT_PUBLIC_API_URL points to correct backend URL

**MongoDB connection issues**
- MongoDB is optional - app works without it
- Check MONGODB_URI format
- Ensure MongoDB is running (if using local instance)

### Performance Optimization

- Messages are streamed for better perceived performance
- Components use React.memo for re-render optimization
- Tailwind CSS is purged for minimal bundle size
- Next.js optimizes bundle splitting automatically

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the environment variables setup
3. Ensure all dependencies are installed correctly
4. Check the browser console and server logs for errors

For additional help, please open an issue in the GitHub repository.