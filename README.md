# 🎬 Movie Dashboard

A personal movie tracking dashboard with a futuristic dark theme, built with React, Node.js, and SQLite.

## ✨ Features

- **Add & Manage Movies**: Track movies you've watched with ratings (1-10), genres, and notes
- **Watch History Timeline**: Visual timeline of when you watched movies
- **Smart Recommendations**: Get movie suggestions based on your favorite genres
- **Advanced Search & Filter**: Search by title, filter by genre and rating
- **Analytics Dashboard**: View statistics like total movies, average rating, and top genres
- **Futuristic UI**: Dark theme with neon accents, glassmorphism, and smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**:
    ```bash
    cd Movie_Dashboard
    ```

2. **Install backend dependencies**:
    ```bash
    cd backend
    npm install
    cd ..
    ```

3. **Install frontend dependencies**:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4. **Environment configuration** (optional):
    - No environment variables are required for local development
    - See `.env.example` for optional configuration options
    - The Vite dev server automatically handles API routing

### Running the Application

#### Option 1: Use the start script (Recommended)

The easiest way to run both servers is to use the provided start script:

```bash
./start.sh
```

This will start both the backend and frontend servers in the background and keep them running.

Press `Ctrl+C` to stop both servers.

#### Option 2: Run in separate terminals

**Terminal 1 - Backend**:
```bash
cd backend
node server.js
```

The backend will start on `http://localhost:3000`

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

#### Option 3: Run with single command (Linux/Mac)

```bash
cd backend && node server.js &
cd frontend && npm run dev
```

### Access the Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

## 📱 Access from Other Devices on WiFi

To access the dashboard from other devices on your local network:

### 1. Find your Linux PC's IP address

```bash
ip addr show | grep inet
```

Look for an IP address like `192.168.x.x` or `10.0.x.x`

### 2. Allow the ports through your firewall

```bash
sudo ufw allow 3000/tcp  # Backend port
sudo ufw allow 5173/tcp  # Frontend port
```

### 3. Configure network access (optional)

The Vite dev server automatically proxies `/api` requests to the backend at `http://localhost:3000`. No environment configuration is needed for local development.

If you need to connect to a backend on a different network, see `.env.example` for optional configuration options.

### 4. Access from other devices

From any device on your WiFi network:
- **Frontend**: `http://<YOUR_IP>:5173`
- **Backend API**: `http://<YOUR_IP>:3000`

For example, if your IP is `192.168.1.100`:
- Frontend: `http://192.168.1.100:5173`
- Backend: `http://192.168.1.100:3000`

## 🛠️ Project Structure

```
Movie_Dashboard/
├── backend/              # Node.js + Express server
│   ├── database.js      # SQLite database setup
│   ├── server.js        # Main server file
│   ├── routes/          # API routes
│   └── package.json
├── frontend/            # React + Vite app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── api/         # API client
│   │   ├── utils/       # Context and utilities
│   │   ├── App.jsx      # Main app component
│   │   └── index.css    # Styles
│   └── package.json
├── movies.db           # SQLite database (auto-created)
└── README.md
```

## 🎨 Features Overview

### Movies Tab
- View all your movies in a grid layout
- Search by title or notes
- Filter by genre and rating
- Add, edit, and delete movies

### Timeline Tab
- Visual timeline of your watch history
- Grouped by date
- Animated timeline nodes

### Recommendations Tab
- Personalized movie suggestions
- Based on your favorite genres
- Genre distribution chart

## 🗄️ Database

The app uses SQLite for data storage. The database file (`movies.db`) is automatically created in the project root when you first run the backend.

**Movies Table Schema**:
- `id`: Unique identifier
- `title`: Movie title
- `rating`: Rating from 1-10
- `genre`: Movie genre
- `date_watched`: Date you watched the movie
- `notes`: Personal notes/thoughts
- `created_at`: Timestamp when added

## 🔧 Tech Stack

**Backend**:
- Node.js + Express
- SQLite3
- CORS
- Body-parser

**Frontend**:
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)

## 📝 API Endpoints

- `GET /api/movies` - Get all movies (with optional search/filter params)
- `POST /api/movies` - Add a new movie
- `PUT /api/movies/:id` - Update a movie
- `DELETE /api/movies/:id` - Delete a movie
- `GET /api/analytics` - Get analytics and recommendations

## 🚀 Quick Start with Start Script

The easiest way to get started:

```bash
./start.sh
```

Then open your browser to: `http://localhost:5173`

## 🎯 Tips

1. **Backup your data**: The `movies.db` file contains all your data. Regularly back it up!
2. **Port conflicts**: If ports 3000 or 5173 are in use, you can change them in:
   - Backend: `backend/server.js` (change `PORT` variable)
   - Frontend: `frontend/vite.config.js` (change `server.port`)
3. **Persistent access**: For easy access from multiple devices, consider:
   - Setting up a static IP for your Linux PC
   - Creating a bookmark on your devices
   - Using a local DNS (optional)

## 🐛 Troubleshooting

**Backend won't start**:
- Check if port 3000 is already in use
- Ensure Node.js is installed: `node --version`

**Frontend won't start**:
- Check if port 5173 is already in use
- Ensure dependencies are installed: `cd frontend && npm install`

**Can't access from other devices**:
- Verify both devices are on the same WiFi network
- Check firewall settings: `sudo ufw status`
- Ensure ports are allowed: `sudo ufw allow 3000/tcp && sudo ufw allow 5173/tcp`
- Verify your IP address hasn't changed

**Movies not saving**:
- Check backend is running
- Check browser console for errors
- Verify `movies.db` file exists and has write permissions

## 📄 License

This project is open source and available for personal use.

## 🎉 Enjoy Your Movie Dashboard!

Track your movie journey and discover new favorites! 🍿