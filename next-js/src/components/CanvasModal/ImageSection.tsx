"use client";
import React from "react";
import CropIcon from "@mui/icons-material/Crop";
import EditNoteIcon from "@mui/icons-material/EditNote";
import UploadIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import AnnotationCanvas from "./AnnotationCanvas";
import CropCanvas from "./CropCanvas";
import { ModalContext } from "./context";

const COMMAND = {
  ANNOTATE: 0,
  CROP: 1,
  UPLOAD: 2,
} as const;

type Command = (typeof COMMAND)[keyof typeof COMMAND];

export default function ImageSection() {
  const canvasState = React.useContext(ModalContext);

  const [imageSelectOpen, setImageSelectOpen] = React.useState(true);
  const [command, setCommand] = React.useState<Command>(COMMAND.ANNOTATE);
  const [selectedImage, setSelectedImage] = React.useState(1);
  canvasState.selectedScreenshot = selectedImage;
  canvasState.setSelectedScreenshot = setSelectedImage;

  const [selectedImageDims, setSelectedImageDims] = React.useState<
    { w: number; h: number } | undefined
  >(undefined);

  function onImageLoad(e: any) {
    const w = e.target.clientWidth;
    const h = e.target.clientHeight;
    setSelectedImageDims({ w, h });
  }

  function onToggleImageSelect() {
    setImageSelectOpen((p) => !p);
  }

  function onCommandChange(e: any, command: Command) {
    const event = new CustomEvent("onannotationdeselect", {
      ...e,
    });
    document.dispatchEvent(event);

    setCommand(command);
  }

  function onImageChange(e: any, id: number) {
    const event = new CustomEvent("onannotationdeselect", {
      ...e,
    });
    document.dispatchEvent(event);

    const imageEl = document.getElementById("image-el") as HTMLImageElement;
    const scrollEl = document.getElementById(
      "image-scroll-container",
    ) as HTMLDivElement;

    if (scrollEl && imageEl) {
      imageEl.onload = () => {
        scrollEl.scrollTo({ top: 0, behavior: "instant" });
      };
    }

    setSelectedImage(id);
  }

  function onNewImage(id: number) {
    onImageChange({}, id);
    setCommand(COMMAND.ANNOTATE);
  }

  const imageIdx = canvasState.images.findIndex((i) => i.id === selectedImage);
  const image = canvasState.images[imageIdx];

  return (
    <div className="relative flex flex-col [height:calc(100%_-_6.5rem)]">
      <div
        id="image-scroll-container"
        className="relative flex flex-1 pb-12 rounded-sm border border-slate-600 bg-slate-800 overflow-y-auto  [scrollbar-color:_#94a3b8_#00000000] [scrollbar-width:_thin]"
      >
        <div id="canvas-container" className="relative h-fit w-full">
          {command === COMMAND.ANNOTATE && (
            <AnnotationCanvas imageDims={selectedImageDims} />
          )}
          {command === COMMAND.CROP && (
            <CropCanvas
              onCrop={onNewImage}
              image={image.src}
              imageDims={selectedImageDims}
            />
          )}
          <img
            id="image-el"
            className="w-full"
            onLoad={onImageLoad}
            src={image?.src}
          />
        </div>
      </div>

      <div
        className={`absolute z-50 flex justify-between w-full ${imageSelectOpen ? "py-2" : "h-0 py-0"} px-2 bg-slate-900/90 bottom-0 left-0`}
      >
        <button
          onClick={onToggleImageSelect}
          className={`absolute flex justify-center items-center h-8 w-8 -top-8 left-0 bg-slate-900 rounded-tr-md  ${imageSelectOpen ? "rounded-bl-none" : "rounded-bl-sm"} border border-r-slate-500 border-t-slate-500 border-l-slate-900 border-b-slate-900`}
        >
          {imageSelectOpen ? <ArrowDownIcon /> : <ArrowUpIcon />}
        </button>

        <div
          className={`absolute flex gap-2 px-1.5 pt-1.5 pb-1 h-12 -top-12 right-0 bg-slate-900 rounded-tl-xl  ${imageSelectOpen ? "rounded-br-none" : "rounded-br-sm"} border border-l-slate-500 border-t-slate-500 border-r-slate-900 border-b-slate-900`}
        >
          <button
            id="file-select"
            className={`h-9 w-9 ${command === COMMAND.UPLOAD ? "bg-slate-100 text-slate-800" : "text-slate-50"} rounded-md`}
            onClick={(e) => {
              onCommandChange(e, COMMAND.UPLOAD);
              const input = document.getElementById("file-input");
              if (input) input.click();
            }}
          >
            <UploadIcon sx={{ fontSize: "2rem" }} />
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;

                const currentImages = [...canvasState.images];
                let newTargetId = undefined;
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const newSrc = URL.createObjectURL(file);
                  const newId = Math.floor(Math.random() * 10000);
                  newTargetId ??= newId;
                  currentImages.push({
                    id: newId,
                    src: newSrc,
                    createdAt: "26/05/25 10:25",
                    createdBy: "user.name@companyname.com",
                  });
                }
                canvasState.images = currentImages;
                onNewImage(newTargetId as number);
              }}
            />
          </button>
          <button
            className={`h-9 w-9 ${command === COMMAND.CROP ? "bg-slate-100 text-slate-800" : "text-slate-50"} rounded-md`}
            onClick={(e) => onCommandChange(e, COMMAND.CROP)}
          >
            <CropIcon sx={{ fontSize: "1.5rem" }} />
          </button>
          <button
            className={`h-9 w-9 ${command === COMMAND.ANNOTATE ? "bg-slate-100 text-slate-800" : "text-slate-50"} rounded-md`}
            onClick={(e) => onCommandChange(e, COMMAND.ANNOTATE)}
          >
            <EditNoteIcon sx={{ fontSize: "2rem" }} />
          </button>
        </div>

        <div
          className={`${imageSelectOpen ? "flex" : "hidden"} items-center ml-1`}
        >
          <button
            onClick={(e) => {
              let newIdx = imageIdx - 1;
              if (newIdx < 0) newIdx = canvasState.images.length - 1;

              onImageChange(e, canvasState.images[newIdx].id);
            }}
            className="flex justify-center items-center mr-2 h-8 w-6 bg-slate-300/30 rounded-md"
          >
            <ArrowLeftIcon fontSize="medium" />
          </button>
          <div className={`flex gap-2 `}>
            {canvasState.images.map(({ src, id }) => {
              return (
                <button
                  key={id}
                  onClick={(e) => {
                    onImageChange(e, id);
                  }}
                  className={`flex items-start overflow-hidden rounded-md border border-x-2 [border-left-style:_dotted] [border-right-style:_dotted] p-[3px] ${selectedImage === id ? "border-slate-200" : "border-transparent"}`}
                >
                  <div className="flex items-start overflow-hidden h-12 w-12 border border-transparent">
                    <img className=" w-12 rounded-sm object-cover" src={src} />
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={(e) => {
              let newIdx = imageIdx + 1;
              if (newIdx >= canvasState.images.length) newIdx = 0;

              onImageChange(e, canvasState.images[newIdx].id);
            }}
            className="flex justify-center items-center ml-2 h-8 w-6 bg-slate-300/30 rounded-md"
          >
            <ArrowRightIcon fontSize="medium" />
          </button>
        </div>

        <article
          className={`${imageSelectOpen ? "flex" : "hidden"}  flex-col items-start h-full`}
        >
          <span className="text-sm">Uploaded: {image?.createdAt}</span>
          <span className="text-xs text-slate-400">By: {image?.createdBy}</span>
        </article>
      </div>
    </div>
  );
}
