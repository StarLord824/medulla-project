
// ============================================================
// components/ImageEditor.tsx (Client Component)
// ============================================================
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Text as KonvaText, Rect } from 'react-konva';
import { motion } from 'motion/react';
import { 
  Upload, RotateCw, Crop, Pen, Type, Undo2, Redo2, 
  RotateCcw, Download, ArrowLeft 
} from 'lucide-react';
import Konva from 'konva';
import { create } from 'zustand';

interface DrawingLine {
  tool: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
}

interface EditorState {
  currentTool: 'select' | 'rotate' | 'crop' | 'draw' | 'text';
  rotation: number;
  scale: number;
  cursorPos: { x: number; y: number };
  imageSize: { width: number; height: number };
  lines: DrawingLine[];
  textElements: TextElement[];
  cropRect: { x: number; y: number; width: number; height: number } | null;
  undoStack: any[];
  redoStack: any[];
  
  setCurrentTool: (tool: EditorState['currentTool']) => void;
  setRotation: (rotation: number) => void;
  setScale: (scale: number) => void;
  setCursorPos: (pos: { x: number; y: number }) => void;
  setImageSize: (size: { width: number; height: number }) => void;
  addLine: (line: DrawingLine) => void;
  addTextElement: (text: TextElement) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  setCropRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

const useEditorStore = create<EditorState>((set, get) => ({
  currentTool: 'select',
  rotation: 0,
  scale: 1,
  cursorPos: { x: 0, y: 0 },
  imageSize: { width: 0, height: 0 },
  lines: [],
  textElements: [],
  cropRect: null,
  undoStack: [],
  redoStack: [],

  setCurrentTool: (tool) => set({ currentTool: tool }),
  setRotation: (rotation) => set({ rotation }),
  setScale: (scale) => set({ scale }),
  setCursorPos: (pos) => set({ cursorPos: pos }),
  setImageSize: (size) => set({ imageSize: size }),
  addLine: (line) => set((state) => ({ lines: [...state.lines, line] })),
  addTextElement: (text) => set((state) => ({ textElements: [...state.textElements, text] })),
  updateTextElement: (id, updates) => set((state) => ({
    textElements: state.textElements.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  setCropRect: (rect) => set({ cropRect: rect }),
  
  saveState: () => {
    const state = get();
    const snapshot = {
      rotation: state.rotation,
      scale: state.scale,
      lines: [...state.lines],
      textElements: [...state.textElements],
    };
    set((state) => ({
      undoStack: [...state.undoStack.slice(-9), snapshot],
      redoStack: [],
    }));
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    
    const prevState = state.undoStack[state.undoStack.length - 1];
    const currentSnapshot = {
      rotation: state.rotation,
      scale: state.scale,
      lines: [...state.lines],
      textElements: [...state.textElements],
    };
    
    set({
      ...prevState,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack.slice(-9), currentSnapshot],
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    
    const nextState = state.redoStack[state.redoStack.length - 1];
    const currentSnapshot = {
      rotation: state.rotation,
      scale: state.scale,
      lines: [...state.lines],
      textElements: [...state.textElements],
    };
    
    set({
      ...nextState,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack.slice(-9), currentSnapshot],
    });
  },

  reset: () => set({
    rotation: 0,
    scale: 1,
    lines: [],
    textElements: [],
    cropRect: null,
    undoStack: [],
    redoStack: [],
  }),
}));

interface ImageEditorProps {
  imageUrl: string;
  onBack: () => void;
}

export default function ImageEditor({ imageUrl, onBack }: ImageEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  
  const {
    currentTool,
    setCurrentTool,
    rotation,
    setRotation,
    scale,
    lines,
    textElements,
    cropRect,
    setCursorPos,
    setImageSize,
    addLine,
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
    };
    img.src = imageUrl;
  }, [imageUrl, setImageSize]);

  const handleMouseDown = (e: any) => {
    if (currentTool === 'draw') {
      saveState();
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      addLine({
        tool: 'pen',
        points: [pos.x, pos.y],
        stroke: '#60a5fa',
        strokeWidth: 3,
      });
    } else if (currentTool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      saveState();
      addTextElement({
        id: `text-${Date.now()}`,
        text: 'Double-click to edit',
        x: pos.x,
        y: pos.y,
        fontSize: 24,
        fill: '#ffffff',
      });
    } else if (currentTool === 'crop') {
      const pos = e.target.getStage().getPointerPosition();
      setCropRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    setCursorPos({ x: pos.x, y: pos.y });

    if (!isDrawing || currentTool !== 'draw') return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    if (lastLine) {
      const newLine = { ...lastLine, points: lastLine.points.concat([point.x, point.y]) };
      addLine(newLine);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleDownload = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png' });
    const link = document.createElement('a');
    link.download = 'edited-image.png';
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-8 py-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-white" size={20} />
              </motion.button>
              <div className="w-10 h-10 bg-linear-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Crop className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">ImageLab Editor</h1>
                <p className="text-white/60 text-xs">Edit your masterpiece</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="bg-linear-to-r from-indigo-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Download size={18} />
              Download
            </motion.button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl">
          <div className="flex flex-col gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentTool === tool.id;
              
              return (
                <motion.button
                  key={tool.id}
                  whileHover={{ scale: tool.disabled ? 1 : 1.05 }}
                  whileTap={{ scale: tool.disabled ? 1 : 0.95 }}
                  onClick={() => {
                    if (tool.disabled) return;
                    if (tool.id === 'rotate') {
                      handleRotate();
                    } else {
                      setCurrentTool(tool.id as any);
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
                </motion.button>
              );
            })}
            
            <div className="h-px bg-white/20 my-1" />
            
            <motion.button
              whileHover={{ scale: undoStack.length > 0 ? 1.05 : 1 }}
              whileTap={{ scale: undoStack.length > 0 ? 0.95 : 1 }}
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
            </motion.button>
            
            <motion.button
              whileHover={{ scale: redoStack.length > 0 ? 1.05 : 1 }}
              whileTap={{ scale: redoStack.length > 0 ? 0.95 : 1 }}
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
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30 transition-all duration-200"
              title="Reset"
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Info Console */}
      <div className="fixed right-6 top-24 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl w-56">
          <h3 className="text-white/90 font-semibold text-sm mb-3">Editor Info</h3>
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

      
      {/* Canvas */}
      <div className="w-full h-screen flex items-center justify-center">
        <Stage
          ref={stageRef}
          width={stageDimensions.width}
          height={stageDimensions.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          style={{ cursor: getCursor() }}
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
                onDragEnd={(e) => {
                  saveState();
                  updateTextElement(textEl.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onDblClick={(e) => {
                  const textNode = e.target;
                  const newText = prompt('Edit text:', textEl.text);
                  if (newText !== null) {
                    saveState();
                    updateTextElement(textEl.id, { text: newText });
                  }
                }}
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
              />
            </Layer>
          )}
        </Stage>
      </div>
    </div>
  );
}