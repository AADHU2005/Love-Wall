"use client";
import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

interface Note {
  id: string;
  text: string;
  likes: number;
  imageUrl?: string;
  senderIp?: string;
  createdAt?: string;
}

function LoveWallPreloader() {
  return (
    <div className="flex justify-center py-8">
      <svg width="48" height="48" viewBox="0 0 80 80" className="drop-shadow-lg animate-spin-slow">
        <path
          d="M40 70s-24-14.7-24-34.2C16 22.6 27.2 14 40 26.5 52.8 14 64 22.6 64 35.8 64 55.3 40 70 40 70z"
          fill="none"
          stroke="#f472b6"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeDasharray="180"
          strokeDashoffset="90"
          style={{
            animation: 'drawHeart 1.2s linear infinite',
            filter: 'drop-shadow(0 2px 8px #f472b6)'
          }}
        />
        <style>{`
          @keyframes drawHeart {
            0% { stroke-dashoffset: 180; }
            100% { stroke-dashoffset: 0; }
          }
          .animate-spin-slow {
            animation: spin 1.2s linear infinite;
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}


async function cacheImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Image fetch failed');
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          document.cookie = `loveWallImg_${btoa(url)}=${encodeURIComponent(reader.result)}; max-age=86400; path=/`;
          resolve(reader.result);
        } else {
          reject('Failed to read image');
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}


function getCachedImageBase64(url: string): string | null {
  const name = `loveWallImg_${btoa(url)}=`;
  const cookies = document.cookie.split('; ');
  for (const c of cookies) {
    if (c.startsWith(name)) {
      return decodeURIComponent(c.substring(name.length));
    }
  }
  return null;
}

export default function LoveWall() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [initialLoading, setInitialLoading] = useState(true);
  const [likedId, setLikedId] = useState<string | null>(null);

  useEffect(() => {
    setInitialLoading(true);
    fetchNotes().then(() => setInitialLoading(false));

    fetch("/api/notes/get_myip")
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp(null));
  }, [sortBy]);

  async function fetchNotes() {
    const res = await fetch(`/api/notes?sort=${sortBy}`);
    const data = await res.json();
    setNotes(data);
  }

  async function addNote() {
    if (input.trim() === "") return;
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, imageUrl: imageUrl.trim() }),
    });
    if (res.ok) {
      setInput("");
      setImageUrl("");
      fetchNotes();
    }
    setLoading(false);
  }

  function userLiked(note: any) {
    return userIp && note.likedBy && Array.isArray(note.likedBy) && note.likedBy.includes(userIp);
  }

  async function toggleLike(note: any) {
    setLikedId(note.id);
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id }),
    });
    fetchNotes();
    setTimeout(() => setLikedId(null), 500);
  }

  async function deleteNote(id: string) {
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotes();
  }

  function handleImageIconClick() {
    const url = window.prompt("Enter image URL (optional):", imageUrl);
    if (url !== null && url.trim()) {

      cacheImageAsBase64(url.trim()).then(base64 => {
        if (base64) {
          setImageUrl(url.trim());
        } else {
          alert('Could not load image. Please check the URL or try a different image.');
          setImageUrl("");
        }
      });
    } else if (url !== null) {
      setImageUrl("");
    }
  }


  async function handleShareAsImage(noteId: string) {
    const el = document.getElementById(`note-share-${noteId}`);
    if (!el) return;

    const note = notes.find(n => n.id === noteId);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.padding = '32px';
    wrapper.style.background = 'linear-gradient(135deg, #ffe4ec 0%, #fbc2eb 100%)';
    wrapper.style.borderRadius = '24px';
    wrapper.style.boxShadow = '0 4px 24px 0 rgba(245, 114, 182, 0.12)';
    wrapper.style.textAlign = 'center';
    wrapper.style.width = '384px';
    wrapper.style.maxWidth = '90vw';

    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.background = 'rgba(255,255,255,0.95)';
    clone.style.borderRadius = '16px';
    clone.style.boxShadow = '0 2px 8px 0 rgba(245, 114, 182, 0.10)';
    clone.style.padding = '24px';
    clone.style.margin = '0 auto';
    clone.style.width = '320px';
    clone.style.maxWidth = '320px';
    clone.style.minHeight = '120px';
    clone.style.display = 'block';

    Array.from(clone.querySelectorAll('button')).forEach(btn => btn.remove());
    Array.from(clone.querySelectorAll('img')).forEach(img => img.remove());

    wrapper.appendChild(clone);

    if (note && note.imageUrl && note.imageUrl.startsWith('data:')) {
      const img = document.createElement('img');
      img.src = note.imageUrl;
      img.alt = 'user upload';
      img.style.width = '90%';
      img.style.maxWidth = '280px';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';
      img.style.marginTop = '16px';
      img.style.borderRadius = '12px';
      img.style.boxShadow = '0 2px 8px 0 rgba(245, 114, 182, 0.10)';
      wrapper.appendChild(img);
    }

    const watermark = document.createElement('div');
    watermark.innerText = '♥ Love Wall';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '12px';
    watermark.style.right = '24px';
    watermark.style.fontSize = '1rem';
    watermark.style.color = '#f472b6';
    watermark.style.opacity = '0.7';
    watermark.style.fontWeight = 'bold';
    watermark.style.letterSpacing = '0.05em';
    watermark.style.pointerEvents = 'none';

    wrapper.appendChild(watermark);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, { backgroundColor: null, scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    document.body.removeChild(wrapper);

    if (navigator.canShare && navigator.canShare({ files: [new File([dataUrl], 'note.png', { type: 'image/png' })] })) {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'note.png', { type: 'image/png' });
      navigator.share({ files: [file], title: 'Love Wall Note', text: 'Check out this note from the Love Wall!' });
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'love-wall-note.png';
      link.click();
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-pink-50 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-pink-600 mb-4 text-center">Virtual Love Wall</h2>
      {/* Sort options */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${sortBy === 'recent' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-100'}`}
          onClick={() => setSortBy('recent')}
        >
          Recent
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${sortBy === 'popular' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-100'}`}
          onClick={() => setSortBy('popular')}
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
        <button
          type="button"
          className="p-2 bg-white border rounded hover:bg-pink-100 transition flex items-center justify-center"
          title={imageUrl ? "Change image URL" : "Add image URL"}
          onClick={handleImageIconClick}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pink-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z" />
            <circle cx="8.25" cy="8.25" r="1.25" fill="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.5l-5.25-5.25a1.5 1.5 0 00-2.12 0l-5.13 5.13" />
          </svg>
        </button>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
          onClick={addNote}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
      {/* In the preview, do not show the image if it's a URL (only show if it's a base64 string) */}
      {imageUrl && imageUrl.startsWith('data:') && (
        <div className="mb-4 flex items-center gap-2">
          <img
            src={imageUrl}
            alt="preview"
            className="w-12 h-12 object-cover rounded-full border border-pink-200 cursor-pointer hover:scale-105 transition"
            onClick={() => {
              setModalImg(imageUrl);
              setShowModal(true);
            }}
          />
          <span className="text-xs text-pink-500">Preview (click to view)</span>
        </div>
      )}
      {initialLoading ? (
        <LoveWallPreloader />
      ) : (
        <ul className="space-y-4">
          {notes.map(note => (
            <li key={note.id} id={`note-share-${note.id}`} className="relative bg-white p-4 rounded shadow flex items-center gap-3 animate-heart-pop">
              {note.imageUrl && (
                <img
                  src={note.imageUrl}
                  alt="user upload"
                  className="w-12 h-12 object-cover rounded-full border border-pink-200 cursor-pointer hover:scale-105 transition"
                  onClick={() => {
                    setModalImg(note.imageUrl!);
                    setShowModal(true);
                  }}
                />
              )}
              <div className="flex-1">
                <span className="text-lg break-words">{note.text}</span>
                {note.createdAt && (
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(note.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}
                  </div>
                )}
              </div>
              <button
                className={`ml-auto flex items-center gap-1 text-pink-500 hover:text-pink-700 transition ${likedId === note.id ? 'scale-110' : ''}`}
                onClick={() => toggleLike(note)}
                aria-label={userLiked(note) ? "Unlike" : "Like"}
                style={{ transition: 'transform 0.2s' }}
              >
                {userLiked(note) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24" className="animate-heart">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
                <span>{note.likes}</span>
              </button>
              {userIp && note.senderIp === userIp && (
                <button
                  className="ml-2 text-gray-400 hover:text-red-500 transition"
                  title="Delete note"
                  onClick={() => deleteNote(note.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                className="ml-2 text-pink-400 hover:text-pink-600 transition"
                title="Share as Image"
                onClick={() => handleShareAsImage(note.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5l4.5-4.5 4.5 4.5M12 6v12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {showModal && modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-4 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="full" className="max-w-[90vw] max-h-[80vh] rounded" />
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
