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

## Setup Instructions

### 1. Create a Supabase Storage Bucket
1. Go to your Supabase dashboard
2. Click **Storage** in the left sidebar
3. Click **New bucket**
4. Name it `files` (must match BUCKET_NAME in App.jsx)
5. Set it to **Public** so files can be accessed

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App
```bash
npm start
```
The app will open at `http://localhost:3000`

### 4. Test on a Different Computer
Option A - Run locally:
- Copy the project folder to the other computer
- Run `npm install` then `npm start`

Option B - Deploy for free (recommended):
- Push to GitHub
- Go to [vercel.com](https://vercel.com) and import the repo
- Deploy with one click — no setup needed
- Share the URL with the professor

## Troubleshooting
- **Upload fails:** Make sure the `files` bucket exists in Supabase and is set to Public
- **Files don't load:** Check your Supabase URL and anon key in App.jsx
- **CORS error:** Go to Supabase → Storage → Policies and make sure public access is enabled
