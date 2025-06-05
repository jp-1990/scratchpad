"use client";
import React from "react";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { ModalContext } from "./context";
import { createPortal } from "react-dom";

type Handle = "tl" | "tm" | "tr" | "ml" | "mr" | "bl" | "bm" | "br";

const handleToCursor = {
  tl: "nwse-resize",
  tm: "ns-resize",
  tr: "nesw-resize",
  ml: "ew-resize",
  mr: "ew-resize",
  bl: "nesw-resize",
  bm: "ns-resize",
  br: "nwse-resize",
};

type TransformState = {
  mouseX?: number;
  mouseY?: number;
  shape?: ClearRect;
};

class ClearRect {
  ctx: CanvasRenderingContext2D;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  dragHandles: {
    handle: Handle;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  }[] = [];
  isDrawing: boolean = false;
  isMoving: boolean = false;
  isResizing: Handle | undefined = undefined;

  constructor(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
  ) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
  }

  isPointerInside(pointerX: number, pointerY: number) {
    const x1 = this.width < 0 ? this.offsetX + this.width : this.offsetX;
    const x2 = this.width < 0 ? this.offsetX : this.offsetX + this.width;
    const inX = pointerX >= x1 && pointerX <= x2;

    const y1 = this.height < 0 ? this.offsetY + this.height : this.offsetY;
    const y2 = this.height < 0 ? this.offsetY : this.offsetY + this.height;
    const inY = pointerY >= y1 && pointerY <= y2;

    return inX && inY;
  }

  isPointerInsideDragHandle(
    pointerX: number,
    pointerY: number,
  ): Handle | undefined {
    const padding = 8;
    let found: Handle | undefined = undefined;
    for (let i = 0; i < this.dragHandles.length; i++) {
      const {
        handle: loc,
        offsetX,
        offsetY,
        width,
        height,
      } = this.dragHandles[i];

      const x1 = width < 0 ? offsetX + width : offsetX;
      const x2 = width < 0 ? offsetX : offsetX + width;
      const inX = pointerX >= x1 - padding && pointerX <= x2 + padding;

      const y1 = height < 0 ? offsetY + height : offsetY;
      const y2 = height < 0 ? offsetY : offsetY + height;
      const inY = pointerY >= y1 - padding && pointerY <= y2 + padding;

      if (inX && inY) {
        found = loc;
        break;
      }
    }

    return found;
  }

  resizeWithDragHandle(pointerX: number, pointerY: number) {
    switch (this.isResizing) {
      // top
      case "tl": {
        this.offsetY += pointerY;
        this.offsetX += pointerX;
        this.height -= pointerY;
        this.width -= pointerX;
        break;
      }
      case "tm": {
        this.offsetY += pointerY;
        this.height -= pointerY;
        break;
      }
      case "tr": {
        this.offsetY += pointerY;
        this.height -= pointerY;
        this.width += pointerX;
        break;
      }
      // mid
      case "ml": {
        this.offsetX += pointerX;
        this.width -= pointerX;
        break;
      }
      case "mr": {
        this.width += pointerX;
        break;
      }
      // bot
      case "bl": {
        this.offsetX += pointerX;
        this.height += pointerY;
        this.width -= pointerX;
        break;
      }
      case "bm": {
        this.height += pointerY;
        break;
      }
      case "br": {
        this.height += pointerY;
        this.width += pointerX;
        break;
      }
      default:
        break;
    }

    return this;
  }

  move(newOffsetX: number, newOffsetY: number) {
    this.offsetX += newOffsetX;
    this.offsetY += newOffsetY;
    return this;
  }

  resize(newOffsetX: number, newOffsetY: number) {
    this.width = newOffsetX - this.offsetX;
    this.height = newOffsetY - this.offsetY;
    return this;
  }

  drawDragHandle(handle: Handle) {
    const width = 6;
    const height = 6;
    let offsetX = 0;
    let offsetY = 0;
    this.ctx.fillStyle = "rgb(255 255 255 / 60%)";

    switch (handle) {
      // top
      case "tl": {
        offsetX = this.offsetX - width / 2;
        offsetY = this.offsetY - height / 2;
        break;
      }
      case "tm": {
        offsetX = this.offsetX + this.width / 2 - width / 2;
        offsetY = this.offsetY - height / 2;
        break;
      }
      case "tr": {
        offsetX = this.offsetX + this.width - width / 2;
        offsetY = this.offsetY - height / 2;
        break;
      }
      // mid
      case "ml": {
        offsetX = this.offsetX - width / 2;
        offsetY = this.offsetY + this.height / 2 - height / 2;
        break;
      }
      case "mr": {
        offsetX = this.offsetX + this.width - width / 2;
        offsetY = this.offsetY + this.height / 2 - height / 2;
        break;
      }
      // bot
      case "bl": {
        offsetX = this.offsetX - width / 2;
        offsetY = this.offsetY + this.height - height / 2;
        break;
      }
      case "bm": {
        offsetX = this.offsetX + this.width / 2 - width / 2;
        offsetY = this.offsetY + this.height - height / 2;
        break;
      }
      case "br": {
        offsetX = this.offsetX + this.width - width / 2;
        offsetY = this.offsetY + this.height - height / 2;
        break;
      }
    }

    this.ctx.fillRect(offsetX, offsetY, width, height);
    this.dragHandles.push({
      handle: handle,
      offsetX,
      offsetY,
      width,
      height,
    });
  }

  draw() {
    this.ctx.fillStyle = "rgb(2 6 24 / 60%)";
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.clearRect(this.offsetX, this.offsetY, this.width, this.height);

    // drag handles
    this.dragHandles = [];
    const locs = ["tl", "tm", "tr", "ml", "mr", "bl", "bm", "br"] as const;
    for (let i = 0; i < locs.length; i++) {
      this.drawDragHandle(locs[i]);
    }

    return this;
  }

  beginDrawing() {
    this.isDrawing = true;
    return this;
  }

  beginMoving() {
    this.isMoving = true;
    return this;
  }

  beginResizing(handle: Handle) {
    this.isResizing = handle;
    return this;
  }

  commit() {
    this.isDrawing = false;
    this.isMoving = false;
    this.isResizing = undefined;
    return this;
  }

  getDims() {
    const top = this.height < 0 ? this.offsetY : this.offsetY + this.height;
    const left = this.width < 0 ? this.offsetX : this.offsetX + this.width;

    return {
      top,
      left,
      x: this.offsetX,
      y: this.offsetY,
      w: this.width,
      h: this.height,
    };
  }

  getTruePosition() {
    const offsetX = this.width < 0 ? this.offsetX + this.width : this.offsetX;
    const offsetY = this.height < 0 ? this.offsetY + this.height : this.offsetY;
    const width = Math.abs(this.width);
    const height = Math.abs(this.height);

    return {
      top: offsetY + height,
      left: offsetX + width,
      x: offsetX,
      y: offsetY,
      w: width,
      h: height,
    };
  }
}

