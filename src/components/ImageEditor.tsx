'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Text as KonvaText, Rect } from 'react-konva';
import { 
  Upload, RotateCw, Crop, Pen, Type, Undo2, Redo2, 
  RotateCcw, Download, ArrowLeft, GripVertical 
} from 'lucide-react';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { EditorState } from '@/types/editorInterface';
import { useEditorStore } from '@/store/useEditorStore';

type DraggableConsoleProps = {
  cursorPos: { x: number; y: number };
  imageSize: { width: number; height: number };
  rotation: number;
  scale: number;
};

function DraggableConsole({ cursorPos, imageSize, rotation, scale }: DraggableConsoleProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: window.innerWidth - 280,
        y: 96
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={consoleRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl w-56">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/90 font-semibold text-sm">Editor Info</h3>
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors">
            <GripVertical size={16} className="text-white/50" />
          </div>
        </div>
        <div className="space-y-2 text-xs text-white/70">
          <div className="flex justify-between">
            <span>Cursor X:</span>
            <span className="text-white/90 font-mono">{Math.round(cursorPos.x)}px</span>
          </div>
          <div className="flex justify-between">
            <span>Cursor Y:</span>
            <span className="text-white/90 font-mono">{Math.round(cursorPos.y)}px</span>
          </div>
          <div className="h-px bg-white/20 my-2" />
          <div className="flex justify-between">
            <span>Width:</span>
            <span className="text-white/90 font-mono">{Math.round(imageSize.width)}px</span>
          </div>
          <div className="flex justify-between">
            <span>Height:</span>
            <span className="text-white/90 font-mono">{Math.round(imageSize.height)}px</span>
          </div>
          <div className="h-px bg-white/20 my-2" />
          <div className="flex justify-between">
            <span>Rotation:</span>
            <span className="text-white/90 font-mono">{rotation}°</span>
          </div>
          <div className="flex justify-between">
            <span>Zoom:</span>
            <span className="text-white/90 font-mono">{(scale * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageEditor({ imageUrl, onBack }: { imageUrl: string; onBack: () => void }) {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  
  const {
    currentTool,
    setCurrentTool,
    rotation,
    setRotation,
    scale,
    setScale,
    stagePosition,
    setStagePosition,
    lines,
    textElements,
    cropRect,
    setCursorPos,
    setImageSize,
    setImageSrc,
    addLine,
    updateLastLine,
    addTextElement,
    updateTextElement,
    setCropRect,
    saveState,
    undo,
    redo,
    reset,
    undoStack,
    redoStack,
    cursorPos,
    imageSize,
    imageSrc,
  } = useEditorStore();

  useEffect(() => {
    const updateDimensions = () => {
      setStageDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setImageSize({ width: img.width, height: img.height });
      setImageSrc(img.src);
    };
    img.src = imageUrl;
  }, [imageUrl, setImageSize, setImageSrc]);

  useEffect(() => {
    if (!imageSrc || imageSrc === imageUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
    };
    img.src = imageSrc;
  }, [imageSrc, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPanning(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning]);

  const finalizeCrop = () => {
    if (!cropRect || !stageRef.current || !image) return;
    
    saveState();
    
    const stage = stageRef.current;
    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    const stageCanvas = stage.toCanvas();
    
    offscreenCanvas.width = Math.abs(cropRect.width);
    offscreenCanvas.height = Math.abs(cropRect.height);
    
    const sourceX = cropRect.width < 0 ? cropRect.x + cropRect.width : cropRect.x;
    const sourceY = cropRect.height < 0 ? cropRect.y + cropRect.height : cropRect.y;
    
    ctx.drawImage(
      stageCanvas,
      sourceX, sourceY,
      Math.abs(cropRect.width), Math.abs(cropRect.height),
      0, 0,
      Math.abs(cropRect.width), Math.abs(cropRect.height)
    );
    
    const croppedDataURL = offscreenCanvas.toDataURL('image/png');
    const newImg = new window.Image();
    newImg.onload = () => {
      setImage(newImg);
      setImageSize({ width: newImg.width, height: newImg.height });
      setImageSrc(croppedDataURL);
      setCropRect(null);
      reset();
    };
    newImg.src = croppedDataURL;
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning || e.evt.button === 2) {
      setIsPanning(true);
      return;
    }

    if (currentTool === 'draw') {
      saveState();
      setIsDrawing(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      addLine({
        tool: 'pen',
        points: [pos.x, pos.y],
        stroke: '#60a5fa',
        strokeWidth: 3,
      });
    } else if (currentTool === 'text') {
      const target = e.target;
      if (target.getClassName() === 'Text') return;
      
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      saveState();
      addTextElement({
        id: `text-${Date.now()}`,
        text: 'Double-click to edit',
        x: pos.x,
        y: pos.y,
        fontSize: 24,
        fill: '#ffffff',
      });
      setCurrentTool('select');
    } else if (currentTool === 'crop') {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      setCropStart({ x: pos.x, y: pos.y });
      setCropRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    setCursorPos({ x: pos.x, y: pos.y });

    if (isPanning) {
      const stage = stageRef.current;
      if (!stage) return;
      
      const newPos = {
        x: stagePosition.x + e.evt.movementX,
        y: stagePosition.y + e.evt.movementY
      };
      setStagePosition(newPos);
      stage.position(newPos);
      stage.batchDraw();
      return;
    }

    if (isDrawing && currentTool === 'draw') {
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        const newPoints = lastLine.points.concat([pos.x, pos.y]);
        updateLastLine(newPoints);
      }
    } else if (currentTool === 'crop' && cropStart) {
      setCropRect({
        x: cropStart.x,
        y: cropStart.y,
        width: pos.x - cropStart.x,
        height: pos.y - cropStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
    
    if (isPanning) {
      setIsPanning(false);
    }
    
    if (currentTool === 'crop' && cropRect && (Math.abs(cropRect.width) > 10 || Math.abs(cropRect.height) > 10)) {
      finalizeCrop();
      setCropStart(null);
    }
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const scaleBy = 1.05;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setScale(Math.max(0.1, Math.min(5, newScale)));
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setStagePosition(newPos);
    stage.position(newPos);
    stage.batchDraw();
  };

  const handleDownload = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png' });
    const link = document.createElement('a');
    link.download = 'imagelab-edited.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRotate = () => {
    saveState();
    setRotation((rotation + 90) % 360);
  };

  const getCursor = () => {
    if (isPanning) return 'grab';
    switch (currentTool) {
      case 'draw': return 'crosshair';
      case 'text': return 'text';
      case 'crop': return 'crosshair';
      default: return 'default';
    }
  };

  const tools = [
    { id: 'select', icon: Upload, label: 'Select', disabled: true },
    { id: 'rotate', icon: RotateCw, label: 'Rotate' },
    { id: 'crop', icon: Crop, label: 'Crop' },
    { id: 'draw', icon: Pen, label: 'Draw' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="fixed inset-0 z-100 bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-8 py-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-white" size={20} />
              </button>
              <div className="w-10 h-10 bg-linear-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Crop className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">ImageLab Editor</h1>
                <p className="text-white/60 text-xs">Edit your masterpiece • Hold Space to pan • Scroll to zoom</p>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="bg-linear-to-r from-indigo-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>
      </header>

      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl">
          <div className="flex flex-col gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentTool === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.disabled) return;
                    if (tool.id === 'rotate') {
                      handleRotate();
                    } else {
                      setCurrentTool(tool.id as EditorState['currentTool']);
                    }
                  }}
                  disabled={tool.disabled}
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500/30 text-blue-300 border-2 border-blue-400/50' 
                      : tool.disabled
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }
                  `}
                  title={tool.label}
                >
                  <Icon size={20} />
                </button>
              );
            })}
            
            <div className="h-px bg-white/20 my-1" />
            
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-200
                ${undoStack.length > 0
                  ? 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
                }
              `}
              title="Undo"
            >
              <Undo2 size={20} />
            </button>
            
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-200
                ${redoStack.length > 0
                  ? 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
                }
              `}
              title="Redo"
            >
              <Redo2 size={20} />
            </button>
            
            <button
              onClick={reset}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30 transition-all duration-200"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      <DraggableConsole 
        cursorPos={cursorPos}
        imageSize={imageSize}
        rotation={rotation}
        scale={scale}
      />

      <div className="w-full h-screen flex items-center justify-center">
        <Stage
          ref={stageRef}
          width={stageDimensions.width}
          height={stageDimensions.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: getCursor() }}
          draggable={false}
          x={stagePosition.x}
          y={stagePosition.y}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                x={stageDimensions.width / 2}
                y={stageDimensions.height / 2}
                offsetX={image.width / 2}
                offsetY={image.height / 2}
                rotation={rotation}
                scaleX={scale}
                scaleY={scale}
              />
            )}
          </Layer>
          
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
          
          {cropRect && (
            <Layer>
              <Rect
                x={cropRect.x}
                y={cropRect.y}
                width={cropRect.width}
                height={cropRect.height}
                stroke="#60a5fa"
                strokeWidth={2}
                dash={[10, 5]}
                listening={false}
              />
            </Layer>
          )}
          
          <Layer>
            {textElements.map((textEl) => (
              <KonvaText
                key={textEl.id}
                text={textEl.text}
                x={textEl.x}
                y={textEl.y}
                fontSize={textEl.fontSize}
                fill={textEl.fill}
                draggable
                onDragStart={() => {
                  saveState();
                }}
                onDragEnd={(e) => {
                  updateTextElement(textEl.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onDblClick={() => {
                  const newText = prompt('Edit text:', textEl.text);
                  if (newText !== null && newText !== textEl.text) {
                    saveState();
                    updateTextElement(textEl.id, { text: newText });
                  }
                }}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}