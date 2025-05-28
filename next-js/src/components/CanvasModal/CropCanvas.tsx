"use client";
import React from "react";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { ModalContext } from "./context";
import { createPortal } from "react-dom";

type TransformState = {
  isDrawing: boolean;
  isMoving: boolean;
  offsetX: number | undefined;
  offsetY: number | undefined;
  width: number | undefined;
  height: number | undefined;
  mouseX?: number;
  mouseY?: number;
  cropArea?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  shape?: ClearRect;
};

class ClearRect {
  ctx: CanvasRenderingContext2D;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  isDrawing: boolean = false;
  isMoving: boolean = false;

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

  draw() {
    this.ctx.fillStyle = "rgb(2 6 24 / 60%)";
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.clearRect(this.offsetX, this.offsetY, this.width, this.height);

    // drag handles
    this.ctx.fillStyle = "rgb(255 255 255 / 60%)";
    this.ctx.fillRect(this.offsetX - 3, this.offsetY - 3, 6, 6);
    this.ctx.fillRect(
      this.offsetX + this.width / 2 - 3,
      this.offsetY + this.height - 3,
      6,
      6,
    );
    this.ctx.fillRect(
      this.offsetX + this.width / 2 - 3,
      this.offsetY - 3,
      6,
      6,
    );
    this.ctx.fillRect(this.offsetX + this.width - 3, this.offsetY - 3, 6, 6);
    this.ctx.fillRect(this.offsetX - 3, this.offsetY - 3 + this.height, 6, 6);
    this.ctx.fillRect(
      this.offsetX - 3,
      this.offsetY - 3 + this.height / 2,
      6,
      6,
    );
    this.ctx.fillRect(
      this.offsetX + this.width - 3,
      this.offsetY - 3 + this.height,
      6,
      6,
    );
    this.ctx.fillRect(
      this.offsetX + this.width - 3,
      this.offsetY - 3 + this.height / 2,
      6,
      6,
    );

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

  commit() {
    this.isDrawing = false;
    this.isMoving = false;
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
  ctx: CanvasRenderingContext2D,
  _mainState: ModalContext,
  transformState: TransformState,
) {
  return (e: MouseEvent) => {
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;

    // if (
    //   transformState.shape &&
    //   transformState.shape.isPointerInside(offsetX, offsetY)
    // ) {
    //   transformState.shape.beginMoving();
    //   transformState.mouseX = offsetX;
    //   transformState.mouseY = offsetY;
    // } else {
    //   const shape = new ClearRect(ctx, offsetX, offsetY, 0, 0);
    //   transformState.shape = shape.beginDrawing();
    // }

    let found = false;
    const target = transformState.cropArea;
    if (target) {
      const hit = checkBounds(
        offsetX,
        offsetY,
        target.x,
        target.y,
        target.w,
        target.h,
      );
      if (hit) {
        found = true;
      }
    }

    if (!found) {
      transformState.isDrawing = true;
      transformState.offsetY = offsetY;
      transformState.offsetX = offsetX;
    }

    if (found && target) {
      transformState.isMoving = true;
      transformState.offsetY = target.y;
      transformState.offsetX = target.x;
      transformState.width = target.w;
      transformState.height = target.h;
      transformState.mouseX = offsetX;
      transformState.mouseY = offsetY;
      ctx.canvas.style.cursor = "move";
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

    // if (!transformState.shape?.isMoving && !transformState.shape?.isDrawing) {
    //   if (transformState.shape?.isPointerInside(offsetX, offsetY)) {
    //     ctx.canvas.style.cursor = "move";
    //   } else {
    //     ctx.canvas.style.cursor = "default";
    //   }
    // }

    if (!transformState.isMoving && !transformState.isDrawing) {
      let found = false;
      const target = transformState.cropArea;
      if (target) {
        const hit = checkBounds(
          offsetX,
          offsetY,
          target.x,
          target.y,
          target.w,
          target.h,
        );
        if (hit) {
          found = true;
        }
      }
      if (found) {
        ctx.canvas.style.cursor = "move";
      } else {
        ctx.canvas.style.cursor = "default";
      }
    }

    // if (transformState.shape?.isDrawing) {
    //   transformState.shape.resize(offsetX, offsetY).draw();
    // }

    if (
      transformState.isDrawing &&
      transformState.offsetX &&
      transformState.offsetY
    ) {
      const w = offsetX - transformState.offsetX;
      const h = offsetY - transformState.offsetY;

      ctx.fillStyle = "rgb(2 6 24 / 60%)";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.clearRect(transformState.offsetX, transformState.offsetY, w, h);
      // drag handles
      ctx.fillStyle = "rgb(255 255 255 / 60%)";
      ctx.fillRect(
        transformState.offsetX - 3,
        transformState.offsetY - 3,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX + w / 2 - 3,
        transformState.offsetY + h - 3,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX + w / 2 - 3,
        transformState.offsetY - 3,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX + w - 3,
        transformState.offsetY - 3,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX - 3,
        transformState.offsetY - 3 + h,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX - 3,
        transformState.offsetY - 3 + h / 2,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX + w - 3,
        transformState.offsetY - 3 + h,
        6,
        6,
      );
      ctx.fillRect(
        transformState.offsetX + w - 3,
        transformState.offsetY - 3 + h / 2,
        6,
        6,
      );
    }

    // if (transformState.shape?.isMoving) {
    //   const mx = transformState.mouseX || transformState.shape.offsetX;
    //   // const my = transformState.mouseY || 0;
    //
    //   const x = offsetX - mx;
    //   // const y = offsetY - my;
    //
    //   transformState.shape.move(x, 0).draw();
    //   transformState.mouseY = undefined;
    // }

    if (
      transformState.isMoving &&
      transformState.offsetX &&
      transformState.offsetY &&
      transformState.width &&
      transformState.height
    ) {
      const mx = transformState.mouseX || 0;
      const my = transformState.mouseY || 0;

      const x = transformState.offsetX + (offsetX - mx);
      const y = transformState.offsetY + (offsetY - my);
      const w = transformState.width;
      const h = transformState.height;

      ctx.fillStyle = "rgb(2 6 24 / 60%)";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.clearRect(x, y, w, h);

      // drag handles
      ctx.fillStyle = "rgb(255 255 255 / 60%)";
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.fillRect(x + w / 2 - 3, y + h - 3, 6, 6);
      ctx.fillRect(x + w / 2 - 3, y - 3, 6, 6);
      ctx.fillRect(x + w - 3, y - 3, 6, 6);
      ctx.fillRect(x - 3, y - 3 + h, 6, 6);
      ctx.fillRect(x - 3, y - 3 + h / 2, 6, 6);
      ctx.fillRect(x + w - 3, y - 3 + h, 6, 6);
      ctx.fillRect(x + w - 3, y - 3 + h / 2, 6, 6);
    }
  };
}

function mouseUpHandler(
  ctx: CanvasRenderingContext2D,
  mainState: ModalContext,
  transformState: TransformState,
) {
  return (e: MouseEvent) => {
    const screenshotId = mainState.selectedScreenshot;
    const offsetY = e.offsetY;
    const offsetX = e.offsetX;

    if (!screenshotId) return;

    // if (transformState.shape?.isDrawing || transformState.shape?.isMoving) {
    //   const dims = transformState.shape.getDims();
    //   if ((dims.w > 9 || dims.w < -9) && (dims.h > 9 || dims.h < -9)) {
    //     const event = new CustomEvent("oncrop", {
    //       ...e,
    //       detail: { id: screenshotId, top: dims.top, left: dims.left, dims },
    //     });
    //     document.dispatchEvent(event);
    //   }
    //
    //   transformState.shape.commit();
    // }

    if (
      transformState.isDrawing &&
      transformState.offsetX &&
      transformState.offsetY
    ) {
      const dims = {
        x: transformState.offsetX,
        y: transformState.offsetY,
        w: offsetX - transformState.offsetX,
        h: offsetY - transformState.offsetY,
      };
      if ((dims.w > 9 || dims.w < -9) && (dims.h > 9 || dims.h < -9)) {
        transformState.cropArea = dims;

        const top = dims.h < 0 ? dims.y : dims.y + dims.h;
        const left = dims.w < 0 ? dims.x : dims.x + dims.w;
        const event = new CustomEvent("oncrop", {
          ...e,
          detail: { id: screenshotId, top, left, dims },
        });
        document.dispatchEvent(event);
      }
    }

    if (
      transformState.isMoving &&
      transformState.offsetX &&
      transformState.offsetY &&
      transformState.width &&
      transformState.height
    ) {
      const mx = transformState.mouseX || 0;
      const my = transformState.mouseY || 0;

      const x = transformState.offsetX + (offsetX - mx);
      const y = transformState.offsetY + (offsetY - my);
      const w = transformState.width;
      const h = transformState.height;

      const dims = {
        x,
        y,
        w,
        h,
      };
      if ((dims.w > 9 || dims.w < -9) && (dims.h > 9 || dims.h < -9)) {
        const top = dims.h < 0 ? dims.y : dims.y + dims.h;
        const left = dims.w < 0 ? dims.x : dims.x + dims.w;
        const event = new CustomEvent("oncrop", {
          ...e,
          detail: { id: screenshotId, top, left, dims },
        });
        document.dispatchEvent(event);

        transformState.cropArea = dims;
      }
    }

    transformState.isDrawing = false;
    transformState.offsetY = undefined;
    transformState.offsetX = undefined;
    transformState.width = undefined;
    transformState.height = undefined;
    transformState.mouseX = undefined;
    transformState.mouseY = undefined;
    ctx.canvas.style.cursor = "default";
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

  const transformState = React.useRef<TransformState>({
    isDrawing: false,
    isMoving: false,
    offsetY: undefined,
    offsetX: undefined,
    mouseX: undefined,
    mouseY: undefined,
    width: undefined,
    height: undefined,
    cropArea: undefined,
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
          mouseDownHandler(context2d, mainState, transformState)(e);
        };
        mousemove = mouseMoveHandler(context2d, mainState, transformState);
        mouseup = mouseUpHandler(context2d, mainState, transformState);

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

      transformState.cropArea = undefined;
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
