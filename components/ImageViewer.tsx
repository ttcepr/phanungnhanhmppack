
import React, { useState } from 'react';
import { IconX, IconZoomIn, IconZoomOut } from './Icons';

interface ImageViewerProps {
    src: string;
    onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose }) => {
    const [scale, setScale] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setDragging(true);
            setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragging && scale > 1) {
            setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
        }
    };

    const handleMouseUp = () => setDragging(false);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
            {/* Toolbar */}
            <div className="h-14 flex items-center justify-between px-4 bg-black/50 backdrop-blur-sm z-10">
                <div className="text-white text-sm font-medium opacity-80">
                   Trình xem ảnh ({Math.round(scale * 100)}%)
                </div>
                <div className="flex gap-4">
                     <button onClick={handleZoomOut} className="text-white/70 hover:text-white p-2 bg-white/10 rounded-full">
                        <IconZoomOut className="w-5 h-5" />
                     </button>
                     <button onClick={handleZoomIn} className="text-white/70 hover:text-white p-2 bg-white/10 rounded-full">
                        <IconZoomIn className="w-5 h-5" />
                     </button>
                     <button onClick={onClose} className="text-white hover:text-red-400 p-2 bg-white/10 rounded-full ml-4">
                        <IconX className="w-5 h-5" />
                     </button>
                </div>
            </div>

            {/* Image Container */}
            <div 
                className="flex-1 overflow-hidden flex items-center justify-center cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img 
                    src={src} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                    style={{ 
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default'
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
};

export default ImageViewer;
