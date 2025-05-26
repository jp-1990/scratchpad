import React from "react";

type ShapeId = string;
type ScreenshotId = number;
export type ShapeIds = Set<ShapeId>;
export type Shapes = Map<
  ShapeId,
  {
    id: ShapeId;
    screenshotId: ScreenshotId;
    x: number;
    y: number;
    w: number;
    h: number;
    createdAt: number;
  }
>;

export type NoteState = {
  id: ShapeId;
  title: string;
  details: string;
  timestamp: string;
  createdBy: string;
  comments: any[];
};

export type ImageState = {
  id: number;
  src: string;
  createdAt: string;
  createdBy: string;
};

export type ModalContext = {
  notes: Map<ShapeId, NoteState>;
  selectedScreenshot?: ScreenshotId;
  setSelectedScreenshot?: React.Dispatch<React.SetStateAction<number>>;
  shapes: Shapes;
  shapeIds: Record<ScreenshotId, ShapeIds | undefined>;
  images: ImageState[];
};

const initial: ModalContext = {
  notes: new Map(),
  shapes: new Map(),
  shapeIds: {},
  images: [],
};

export const ModalContext = React.createContext<ModalContext>(initial);
