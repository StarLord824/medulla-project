
export interface Line {
  tool: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditorSnapshot {
  lines: Line[];
  textElements: TextElement[];
  rotation: number;
  scale: number;
  imageSrc: string;
  imageSize: { width: number; height: number };
}

export interface EditorState {
  currentTool: 'select' | 'rotate' | 'crop' | 'draw' | 'text' | 'pan';
  rotation: number;
  scale: number;
  stagePosition: { x: number; y: number };
  lines: Line[];
  textElements: TextElement[];
  cropRect: CropRect | null;
  cursorPos: { x: number; y: number };
  imageSize: { width: number; height: number };
  imageSrc: string;
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
  
  setCurrentTool: (tool: EditorState['currentTool']) => void;
  setRotation: (rotation: number) => void;
  setScale: (scale: number) => void;
  setStagePosition: (pos: { x: number; y: number }) => void;
  setCursorPos: (pos: { x: number; y: number }) => void;
  setImageSize: (size: { width: number; height: number }) => void;
  setImageSrc: (src: string) => void;
  addLine: (line: Line) => void;
  updateLastLine: (points: number[]) => void;
  addTextElement: (element: TextElement) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  setCropRect: (rect: CropRect | null) => void;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}