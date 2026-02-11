import React, { useState } from 'react';
import { IconX, IconZoomIn, IconZoomOut } from './Icons';

interface ImageViewerProps { src: string; onClose: () => void; }

const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => { if (scale > 1) { setDragging(true); setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y }); } };
    const handleMouseMove = (e: React.MouseEvent) => { if (dragging && scale > 1) { setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y }); } };
    const handleMouseUp = () => setDragging(false);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 bg-black/50 backdrop-blur-sm z-10">
                <div className="text-white">Xem ảnh ({Math.round(scale * 100)}%)</div>
                <div className="flex gap-4">
                     <button onClick={() => setScale(s => Math.max(s - 0.5, 1))} className="text-white p-2"><IconZoomOut /></button>
                     <button onClick={() => setScale(s => Math.min(s + 0.5, 4))} className="text-white p-2"><IconZoomIn /></button>
                     <button onClick={onClose} className="text-white p-2 ml-4"><IconX /></button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center cursor-move" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <img src={src} className="max-w-full max-h-full object-contain transition-transform duration-200" style={{ transform: `scale(${scale}) translate(${position.x/scale}px, ${position.y/scale}px)` }} draggable={false}/>
            </div>
        </div>
    );
};
export default ImageViewer;