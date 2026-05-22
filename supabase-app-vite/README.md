# CS 3733 - Supabase File Upload/Download Demo

**Course:** CS 3733 - Software Engineering  
**Instructor:** Prof. Wilson Wong  
**Project:** Final Project Component Demonstration

## What This Does
A React application that allows users to:
- Upload a `.txt` file from their computer to Supabase storage
- View all uploaded files
- View file contents in the browser
- Download files back to their device
- Delete files from storage

## Architecture
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express.js middleware layer
- **Storage:** Supabase

## How to Run

### Prerequisites
- Node.js installed
- Git installed

### Step 1 — Clone the repo
```bash
git clone https://github.com/TheArXen/CS3733ReactFinal.git
cd CS3733ReactFinal
```

### Step 2 — Start the Express server (Terminal 1)
```bash
cd server
npm install
npm start
```
Server runs on `http://localhost:5000`

### Step 3 — Start the React app (Terminal 2)
```bash
cd supabase-app-vite
npm install
npm run dev
```
App runs on `http://localhost:5173`

### Step 4 — Open in browser
http://localhost:5173

## API Endpoints
- `POST /upload` — uploads a text file to Supabase
- `GET /files` — lists all uploaded files
- `GET /download/:filename` — downloads a file
- `DELETE /files/:filename` — deletes a file
