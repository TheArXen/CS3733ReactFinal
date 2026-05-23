const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const BUCKET_NAME = process.env.BUCKET_NAME || "files";

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

// Multer - store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// GET / - Health check
app.get("/", (req, res) => {
    res.json({ message: "CS 3733 File Storage API is running" });
});

// GET /files - List all files
app.get("/files", async (req, res) => {
    try {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /upload - Upload a file
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file provided" });

        const fileName = `${Date.now()}_${req.file.originalname}`;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
            });

        if (error) throw error;
        res.json({ message: "File uploaded successfully", fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /download/:filename - Download a file
app.get("/download/:filename", async (req, res) => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(req.params.filename);

        if (error) throw error;

        const buffer = Buffer.from(await data.arrayBuffer());
        res.setHeader("Content-Type", "text/plain");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${req.params.filename.replace(/^\d+_/, "")}"`
        );
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /files/:filename - Delete a file
app.delete("/files/:filename", async (req, res) => {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([req.params.filename]);

        if (error) throw error;
        res.json({ message: "File deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});