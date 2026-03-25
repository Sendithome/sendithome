import { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSig(true);
  };

  const endDraw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    setDrawing(false);
    if (onChange) onChange(canvasRef.current.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    if (onChange) onChange(null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        className="w-full border border-gray-400 rounded bg-white cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {!hasSig && (
        <p className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 pointer-events-none select-none">
          Sign here with your finger or mouse
        </p>
      )}
      {hasSig && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1 right-1 flex items-center gap-1 text-[9px] text-red-500 hover:text-red-700 bg-white border border-red-200 rounded px-1.5 py-0.5"
        >
          <Trash2 className="w-2.5 h-2.5" /> Clear
        </button>
      )}
    </div>
  );
}