"use client";
import React, { useState, useEffect } from "react";
import heic2any from "heic2any";
import Image from "next/image";

interface Note {
  id: string;
  text: string;
  likes: number;
  imageUrl?: string;
  createdAt?: string;
}

export default function LoveWall() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortMode, setSortMode] = useState<'recent' | 'popular'>('recent');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortMode]);

  async function fetchNotes(mode = sortMode) {
    const res = await fetch(`/api/notes?sort=${mode}`);
    const data = await res.json();
    setNotes(data);
  }

  async function addNote() {
    if (input.trim() === "") return;
    setLoading(true);
    let finalImageUrl = imageUrl.trim();
    // If a file is selected, upload to Imgur now
    if (selectedFile) {
      setUploadingImg(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      const res = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID || process.env.IMGUR_CLIENT_ID}`,
        },
        body: formData,
      });
      const data = await res.json();
      setUploadingImg(false);
      if (data.success && data.data.link) {
        finalImageUrl = data.data.link;
      } else {
        alert('Image upload failed.');
        setLoading(false);
        return;
      }
    }
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, imageUrl: finalImageUrl }),
    });
    if (res.ok) {
      setInput("");
      setImageUrl("");
      setSelectedFile(null);
      fetchNotes();
    }
    setLoading(false);
  }

  async function likeNote(id: string) {
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotes();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/heic',
      'image/gif',
      'video/mp4',
    ];
    // Check MIME type or file extension for HEIC
    const isHeic = file.name.toLowerCase().endsWith('.heic');
    if (!allowedTypes.includes(file.type) && !(isHeic && (!file.type || file.type === 'application/octet-stream'))) {
      alert('Only PNG, JPG, JPEG, HEIC, GIF, or MP4 files are allowed.');
      return;
    }
    if (isHeic) {
      try {
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });
        // heic2any returns a Blob or an array of Blobs
        const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
        const jpegFile = new File([jpegBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        setSelectedFile(jpegFile);
        setImageUrl(URL.createObjectURL(jpegFile));
      } catch {
        alert('Failed to convert HEIC image. Please use JPG/PNG.');
        return;
      }
    } else {
      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-pink-600 mb-4 text-center">Virtual Love Wall</h2>
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-1 rounded-full border transition text-sm font-semibold ${sortMode === 'recent' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-100'}`}
          onClick={() => setSortMode('recent')}
        >
          Recent
        </button>
        <button
          className={`px-4 py-1 rounded-full border transition text-sm font-semibold ${sortMode === 'popular' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-100'}`}
          onClick={() => setSortMode('popular')}
        >
          Popular
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center">
        <input
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
          type="text"
          placeholder="Write your love note..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="imgur-upload"
          onChange={handleFileChange}
          disabled={loading}
        />
        <label htmlFor="imgur-upload" className="p-2 bg-white border rounded hover:bg-pink-100 transition flex items-center justify-center cursor-pointer" title="Upload image" style={{ opacity: loading ? 0.5 : 1 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pink-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z" />
            <circle cx="8.25" cy="8.25" r="1.25" fill="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.5l-5.25-5.25a1.5 1.5 0 00-2.12 0l-5.13 5.13" />
          </svg>
        </label>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
          onClick={addNote}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
      {imageUrl && selectedFile && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative">
            <Image
              src={imageUrl}
              alt="preview"
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-full border border-pink-200 cursor-pointer hover:scale-105 transition"
              onClick={() => {
                setModalImg(imageUrl);
                setShowModal(true);
              }}
            />
            {uploadingImg && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                <svg className="animate-spin h-6 w-6 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </span>
            )}
          </div>
          <span className="text-xs text-pink-500">Preview (click to view)</span>
        </div>
      )}
      <ul className="space-y-4">
        {notes.map(note => (
          <li key={note.id} className="relative bg-white p-4 rounded shadow flex flex-col gap-2 animate-heart-pop">
            <div className="flex items-center gap-3">
              <div className="flex flex-col flex-1">
                <span className="text-lg break-words">{note.text}</span>
                <span className="text-xs text-gray-400 mt-1">
                  {note.createdAt ?
                    new Date(note.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
                      day: '2-digit', month: 'short', year: 'numeric'
                    }) : ''}
                </span>
              </div>
              <button
                className="ml-auto flex items-center gap-1 text-pink-500 hover:text-pink-700 transition"
                onClick={() => likeNote(note.id)}
                aria-label="Like"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24" className={note.likes ? "animate-heart" : ""}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{note.likes}</span>
              </button>
            </div>
            {note.imageUrl && (
              <div className="mt-2 flex justify-center">
                <Image
                  src={note.imageUrl}
                  alt="user upload"
                  width={400}
                  height={400}
                  className="max-h-64 rounded-lg border border-pink-200 object-contain cursor-pointer hover:scale-105 transition"
                  onClick={() => {
                    setModalImg(note.imageUrl!);
                    setShowModal(true);
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      {showModal && modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-4 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <Image src={modalImg} alt="full" width={800} height={800} className="max-w-[90vw] max-h-[80vh] rounded" />
            <button className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-heart-pop {
          animation: pop 0.3s;
        }
        @keyframes pop {
          0% { transform: scale(0.9); }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-heart {
          animation: heartBeat 0.5s;
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
