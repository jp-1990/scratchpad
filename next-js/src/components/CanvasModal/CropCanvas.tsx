"use client";
import React from "react";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { ModalContext } from "./context";
import { createPortal } from "react-dom";

type DrawState = {
  isDrawing: boolean;
  offsetX: number | undefined;
  offsetY: number | undefined;
  width: number | undefined;
  height: number | undefined;
};

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
      }
    });

    if (!found) {
      drawState.isDrawing = true;
      drawState.offsetY = offsetY;
      drawState.offsetX = offsetX;
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

      const w = offsetX - drawState.offsetX;
      const h = offsetY - drawState.offsetY;

      ctx.fillStyle = "rgb(2 6 24 / 60%)";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.clearRect(drawState.offsetX, drawState.offsetY, w, h);
      // drag handles
      ctx.fillStyle = "rgb(255 255 255 / 60%)";
      ctx.fillRect(drawState.offsetX - 3, drawState.offsetY - 3, 6, 6);
      ctx.fillRect(
        drawState.offsetX + w / 2 - 3,
        drawState.offsetY + h - 3,
        6,
        6,
      );
      ctx.fillRect(drawState.offsetX + w / 2 - 3, drawState.offsetY - 3, 6, 6);
      ctx.fillRect(drawState.offsetX + w - 3, drawState.offsetY - 3, 6, 6);
      ctx.fillRect(drawState.offsetX - 3, drawState.offsetY - 3 + h, 6, 6);
      ctx.fillRect(drawState.offsetX - 3, drawState.offsetY - 3 + h / 2, 6, 6);
      ctx.fillRect(drawState.offsetX + w - 3, drawState.offsetY - 3 + h, 6, 6);
      ctx.fillRect(
        drawState.offsetX + w - 3,
        drawState.offsetY - 3 + h / 2,
        6,
        6,
      );
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

      const dims = {
        x: drawState.offsetX,
        y: drawState.offsetY,
        w: offsetX - drawState.offsetX,
        h: offsetY - drawState.offsetY,
      };
      if ((dims.w > 9 || dims.w < -9) && (dims.h > 9 || dims.h < -9)) {
        const top = dims.h < 0 ? dims.y : dims.y + dims.h;
        const left = dims.w < 0 ? dims.x : dims.x + dims.w;
        const event = new CustomEvent("oncrop", {
          ...e,
          detail: { id: screenshotId, top, left, dims },
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

type CanvasProps = {
  onCrop: (id: number) => void;
  image: string;
  imageDims?: {
    w: number;
    h: number;
  };
};

export default function CropCanvas({ onCrop, image, imageDims }: CanvasProps) {
  const [modal, setModal] = React.useState({
    open: false,
    id: undefined as string | undefined,
    left: undefined as number | undefined,
    top: undefined as number | undefined,
    dims: undefined as
      | { x: number; y: number; w: number; h: number }
      | undefined,
  });

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
    if (modal.open) {
      setModal({
        open: false,
        id: undefined as string | undefined,
        left: undefined as number | undefined,
        top: undefined as number | undefined,
        dims: undefined,
      });
    }

    let mousedown: any;
    let mousemove: any;
    let mouseup: any;

    if (imageDims) {
      if (canvasRef.current?.getContext) {
        const context2d = canvasRef.current.getContext("2d")!;
        context2d.canvas.width = context2d.canvas.clientWidth;
        context2d.canvas.height = context2d.canvas.clientHeight;
        ctxRef.current = context2d;

        mousedown = (e: any) => {
          setModal({
            open: false,
            id: undefined as string | undefined,
            left: undefined as number | undefined,
            top: undefined as number | undefined,
            dims: undefined,
          });
          context2d.fillStyle = "rgb(2 6 24 / 60%)";
          context2d.clearRect(
            0,
            0,
            context2d.canvas.width,
            context2d.canvas.height,
          );
          context2d.fillRect(
            0,
            0,
            context2d.canvas.width,
            context2d.canvas.height,
          );
          mouseDownHandler(context2d, mainState, drawState)(e);
        };
        mousemove = mouseMoveHandler(context2d, mainState, drawState);
        mouseup = mouseUpHandler(context2d, mainState, drawState);

        canvasRef.current.addEventListener("mousedown", mousedown);
        canvasRef.current.addEventListener("mousemove", mousemove);
        canvasRef.current.addEventListener("mouseup", mouseup);

        context2d.fillStyle = "rgb(2 6 24 / 60%)";
        context2d.clearRect(
          0,
          0,
          context2d.canvas.width,
          context2d.canvas.height,
        );
        context2d.fillRect(
          0,
          0,
          context2d.canvas.width,
          context2d.canvas.height,
        );
      }
    }

    function onCrop(e: any) {
      const id = e.detail.id;
      if (!id) return;

      if (e) {
        setModal({
          open: true,
          id,
          left: e.detail.left,
          top: e.detail.top,
          dims: e.detail.dims,
        });
      }
    }

    document.addEventListener("oncrop", onCrop);

    return () => {
      canvasRef.current?.removeEventListener("mousemove", mousemove);
      canvasRef.current?.removeEventListener("mousedown", mousedown);
      canvasRef.current?.removeEventListener("mouseup", mouseup);
      document.removeEventListener("oncrop", onCrop);
    };
  }, [imageDims, canvasRef.current]);

  function onClose() {
    setModal({
      open: false,
      id: undefined,
      left: undefined,
      top: undefined,
      dims: undefined,
    });

    if (ctxRef.current) {
      ctxRef.current.fillStyle = "rgb(2 6 24 / 60%)";
      ctxRef.current.clearRect(
        0,
        0,
        ctxRef.current.canvas.width,
        ctxRef.current.canvas.height,
      );
      ctxRef.current.fillRect(
        0,
        0,
        ctxRef.current.canvas.width,
        ctxRef.current.canvas.height,
      );
    }
  }

  async function onSave() {
    if (!modal.open || !modal.dims) return;

    // create temp canvas
    const tempCanvas = document.createElement("canvas");
    const tCtx = tempCanvas.getContext("2d");

    if (!tCtx || !ctxRef.current) return;

    //  get image dims
    const img = await new Promise<HTMLImageElement>((res) => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        res(img);
      };
    });

    const ctxW = ctxRef.current.canvas.width;
    const ctxH = ctxRef.current.canvas.height;
    const wRatio = img.naturalWidth / ctxW;
    const hRatio = img.naturalHeight / ctxH;

    // dims
    const sx = modal.dims.x * wRatio;
    const sy = modal.dims.y * hRatio;
    const sw = modal.dims.w * wRatio;
    const sh = modal.dims.h * hRatio;
    const dx = 0;
    const dy = 0;
    const dw = modal.dims.w * wRatio;
    const dh = modal.dims.h * hRatio;

    // init size
    tCtx.canvas.width = modal.dims.w * wRatio;
    tCtx.canvas.height = modal.dims.h * hRatio;

    // apply image to temp canvas
    tCtx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

    const newSrc = await new Promise<string>((res, rej) => {
      tempCanvas.toBlob((blob) => {
        if (blob === null) {
          return rej();
        }

        const url = URL.createObjectURL(blob);
        res(url);
      });
    });

    const currentImages = [...mainState.images];
    const newId = Math.floor(Math.random() * 10000);
    currentImages.push({
      id: newId,
      src: newSrc,
      createdAt: "26/05/25 10:25",
      createdBy: "user.name@companyname.com",
    });
    mainState.images = currentImages;

    // remove temp canvas
    tempCanvas.remove();
    onCrop(newId);
    onClose();
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        id="image-cropper"
        className="absolute z-10 top-0 left-0 w-full h-full"
      ></canvas>

      {modal.open &&
        createPortal(
          <ModalContent
            onSave={onSave}
            onClose={onClose}
            data={{ id: modal.id }}
            top={modal.top}
            left={modal.left}
          />,
          document.getElementById("canvas-container")!,
        )}
    </>
  );
}

function ModalContent({
  onClose,
  onSave,
  data,
  top,
  left,
}: {
  onSave: () => void;
  onClose: () => void;
  data: { id: string | undefined };
  top: number | undefined;
  left: number | undefined;
}) {
  return (
    <div
      id={`note-${data?.id ?? ""}`}
      className="absolute flex z-20 bg-transparent"
      style={{ top, left: (left ?? 0) - 80 }}
    >
      <section className="flex justify-end mt-1 items-center px-2 pb-1 gap-2 w-20 bg-slate-900 rounded-b-sm border border-transparent border-x-slate-500 border-b-slate-500">
        <button className={`h-8 w-8 text-slate-50`} onClick={onClose}>
          <CloseIcon sx={{ fontSize: "1.5rem" }} />
        </button>
        <button className={`h-8 w-8 text-slate-50`} onClick={onSave}>
          <SaveIcon sx={{ fontSize: "1.5rem" }} />
        </button>
      </section>
    </div>
  );
}
