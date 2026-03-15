import React, { useState, useEffect, useRef } from 'react';
import { Folder, Globe, Trash2, Gamepad2, Music, FileText, Terminal } from 'lucide-react';

// --- Vaporwave Game Component ---
function VaporwaveGame() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col items-center font-pixel w-[500px]">
      <div className="w-full flex justify-between mb-2 text-black text-xl">
        <span>OUTRUN_VAPOR.EXE</span>
        <span>1986</span>
      </div>
      <div className="win95-inset relative bg-black w-full h-[350px] overflow-hidden">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h2 className="text-[#ff00ff] text-3xl mb-4 drop-shadow-[0_0_5px_#ff00ff]">VIRTUAL PLAZA</h2>
            <button onClick={() => setIsPlaying(true)} className="win95-button text-xl px-4 py-2">
              ENTER SIMULATION
            </button>
          </div>
        ) : (
          <iframe 
            src="https://archive.org/embed/arcade_outrun?autoplay=1" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen
            className="w-full h-full"
            style={{ filter: 'hue-rotate(30deg) saturate(1.5) contrast(1.1)' }}
          ></iframe>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-700 text-center leading-tight">
        Powered by Archive.org<br/>
        Click inside to focus. Press '5' to insert coin, '1' to start.<br/>
        Arrows to drive, Z/X for pedals.
      </p>
    </div>
  );
}

// --- Window System Components ---

type WindowState = { isOpen: boolean; z: number; x: number; y: number };

