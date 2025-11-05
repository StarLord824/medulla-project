import { EditorState } from '@/types/editorInterface';
import { create } from 'zustand';

export const useEditorStore = create<EditorState>((set) => ({
  currentTool: 'select',
  rotation: 0,
  scale: 1,
  stagePosition: { x: 0, y: 0 },
  lines: [],
  textElements: [],
  cropRect: null,
  cursorPos: { x: 0, y: 0 },
  imageSize: { width: 0, height: 0 },
  imageSrc: '',
  undoStack: [],
  redoStack: [],

  setCurrentTool: (tool) => set({ currentTool: tool }),
  setRotation: (rotation) => set({ rotation }),
  setScale: (scale) => set({ scale }),
  setStagePosition: (pos) => set({ stagePosition: pos }),
  setCursorPos: (pos) => set({ cursorPos: pos }),
  setImageSize: (size) => set({ imageSize: size }),
  setImageSrc: (src) => set({ imageSrc: src }),
  
  addLine: (line) => set((state) => ({ 
    lines: [...state.lines, line],
    redoStack: []
  })),
  
  updateLastLine: (points) => set((state) => {
    const lines = [...state.lines];
    if (lines.length > 0) {
      lines[lines.length - 1] = { ...lines[lines.length - 1], points };
    }
    return { lines };
  }),
  
  addTextElement: (element) => set((state) => ({ 
    textElements: [...state.textElements, element],
    redoStack: []
  })),
  
  updateTextElement: (id, updates) => set((state) => ({
    textElements: state.textElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ),
    redoStack: []
  })),
  
  setCropRect: (rect) => set({ cropRect: rect }),
  
  saveState: () => set((state) => ({
    undoStack: [...state.undoStack, {
      lines: state.lines,
      textElements: state.textElements,
      rotation: state.rotation,
      scale: state.scale,
      imageSrc: state.imageSrc,
      imageSize: state.imageSize,
    }],
    redoStack: []
  })),
  
  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const previous = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    
    return {
      lines: previous.lines,
      textElements: previous.textElements,
      rotation: previous.rotation,
      scale: previous.scale,
      imageSrc: previous.imageSrc,
      imageSize: previous.imageSize,
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, {
        lines: state.lines,
        textElements: state.textElements,
        rotation: state.rotation,
        scale: state.scale,
        imageSrc: state.imageSrc,
        imageSize: state.imageSize,
      }]
    };
  }),
  
  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const next = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);
    
    return {
      lines: next.lines,
      textElements: next.textElements,
      rotation: next.rotation,
      scale: next.scale,
      imageSrc: next.imageSrc,
      imageSize: next.imageSize,
      redoStack: newRedoStack,
      undoStack: [...state.undoStack, {
        lines: state.lines,
        textElements: state.textElements,
        rotation: state.rotation,
        scale: state.scale,
        imageSrc: state.imageSrc,
        imageSize: state.imageSize,
      }]
    };
  }),
  
  reset: () => set({
    lines: [],
    textElements: [],
    rotation: 0,
    scale: 1,
    cropRect: null,
    undoStack: [],
    redoStack: [],
  }),
}));