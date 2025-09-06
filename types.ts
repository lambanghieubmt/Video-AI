// For Banner Editor
export type ElementType = 'text' | 'image' | 'shape';
export type ShapeType = 'rect' | 'ellipse';
export type FontWeight = 'normal' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: FontWeight;
  textAlign: TextAlign;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  backgroundColor: string;
}

export type Element = TextElement | ImageElement | ShapeElement;

export interface CanvasProps {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface DesignState {
  canvas: CanvasProps;
  elements: Element[];
}

// Actions for design reducer
export type Action =
  | { type: 'SET_DESIGN'; payload: DesignState }
  | { type: 'ADD_ELEMENT'; payload: Element }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<Element> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'UPDATE_CANVAS'; payload: Partial<CanvasProps> };


// For Video Editor
export interface SlideText {
    content: string;
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
    y: number; // Vertical position percentage (0-100)
}

export interface Slide {
    id: string;
    duration: number; // in seconds
    backgroundColor: string;
    backgroundImage: string | null;
    text: SlideText;
}

export type VideoAction =
  | { type: 'SET_SLIDES'; payload: Slide[] }
  | { type: 'ADD_SLIDE'; payload?: Partial<Omit<Slide, 'id'>> }
  | { type: 'UPDATE_SLIDE'; payload: { id: string; updates: Partial<Slide> } }
  | { type: 'DELETE_SLIDE'; payload: string };