function mouseDownHandler(
  ctx: CanvasRenderingContext2D,
  _mainState: ModalContext,
  transformState: TransformState,
  closeModal: () => void,
) {
  return (e: MouseEvent) => {
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;

    closeModal();

    const dragHandle = transformState.shape?.isPointerInsideDragHandle(
      offsetX,
      offsetY,
    );
    if (transformState.shape && dragHandle) {
      transformState.shape.beginResizing(dragHandle);
      transformState.mouseX = offsetX;
      transformState.mouseY = offsetY;
    } else if (
      transformState.shape &&
      transformState.shape.isPointerInside(offsetX, offsetY)
    ) {
      transformState.shape.beginMoving();
      transformState.mouseX = offsetX;
      transformState.mouseY = offsetY;
    } else {
      resetCanvas(ctx);
      const shape = new ClearRect(ctx, offsetX, offsetY, 0, 0);
      transformState.shape = shape.beginDrawing();
    }
  };
}

function mouseMoveHandler(
  ctx: CanvasRenderingContext2D,
  mainState: ModalContext,
  transformState: TransformState,
) {
  return (e: MouseEvent) => {
    const screenshotId = mainState.selectedScreenshot;

    const offsetX = e.offsetX;
    const offsetY = e.offsetY;

    if (!screenshotId) return;

    if (!transformState.shape?.isMoving && !transformState.shape?.isDrawing) {
      const dragHandleLoc = transformState.shape?.isPointerInsideDragHandle(
        offsetX,
        offsetY,
      );
      if (dragHandleLoc || transformState.shape?.isResizing) {
        ctx.canvas.style.cursor =
          handleToCursor[dragHandleLoc ?? transformState.shape!.isResizing!];
      } else if (transformState.shape?.isPointerInside(offsetX, offsetY)) {
        ctx.canvas.style.cursor = "move";
      } else {
        ctx.canvas.style.cursor = "default";
      }
    }

    if (transformState.shape?.isResizing) {
      const mx = transformState.mouseX || 0;
      const my = transformState.mouseY || 0;

      const x = offsetX - mx;
      const y = offsetY - my;

      transformState.shape.resizeWithDragHandle(x, y).draw();
      transformState.mouseX = offsetX;
      transformState.mouseY = offsetY;
    } else if (transformState.shape?.isDrawing) {
      const dims = transformState.shape.getDims();
      transformState.shape.resize(offsetX, offsetY);

      if ((dims.w > 20 || dims.w < -20) && (dims.h > 20 || dims.h < -20)) {
        transformState.shape.draw();
      }
    } else if (transformState.shape?.isMoving) {
      const mx = transformState.mouseX || 0;
      const my = transformState.mouseY || 0;

      const x = offsetX - mx;
      const y = offsetY - my;

      transformState.shape.move(x, y).draw();
      transformState.mouseX = offsetX;
      transformState.mouseY = offsetY;
    }
  };
}

