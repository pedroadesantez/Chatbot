# Quick Start Guide

Get your chatbot running in under 5 minutes!

## 🚀 Fastest Way to Get Started

### 1. Get Your OpenAI API Key (2 minutes)
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up/login and verify your phone
3. Add a payment method (gets $5 free credits)
4. Create new API key and copy it

### 2. Configure Backend (1 minute)
```bash
cd backend
cp .env.example .env
```

Edit `.env` and replace:
```env
OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Start Both Servers (2 minutes)
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### 4. Start Chatting!
Visit [http://localhost:3000](http://localhost:3000) and start your first conversation!

## ✅ Is It Working?

You should see:
- ✅ Clean chat interface loads
- ✅ Dark/light mode toggle works
- ✅ Can type and send messages
- ✅ AI responds with streaming text
- ✅ Messages appear in chat history
- ✅ "Clear Chat" button works

## 🛠️ Troubleshooting

**Backend won't start?**
- Check if port 3001 is free: `lsof -i :3001`
- Verify your OpenAI API key is correct
- Check `.env` file exists in backend folder

**Frontend won't connect?**
- Ensure backend is running on port 3001
- Check console for CORS errors
- Verify `.env.local` has correct API URL

**AI not responding?**
- Check OpenAI API key is valid
- Verify you have API credits
- Look at backend console for error messages

## 🚀 Ready to Deploy?

Once it's working locally:

1. **Deploy Backend**: Use Render.com (free tier)
2. **Deploy Frontend**: Use Vercel.com (free tier) 
3. **Update Environment Variables**: Point frontend to your backend URL

See `PRODUCTION_SETUP.md` for detailed deployment instructions.

## 💡 Next Steps

- Customize the AI's personality by editing the system prompt
- Add MongoDB for persistent chat history
- Set up user authentication
- Deploy to production for others to use

**Need help?** Check the main `README.md` for comprehensive documentation!