function DraggableWindow({ 
  id, 
  title, 
  children, 
  windowState, 
  focusWindow, 
  closeWindow 
}: { 
  id: string, 
  title: string, 
  children: React.ReactNode, 
  windowState: WindowState,
  focusWindow: (id: string) => void,
  closeWindow: (id: string) => void
}) {
  const [pos, setPos] = useState({ x: windowState.x, y: windowState.y });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
    focusWindow(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPos({
        x: Math.max(0, dragRef.current.initialX + (e.clientX - dragRef.current.startX)),
        y: Math.max(0, dragRef.current.initialY + (e.clientY - dragRef.current.startY))
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!windowState.isOpen) return null;

  return (
    <div 
      className="absolute win95-window shadow-[5px_5px_0px_rgba(0,0,0,0.5)] flex flex-col" 
      style={{ left: pos.x, top: pos.y, zIndex: windowState.z }} 
      onMouseDown={() => focusWindow(id)}
    >
      <div className="win95-titlebar cursor-move select-none" onMouseDown={handleMouseDown}>
        <span className="truncate pr-4">{title}</span>
        <div className="flex gap-1">
          <button className="win95-button px-2" onClick={(e) => { e.stopPropagation(); closeWindow(id); }}>X</button>
        </div>
      </div>
      <div className="p-1 bg-[#c0c0c0] flex-1">
        {children}
      </div>
    </div>
  );
}

function DesktopIcon({ icon, label, onDoubleClick }: { icon: React.ReactNode, label: string, onDoubleClick: () => void }) {
  const [selected, setSelected] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = () => setSelected(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div 
      className={`flex flex-col items-center cursor-pointer w-20 p-1 ${selected ? 'bg-blue-800/50' : ''}`}
      onClick={(e) => { e.stopPropagation(); setSelected(true); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
    >
      <div className="mb-1 drop-shadow-md">
        {icon}
      </div>
      <span className={`text-center text-sm px-1 ${selected ? 'bg-blue-800 text-white border border-dotted border-white' : 'text-white bg-blue-800/80'}`}>
        {label}
      </span>
    </div>
  );
}

// --- Main App Components ---

function Desktop() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [time, setTime] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);

  // Window Management State
  const [topZ, setTopZ] = useState(30);
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    arcade: { isOpen: true, z: 20, x: 250, y: 50 },
    winamp: { isOpen: true, z: 21, x: 50, y: 400 },
    projetos: { isOpen: false, z: 0, x: 100, y: 100 },
    internet: { isOpen: false, z: 0, x: 150, y: 150 },
    lixeira: { isOpen: false, z: 0, x: 200, y: 200 },
  });

  const MUSIC_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  const openWindow = (id: string) => {
    setTopZ(z => z + 1);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, z: topZ + 1 }
    }));
  };

  const closeWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const focusWindow = (id: string) => {
    setTopZ(z => z + 1);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], z: topZ + 1 }
    }));
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative crt bg-[#000020] font-pixel select-none" onClick={() => setStartOpen(false)}>
      {/* Vaporwave Background */}
      <div className="vapor-sun"></div>
      <div className="vapor-grid"></div>

      {/* Audio Element */}
      <audio ref={audioRef} loop src={MUSIC_URL} />

      {/* Top Marquee */}
      <div className="absolute top-8 left-0 w-full overflow-hidden whitespace-nowrap text-[#ff00ff] text-2xl bg-black/60 py-2 border-y border-[#ff00ff]/50 z-10 pointer-events-none">
        <div className="animate-marquee">
          WELCOME TO Pabl.ING /// 1999 VIRTUAL PLAZA /// UNDER CONSTRUCTION /// ENJOY YOUR STAY /// AESTHETIC ///
        </div>
      </div>

      {/* Floating Logo */}
      <div className="absolute top-24 left-8 z-10 pointer-events-none">
        <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-magenta-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] italic tracking-widest">
          Pabl.ING
        </h1>
        <p className="text-cyan-300 mt-2 text-xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          &gt; SYSTEM ONLINE_
        </p>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-40 right-12 flex flex-col gap-6 items-center z-10">
        <DesktopIcon 
          icon={<Folder size={36} fill="#e8c14a" color="#000" strokeWidth={1.5} />} 
          label="Projetos" 
          onDoubleClick={() => openWindow('projetos')} 
        />
        <DesktopIcon 
          icon={<Globe size={36} fill="#008080" color="#000" strokeWidth={1.5} />} 
          label="Internet" 
          onDoubleClick={() => openWindow('internet')} 
        />
        <DesktopIcon 
          icon={<Trash2 size={36} fill="#fff" color="#000" strokeWidth={1.5} />} 
          label="Lixeira" 
          onDoubleClick={() => openWindow('lixeira')} 
        />
        <DesktopIcon 
          icon={<Gamepad2 size={36} fill="#c0c0c0" color="#000" strokeWidth={1.5} />} 
          label="Arcade" 
          onDoubleClick={() => openWindow('arcade')} 
        />
        <DesktopIcon 
          icon={<Music size={36} fill="#ff00ff" color="#000" strokeWidth={1.5} />} 
          label="WinAmp" 
          onDoubleClick={() => openWindow('winamp')} 
        />
      </div>

      {/* --- WINDOWS --- */}

      {/* Music Player Window */}
      <DraggableWindow id="winamp" title="WinAmp_lite.exe" windowState={windows.winamp} focusWindow={focusWindow} closeWindow={closeWindow}>
        <div className="p-2 flex flex-col gap-2 w-[250px]">
          <div className="win95-inset bg-black text-[#00ff00] p-1 text-sm overflow-hidden whitespace-nowrap">
            <marquee scrollamount="3">Playing: Vaporwave_Mix_1999.mp3</marquee>
          </div>
          <div className="flex justify-between items-center mt-1">
            <button onClick={toggleMusic} className="win95-button px-4 py-1">
              {isPlayingMusic ? 'PAUSE' : 'PLAY'}
            </button>
            <span className="text-xs text-black">VOL: 40%</span>
          </div>
        </div>
      </DraggableWindow>

      {/* Game Window */}
      <DraggableWindow id="arcade" title="Vapor_World.exe" windowState={windows.arcade} focusWindow={focusWindow} closeWindow={closeWindow}>
        <div className="p-2">
          <VaporwaveGame />
        </div>
      </DraggableWindow>

      {/* Internet Window */}
      <DraggableWindow id="internet" title="Netscape Navigator" windowState={windows.internet} focusWindow={focusWindow} closeWindow={closeWindow}>
        <div className="w-[400px] h-[300px] flex flex-col bg-[#c0c0c0] p-1">
          <div className="flex gap-2 mb-2 items-center">
             <span className="text-sm text-black">Address:</span>
             <input type="text" value="http://www.pabl.ing/home" readOnly className="win95-inset flex-1 px-1 text-sm bg-white text-black outline-none" />
          </div>
          <div className="win95-inset bg-white flex-1 p-4 overflow-y-auto text-black font-sans relative">
             <h1 className="text-2xl font-bold text-blue-800 underline mb-4">Welcome to the World Wide Web!</h1>
             <p>This is the personal homepage of Pabl.ING.</p>
             <marquee className="text-red-600 my-4 font-bold">Best viewed in Netscape Navigator 4.0</marquee>
             <div className="mt-8 border-4 border-dashed border-gray-400 p-4 text-center text-gray-500">
               [ UNDER CONSTRUCTION ]
             </div>
          </div>
        </div>
      </DraggableWindow>

      {/* Projects Window */}
      <DraggableWindow id="projetos" title="C:\Projetos" windowState={windows.projetos} focusWindow={focusWindow} closeWindow={closeWindow}>
        <div className="w-[300px] h-[200px] win95-inset bg-white p-2 flex gap-4 flex-wrap content-start">
           <div className="flex flex-col items-center w-16 text-center cursor-pointer">
              <Folder size={32} fill="#e8c14a" color="#000" strokeWidth={1} />
              <span className="text-xs mt-1 text-black">Projeto_1.exe</span>
           </div>
           <div className="flex flex-col items-center w-16 text-center cursor-pointer">
              <Folder size={32} fill="#e8c14a" color="#000" strokeWidth={1} />
              <span className="text-xs mt-1 text-black">Top_Secret</span>
           </div>
           <div className="flex flex-col items-center w-16 text-center cursor-pointer">
              <FileText size={32} fill="#fff" color="#000" strokeWidth={1} />
              <span className="text-xs mt-1 text-black">leia_me.txt</span>
           </div>
        </div>
      </DraggableWindow>

      {/* Trash Window */}
      <DraggableWindow id="lixeira" title="Lixeira" windowState={windows.lixeira} focusWindow={focusWindow} closeWindow={closeWindow}>
        <div className="w-[250px] h-[200px] win95-inset bg-white p-2 flex gap-4 flex-wrap content-start">
           <div className="flex flex-col items-center w-16 text-center cursor-pointer opacity-50">
              <FileText size={32} fill="#fff" color="#000" strokeWidth={1} />
              <span className="text-xs mt-1 text-black">ideias_ruins.doc</span>
           </div>
        </div>
      </DraggableWindow>

      {/* --- TASKBAR --- */}
      <div className="absolute bottom-0 left-0 w-full h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-50">
        <button 
          className={`win95-button flex items-center gap-2 px-2 py-1 font-bold h-8 ${startOpen ? 'win95-button-active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setStartOpen(!startOpen); }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Windows_logo_-_1992.svg" className="w-4 h-4" alt="Start" />
          Start
        </button>
        <div className="w-px h-6 bg-gray-500 mx-2 border-r border-white"></div>
        
        {/* Taskbar items for open windows */}
        <div className="flex-1 flex gap-1 overflow-x-auto px-1">
          {Object.entries(windows).map(([id, win]) => win.isOpen && (
            <button 
              key={id} 
              className={`win95-button px-2 py-1 truncate w-32 text-left text-sm ${win.z === topZ ? 'win95-button-active' : ''}`} 
              onClick={() => focusWindow(id)}
            >
              {id}.exe
            </button>
          ))}
        </div>

        <div className="ml-auto win95-inset px-3 py-1 text-sm flex items-center bg-[#c0c0c0] text-black">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Start Menu */}
      {startOpen && (
        <div className="absolute bottom-10 left-0 w-48 bg-[#c0c0c0] win95-window shadow-lg z-50 flex flex-col p-1">
          <div className="bg-[#000080] text-white font-bold p-2 mb-1 transform -rotate-90 absolute -left-16 bottom-16 origin-bottom-right tracking-widest text-xl">
            Windows 95
          </div>
          <div className="ml-8 flex flex-col">
            <div className="flex items-center gap-3 p-2 hover:bg-[#000080] hover:text-white cursor-pointer text-black" onClick={() => { openWindow('projetos'); setStartOpen(false); }}>
              <Folder size={24} fill="#e8c14a" color="#000" strokeWidth={1.5} /> Projetos
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-[#000080] hover:text-white cursor-pointer text-black" onClick={() => { openWindow('internet'); setStartOpen(false); }}>
              <Globe size={24} fill="#008080" color="#000" strokeWidth={1.5} /> Internet
            </div>
            <div className="w-full h-px bg-gray-500 border-b border-white my-1"></div>
            <div className="flex items-center gap-3 p-2 hover:bg-[#000080] hover:text-white cursor-pointer text-black" onClick={() => window.location.reload()}>
              <Terminal size={24} fill="#000" color="#fff" strokeWidth={1.5} /> Shut Down...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <Desktop />;
}