function mouseUpHandler(
  _ctx: CanvasRenderingContext2D,
  mainState: ModalContext,
  transformState: TransformState,
) {
  return (e: MouseEvent) => {
    const screenshotId = mainState.selectedScreenshot;
    if (!screenshotId) return;

    if (
      transformState.shape?.isDrawing ||
      transformState.shape?.isMoving ||
      transformState.shape?.isResizing
    ) {
      const dims = transformState.shape.getTruePosition();
      if ((dims.w > 20 || dims.w < -20) && (dims.h > 20 || dims.h < -20)) {
        const event = new CustomEvent("oncrop", {
          ...e,
          detail: { id: screenshotId, top: dims.top, left: dims.left, dims },
        });
        document.dispatchEvent(event);
      }

      transformState.shape.commit();
    }

    transformState.mouseX = undefined;
    transformState.mouseY = undefined;
  };
}

function resetCanvas(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgb(2 6 24 / 60%)";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

  const transformState = React.useRef<TransformState>({
    mouseX: undefined,
    mouseY: undefined,
    shape: undefined,
  }).current;

  function resetTransformState() {
    transformState.shape = undefined;
    transformState.mouseX = undefined;
    transformState.mouseY = undefined;
  }

  function resetModal() {
    setModal({
      open: false,
      id: undefined,
      left: undefined,
      top: undefined,
      dims: undefined,
    });
  }

  React.useEffect(() => {
    if (modal.open) {
      resetModal();
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

        mousedown = mouseDownHandler(
          context2d,
          mainState,
          transformState,
          resetModal,
        );
        mousemove = mouseMoveHandler(context2d, mainState, transformState);
        mouseup = mouseUpHandler(context2d, mainState, transformState);

        canvasRef.current.addEventListener("mousedown", mousedown);
        canvasRef.current.addEventListener("mousemove", mousemove);
        canvasRef.current.addEventListener("mouseup", mouseup);

        resetCanvas(context2d);
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
  }, [imageDims]);

  function onClose() {
    resetModal();
    resetTransformState();

    if (ctxRef.current) {
      resetCanvas(ctxRef.current);
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
