"use client";
import React from "react";
import { ModalContext } from "./context";

type DrawState = {
  isDrawing: boolean;
  offsetX: number | undefined;
  offsetY: number | undefined;
  width: number | undefined;
  height: number | undefined;
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.strokeStyle = "rgb(200 0 0)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, height < 0 ? y - radius : y + radius);
  ctx.arcTo(
    x,
    y + height,
    width < 0 ? x - radius : x + radius,
    y + height,
    radius,
  );
  ctx.arcTo(
    x + width,
    y + height,
    x + width,
    height < 0 ? y + height + radius : y + height - radius,
    radius,
  );
  ctx.arcTo(
    x + width,
    y,
    width < 0 ? x + width + radius : x + width - radius,
    y,
    radius,
  );
  ctx.arcTo(x, y, x, height < 0 ? y - radius : y + radius, radius);
  ctx.stroke();
}

function checkBounds(
  targetX: number,
  targetY: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const x1 = width < 0 ? x + width : x;
  const x2 = width < 0 ? x : x + width;
  const inX = targetX >= x1 && targetX <= x2;
  const y1 = height < 0 ? y + height : y;
  const y2 = height < 0 ? y : y + height;
  const inY = targetY >= y1 && targetY <= y2;

  return inX && inY;
}

function mouseDownHandler(
  _ctx: CanvasRenderingContext2D,
  mainState: ModalContext,
  drawState: DrawState,
) {
  return (e: MouseEvent) => {
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;

    let found = false;
    mainState.shapes.forEach((s) => {
      const hit = checkBounds(offsetX, offsetY, s.x, s.y, s.w, s.h);
      if (hit) {
        found = true;
        const top = s.h < 0 ? s.y : s.y + s.h;
        const left = s.w < 0 ? s.x + s.w : s.x;
        const event = new CustomEvent("onannotationselect", {
          ...e,
          detail: { top, left, id: s.id },
        });
        document.dispatchEvent(event);
      }
    });

    if (!found) {
      drawState.isDrawing = true;
      drawState.offsetY = offsetY;
      drawState.offsetX = offsetX;

      const event = new CustomEvent("onannotationdeselect", {
        ...e,
      });
      document.dispatchEvent(event);
    }
  };
}

function mouseMoveHandler(
  ctx: CanvasRenderingContext2D,
  mainState: ModalContext,
  drawState: DrawState,
) {
  return (e: MouseEvent) => {
    const screenshotId = mainState.selectedScreenshot;

    if (!screenshotId) return;
    if (!drawState.isDrawing) return;
    if (drawState.offsetX && drawState.offsetY) {
      const offsetX = e.offsetX;
      const offsetY = e.offsetY;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      mainState.shapeIds[screenshotId]?.forEach((id) => {
        const shape = mainState.shapes.get(id);
        if (shape) {
          roundedRect(ctx, shape.x, shape.y, shape.w, shape.h, 5);
        } else {
          mainState.shapeIds[screenshotId]?.delete(id);
        }
      });

      const w = offsetX - drawState.offsetX;
      const h = offsetY - drawState.offsetY;
      if (Math.abs(w) > 9 && Math.abs(h) > 9) {
        roundedRect(ctx, drawState.offsetX, drawState.offsetY, w, h, 4);
      }
    }
  };
}

function mouseUpHandler(
  _ctx: CanvasRenderingContext2D,
  mainState: ModalContext,
  drawState: DrawState,
) {
  return (e: MouseEvent) => {
    const screenshotId = mainState.selectedScreenshot;

    if (!screenshotId) return;
    if (!drawState.isDrawing) return;
    if (drawState.offsetX && drawState.offsetY) {
      const offsetX = e.offsetX;
      const offsetY = e.offsetY;

      const id = crypto.randomUUID();
      const newAnnotation = {
        id,
        screenshotId,
        x: drawState.offsetX,
        y: drawState.offsetY,
        w: offsetX - drawState.offsetX,
        h: offsetY - drawState.offsetY,
        createdAt: Date.now(),
      };

      if (
        (newAnnotation.w > 9 || newAnnotation.w < -9) &&
        (newAnnotation.h > 9 || newAnnotation.h < -9)
      ) {
        mainState.shapeIds[screenshotId] ??= new Set();
        mainState.shapeIds[screenshotId]?.add(id);
        mainState.shapes.set(id, newAnnotation);

        const top =
          newAnnotation.h < 0
            ? newAnnotation.y
            : newAnnotation.y + newAnnotation.h;
        const left =
          newAnnotation.w < 0
            ? newAnnotation.x + newAnnotation.w
            : newAnnotation.x;
        const event = new CustomEvent("onannotationcreate", {
          ...e,
          detail: { top, left, id },
        });
        document.dispatchEvent(event);
      }
    }

    drawState.isDrawing = false;
    drawState.offsetY = undefined;
    drawState.offsetX = undefined;
    drawState.width = undefined;
    drawState.height = undefined;
  };
}

function redraw(ctx: CanvasRenderingContext2D, mainState: ModalContext) {
  return (_e: any) => {
    const screenshotId = mainState.selectedScreenshot;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!screenshotId) return;

    const lostIds: string[] = [];
    mainState.shapeIds[screenshotId]?.forEach((id) => {
      const shape = mainState.shapes.get(id);

      if (shape) {
        roundedRect(ctx, shape.x, shape.y, shape.w, shape.h, 5);
      } else {
        lostIds.push(id);
      }
    });

    for (const id of lostIds) {
      mainState.shapeIds[screenshotId]?.delete(id);
    }
  };
}

type CanvasProps = {
  imageDims?: {
    w: number;
    h: number;
  };
};

export default function AnnotationCanvas({ imageDims }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D>();

  const mainState = React.useContext(ModalContext);

  const drawState = React.useRef<DrawState>({
    isDrawing: false,
    offsetY: undefined,
    offsetX: undefined,
    width: undefined,
    height: undefined,
  }).current;

  React.useEffect(() => {
    if (imageDims) {
      if (canvasRef.current?.getContext) {
        const context2d = canvasRef.current.getContext("2d")!;
        context2d.canvas.width = context2d.canvas.clientWidth;
        context2d.canvas.height = context2d.canvas.clientHeight;
        ctxRef.current = context2d;

        canvasRef.current.addEventListener(
          "mousedown",
          mouseDownHandler(context2d, mainState, drawState),
        );

        canvasRef.current.addEventListener(
          "mousemove",
          mouseMoveHandler(context2d, mainState, drawState),
        );

        canvasRef.current.addEventListener(
          "mouseup",
          mouseUpHandler(context2d, mainState, drawState),
        );

        document.addEventListener(
          "onannotationdelete",
          redraw(context2d, mainState),
        );

        redraw(context2d, mainState)({} as any);
      }
    }
  }, [imageDims, canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      id="image-annotator"
      className="absolute z-10 top-0 left-0 w-full h-full"
    ></canvas>
  );
}
