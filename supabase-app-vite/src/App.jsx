import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vwfokozrpmbzofgropit.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Zm9rb3pycG1iem9mZ3JvcGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTMyMzEsImV4cCI6MjA5NDI2OTIzMX0.x3qEtumkwsrcLQcb4bobZ2tjmvAhEOWpDNnEp9GgBXI";
const BUCKET_NAME = "files";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      setUploadFile(file);
    } else {
      showMessage("error", "Please select a valid .txt file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      setUploadFile(file);
    } else {
      showMessage("error", "Please drop a .txt file only.");
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    const fileName = `${Date.now()}_${uploadFile.name}`;

    try {
      const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, uploadFile, { contentType: "text/plain" });

      if (uploadError) throw uploadError;

      showMessage("success", `✅ "${uploadFile.name}" uploaded successfully!`);
      setUploadFile(null);
      document.getElementById("fileInput").value = "";
      await loadFiles(); // Auto refresh
    } catch (err) {
      showMessage("error", `Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list();
      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (err) {
      showMessage("error", `Failed to load files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleView = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(fileName);

      if (error) throw error;

      const text = await data.text();
      setFileContent(text);
      setViewingFile(fileName);
    } catch (err) {
      showMessage("error", `Failed to view file: ${err.message}`);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(fileName);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(/^\d+_/, "");
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showMessage("error", `Download failed: ${err.message}`);
    }
  };

  const handleDelete = async (fileName) => {
    if (!confirm(`Delete "${fileName.replace(/^\d+_/, "")}"?`)) return;

    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      if (error) throw error;

      showMessage("success", "🗑️ File deleted successfully");
      await loadFiles();
    } catch (err) {
      showMessage("error", `Delete failed: ${err.message}`);
    }
  };

  const closeViewer = () => {
    setViewingFile(null);
    setFileContent("");
  };

  return (
      <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans">
        {/* Header */}
        <header className="bg-gradient-to-br from-[#1a1f2e] to-[#16213e] border-b border-slate-700 py-10">
          <div className="max-w-3xl mx-auto text-center px-6">
            <div className="inline-block bg-blue-600 text-white text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-3">
              CS 3733
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">File Storage Demo</h1>
            <p className="text-slate-400">Software Engineering • Final Project</p>
            <p className="text-slate-500 text-sm mt-4">
              Instructor: Prof. Wilson Wong
            </p>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          {/* Message Toast */}
          {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium text-center ${
                  message.type === "success" ? "bg-green-900/50 text-green-400 border border-green-700"
                      : "bg-red-900/50 text-red-400 border border-red-700"
              }`}>
                {message.text}
              </div>
          )}

          {/* Upload Section */}
          <div className="bg-[#1e2433] border border-slate-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              ↑ Upload File
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Select or drag a <span className="font-mono text-blue-400">.txt</span> file to Supabase Storage
            </p>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    isDragging
                        ? "border-blue-500 bg-blue-950/30"
                        : "border-slate-600 hover:border-slate-500"
                }`}
            >
              <input
                  id="fileInput"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
              />
              <label
                  htmlFor="fileInput"
                  className="cursor-pointer block"
              >
                <div className="text-4xl mb-4">📄</div>
                <p className="text-slate-300 font-medium">
                  {uploadFile ? uploadFile.name : "Choose a .txt file or drag & drop"}
                </p>
              </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
            >
              {isUploading ? "Uploading to Supabase..." : "Upload to Supabase"}
            </button>
          </div>

          {/* Files Section */}
          <div className="bg-[#1e2433] border border-slate-700 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                ☁ Files in Storage
              </h2>
              <button
                  onClick={loadFiles}
                  disabled={isLoading}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-medium rounded-lg border border-slate-600 transition"
              >
                {isLoading ? "Loading..." : "Refresh Files"}
              </button>
            </div>

            {uploadedFiles.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  No files yet. Upload one above!
                </div>
            ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                      <div
                          key={file.name}
                          className="bg-[#0f1117] border border-slate-700 rounded-xl p-4 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">📄</span>
                          <div className="truncate">
                            <p className="font-medium text-slate-200 truncate">
                              {file.name.replace(/^\d+_/, "")}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(file.created_at).toLocaleDateString()} • {(file.metadata?.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition">
                          <button
                              onClick={() => handleView(file.name)}
                              className="px-4 py-1.5 text-sm bg-blue-950 hover:bg-blue-900 text-blue-400 rounded-lg border border-blue-900"
                          >
                            View
                          </button>
                          <button
                              onClick={() => handleDownload(file.name)}
                              className="px-4 py-1.5 text-sm bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-lg border border-emerald-900"
                          >
                            Download
                          </button>
                          <button
                              onClick={() => handleDelete(file.name)}
                              className="px-4 py-1.5 text-sm bg-red-950 hover:bg-red-900 text-red-400 rounded-lg border border-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* File Viewer Modal */}
          {viewingFile && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#1e2433] border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h3 className="font-semibold text-lg">
                      {viewingFile.replace(/^\d+_/, "")}
                    </h3>
                    <button
                        onClick={closeViewer}
                        className="text-slate-400 hover:text-white text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  <pre className="p-6 overflow-auto flex-1 text-sm text-slate-300 whitespace-pre-wrap bg-[#0f1117] font-mono">
                {fileContent}
              </pre>
                  <div className="p-6 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={closeViewer}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
          )}
        </main>

        <footer className="text-center py-8 text-slate-500 text-sm border-t border-slate-800">
          CS 3733 • Software Engineering • Final Project Component Demonstration
        </footer>
      </div>
  );
}