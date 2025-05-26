"use client";
import { Typography } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import PersonIcon from "@mui/icons-material/Person";

import React, { ChangeEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "./context";

function formatDate(date: string) {
  if (!date.length) return date;
  const [D, T] = date.split("T");
  const [YYYY, MM, DD] = D.split("-");
  const [hh, mm] = T.split(":");
  return `${DD}/${MM}/${YYYY} ${hh}:${mm}`;
}

type NoteId = string;
type Note = {
  id: NoteId;
  title: string;
  details: string;
  timestamp: string;
  createdBy: string;
  comments: any[];
};

type NoteProps = {
  data: Note;
  onClick: (e: MouseEvent) => void;
};
function Note({ data, onClick }: NoteProps) {
  const [fullText, setFullText] = React.useState(false);

  function toggleFullText() {
    setFullText((p) => !p);
  }

  const nonFulltextStyle = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: "2",
    overflow: "hidden",
  } as const;

  return (
    <div key={data.id} className="mb-3 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-0.5 min-h-6">
        <div className="flex items-center ">
          <div className="h-4 w-4 bg-slate-400 rounded-sm mr-1"></div>
          <h6 className="text-slate-300">{data.title}</h6>
        </div>
        <span className="text-sm text-slate-400 font-light">
          {formatDate(data.timestamp)}
        </span>
      </div>
      <p
        className="text-sm text-slate-50 mb-1 w-[300px] cursor-pointer"
        style={fullText ? undefined : nonFulltextStyle}
        onClick={toggleFullText}
      >
        {data.details}
      </p>

      <div className="flex items-center justify-end">
        <span className="text-sm text-slate-400 font-light">
          {data.createdBy}
        </span>
      </div>
    </div>
  );
}

type CommentProps = {
  comment: {
    id: string;
    createdBy: string;
    createdAt: string;
    comment: string;
    images: string[];
  };
};

function Comment({ comment }: CommentProps) {
  const [lightbox, setLightbox] = React.useState<number | undefined>();

  function lightboxPrev(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setLightbox((p) => {
      return p !== undefined && p - 1 >= 0 ? p - 1 : comment.images.length - 1;
    });
  }

  function lightboxNext(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setLightbox((p) => {
      return p !== undefined && p + 1 < comment.images.length ? p + 1 : 0;
    });
  }

  return (
    <article className="flex flex-col mb-2">
      <div className="flex items-center h-8 gap-2 mb-0.5">
        <div className="flex items-center justify-center h-6 w-6 bg-slate-500 rounded-[3px]">
          <PersonIcon sx={{ fontSize: "18px" }} />
        </div>
        <div className="flex flex-col">
          <h6 className="text-xs">{comment.createdBy}</h6>
          <span className="text-xs text-slate-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex text-sm mb-0.5">{comment.comment}</div>

      {!!comment.images.length && (
        <div className="flex mt-1 gap-1">
          {comment.images.map((img: string, idx: number) => {
            return (
              <img
                key={img}
                onClick={() => setLightbox(idx)}
                className="h-12 w-12 rounded-sm"
                src={img}
              />
            );
          })}
        </div>
      )}

      {lightbox !== undefined &&
        createPortal(
          <div className="absolute z-[10000] w-full h-full top-0 left-0">
            <div
              onClick={() => setLightbox(undefined)}
              className="flex justify-center items-center w-full h-full bg-slate-900/80"
            >
              <button
                onClick={lightboxPrev}
                className="flex justify-center items-center mr-4 h-12 w-12 bg-slate-300/30 rounded-md"
              >
                <ArrowLeftIcon fontSize="large" />
              </button>
              <img className="rounded-lg" src={comment.images[lightbox]} />
              <button
                onClick={lightboxNext}
                className="flex justify-center items-center ml-4 h-12 w-12 bg-slate-300/30 rounded-md"
              >
                <ArrowRightIcon fontSize="large" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </article>
  );
}

function ModalContent({
  onClose,
  top,
  left,
  data,
  setNotes,
}: {
  onClose: () => void;
  top: number | undefined;
  left: number | undefined;
  data: Note | undefined;
  setNotes: React.Dispatch<React.SetStateAction<Map<string, Note>>>;
}) {
  const canvasState = React.useContext(ModalContext);

  const el = React.useRef<HTMLDivElement>(null);

  const saved = React.useRef(false);
  const initialValues = React.useRef({
    title: data?.title ?? "",
    details: data?.details ?? "",
  });

  const [fullText, setFullText] = React.useState(false);

  function toggleFullText() {
    setFullText((p) => !p);
  }

  const nonFulltextStyle = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: "2",
    overflow: "hidden",
  } as const;

  React.useEffect(() => {
    el.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    initialValues.current.title = data?.title ?? "";
    initialValues.current.details = data?.details ?? "";

    return () => {
      if (!saved.current) {
        const prevTitle = initialValues.current.title;
        const prevDetails = initialValues.current.details;
        setNotes((p) => {
          if (!data) return p;
          const targetNote = p.get(data.id);
          const newState = structuredClone(p);

          if (targetNote) {
            targetNote.title = prevTitle;
            targetNote.details = prevDetails;
            newState.set(data.id, targetNote);
          }

          return newState;
        });
      }

      initialValues.current.title = "";
      initialValues.current.details = "";
      saved.current = false;
    };
  }, [data?.id]);

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!data) return;
    const field: "title" | "details" = e.target.id as any;
    const value = e.target.value;

    setNotes((p) => {
      const newState = structuredClone(p);
      const targetNote = p.get(data.id);
      if (targetNote) {
        targetNote[field] = value;
        newState.set(data.id, targetNote);
      }

      return newState;
    });
  }

  function onDelete() {
    const screenshotId = canvasState.selectedScreenshot;

    if (!screenshotId) return;
    if (!data) return;
    const targetId = data.id;
    canvasState.shapeIds[screenshotId]?.delete(targetId);
    canvasState.shapes.delete(targetId);
    canvasState.notes.delete(targetId);

    setNotes((p) => {
      const newState = structuredClone(p);
      newState.delete(targetId);

      return newState;
    });

    const event = new CustomEvent("onannotationdelete", {
      detail: { id: targetId },
    });
    document.dispatchEvent(event);

    onClose();
  }

  function onCancel() {
    onClose();
  }

  function onSave() {
    if (!data) return;
    if (!data.title || !data.details) return;

    setNotes((p) => {
      const newState = structuredClone(p);
      const targetNote = p.get(data.id);
      if (targetNote) {
        targetNote.timestamp = new Date().toISOString();
        newState.set(data.id, targetNote);

        canvasState.notes.set(data.id, targetNote);
      }

      return newState;
    });

    saved.current = true;
    initialValues.current.title = data.title;
    initialValues.current.details = data.details;
    onClose();
  }

  const canEdit = !data?.timestamp;

  // -----
  // comments
  const [showCommentInput, setShowCommentInput] = React.useState(false);
  const [nComments, setNComments] = React.useState(2);
  const comment = React.useRef("");

  function toggleCommentInput() {
    setShowCommentInput((p) => !p);
  }

  function toggleShowMoreComments() {
    setNComments((p) => (p === 2 ? (data?.comments.length ?? 2) : 2));
  }

  function onCommentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    comment.current = value;
  }

  function onSubmitComment() {
    if (!data) return;

    const newComments = [...data.comments];
    newComments.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: "user.name@companyname.com",
      comment: comment.current,
      images: [
        "https://images.pexels.com/photos/32058694/pexels-photo-32058694/free-photo-of-cozy-alpine-cabins-in-misty-mountain-landscape.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/29038846/pexels-photo-29038846/free-photo-of-aerial-view-of-monaco-s-luxurious-marina-and-cityscape.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ],
    });

    setNotes((p) => {
      const newState = structuredClone(p);
      const targetNote = p.get(data.id);
      if (targetNote) {
        targetNote.comments = newComments;
        newState.set(data.id, targetNote);

        canvasState.notes.set(data.id, targetNote);
      }

      return newState;
    });

    toggleCommentInput();
    comment.current = "";
  }

  // -----

  return (
    <div
      ref={el}
      id={`note-${data?.id ?? ""}`}
      className="absolute flex z-20 bg-transparent -ml-[3px]"
      style={{ top, left }}
    >
      <section className="flex flex-col w-72 bg-slate-800 border border-slate-600 rounded-md mt-1 p-2 gap-2">
        {!canEdit && (
          <div className="-mb-1">
            <div className="flex items-center justify-between mb-0.5 min-h-5 -mt-1">
              <div className="flex items-center ">
                <div className="h-4 w-4 bg-slate-400 rounded-sm mr-1"></div>
                <h6 className="text text-slate-300">{data?.title}</h6>
              </div>
            </div>
            <p
              className="text-sm text-slate-50 mb-2 cursor-pointer"
              style={fullText ? undefined : nonFulltextStyle}
              onClick={toggleFullText}
            >
              {data?.details}
            </p>

            {!showCommentInput && (
              <div className="flex w-full justify-end mb-0.5">
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center text-sm text-white pl-1 -ml-1"
                    onClick={toggleCommentInput}
                  >
                    <AddIcon fontSize="small" sx={{ fontSize: "17px" }} />
                    Add Comment
                  </button>
                </div>
              </div>
            )}
            {showCommentInput && (
              <div className="flex flex-col mb-1">
                <textarea
                  id="details"
                  className="w-full bg-slate-600 placeholder:text-slate-300 text-slate-100 font-light text-sm rounded-t-sm px-2 py-1 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300"
                  placeholder="Comment..."
                  onChange={onCommentChange}
                />
                <div className="flex w-full justify-between">
                  <div>
                    <button className="flex items-center justify-center h-7 w-7 bg-slate-900">
                      <UploadIcon sx={{ fontSize: "20px" }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 px-0.5 bg-slate-900 rounded-b-md">
                    <button
                      onClick={toggleCommentInput}
                      className="flex items-center justify-center h-7 w-7 bg-slate-900"
                    >
                      <CloseIcon sx={{ fontSize: "20px" }} />
                    </button>
                    <button
                      onClick={onSubmitComment}
                      className="flex items-center justify-center h-7 w-7 bg-slate-900"
                    >
                      <SendIcon sx={{ fontSize: "18px" }} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {data.comments && (
              <div className="flex flex-col mt-2">
                {data.comments.slice(0, nComments).map((c) => {
                  return <Comment key={c.id} comment={c} />;
                })}
              </div>
            )}

            {data.comments.length > 2 && (
              <div className="flex items-center justify-between">
                <button
                  className="flex items-center text-xs text-white pl-1 -ml-1"
                  onClick={toggleShowMoreComments}
                >
                  {nComments === 2 ? "Show more" : "Show less"}
                  {nComments !== 2 && <ArrowUpIcon fontSize="small" />}
                  {nComments === 2 && <ArrowDownIcon fontSize="small" />}
                </button>
              </div>
            )}
          </div>
        )}

        {canEdit && (
          <input
            id="title"
            className="w-full bg-slate-600 placeholder:text-slate-300 text-slate-100 font-light text-sm rounded-sm px-2 py-1 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300"
            placeholder="Title..."
            value={data?.title}
            onChange={onChange}
          />
        )}
        {canEdit && (
          <textarea
            id="details"
            className="w-full bg-slate-600 placeholder:text-slate-300 text-slate-100 font-light text-sm rounded-sm px-2 py-1 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300"
            placeholder="Details..."
            value={data?.details}
            onChange={onChange}
          />
        )}

        {canEdit && (
          <div className="flex w-full justify-end gap-2 pt-1">
            {!data?.timestamp && (
              <button
                onClick={onDelete}
                className="w-20 border border-slate-100 text-slate-100 font-light rounded-sm text-sm px-4 py-1"
              >
                Delete
              </button>
            )}
            {data?.timestamp && (
              <button
                onClick={onCancel}
                className="w-20 border border-slate-100 text-slate-100 font-light rounded-sm text-sm px-4 py-1"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onSave}
              className="w-20 border border-slate-100 bg-slate-100 text-slate-700 font-light rounded-sm text-sm px-4 py-1"
            >
              Save
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Details() {
  const canvasState = React.useContext(ModalContext);

  const [modal, setModal] = React.useState({
    open: false,
    id: undefined as NoteId | undefined,
    left: undefined as number | undefined,
    top: undefined as number | undefined,
  });
  const [notes, setNotes] = React.useState<Map<NoteId, Note>>(new Map());

  React.useEffect(() => {
    function onAnnotationCreate(e?: any) {
      const id = e.detail.id;
      if (!id) return;

      setNotes((p) => {
        const newState = structuredClone(p);
        const shape = canvasState.shapes.get(id);
        if (shape) {
          const newNote = {
            id: shape.id,
            title: "",
            details: "",
            timestamp: "",
            createdBy: "user.name@company.com",
            comments: [],
          };
          newState.set(id, newNote);
          canvasState.notes.set(id, newNote);
        }

        return newState;
      });

      if (e) {
        setModal({ open: true, id, left: e.detail.left, top: e.detail.top });
      }
    }

    function onAnnotationSelect(e?: any) {
      if (e) {
        setModal((_p) => {
          return {
            open: true,
            id: e.detail.id,
            left: e.detail.left,
            top: e.detail.top,
          };
        });
      }
    }

    function onAnnotationDeselect(_e?: any) {
      setModal({
        open: false,
        id: undefined,
        top: undefined,
        left: undefined,
      });
    }

    const screenshotId = canvasState.selectedScreenshot;
    if (screenshotId) {
      const newState = new Map();

      canvasState.shapeIds[screenshotId]?.forEach((id) => {
        const note = canvasState.notes.get(id);
        if (note) {
          newState.set(id, {
            id: note.id,
            title: note?.title ?? "",
            details: note?.details ?? "",
            timestamp: note.timestamp,
            createdBy: "user.name@company.com",
            comments: note?.comments ?? [],
          });
        }
      });
      setNotes(newState);
    }

    document.addEventListener("onannotationcreate", onAnnotationCreate);
    document.addEventListener("onannotationselect", onAnnotationSelect);
    document.addEventListener("onannotationdeselect", onAnnotationDeselect);
    return () => {
      document.removeEventListener("onannotationcreate", onAnnotationCreate);
      document.removeEventListener("onannotationselect", onAnnotationSelect);
      document.removeEventListener(
        "onannotationdeselect",
        onAnnotationDeselect,
      );
    };
  }, []);

  return (
    <>
      <Typography
        variant="subtitle1"
        className="!leading-none text-slate-50 !mb-3 !ml-4"
      >
        Notes
      </Typography>

      <div className="flex flex-col flex-1 pl-4 overflow-y-auto [scrollbar-gutter:_stable] [scrollbar-color:_#94a3b8_#00000000] [scrollbar-width:_thin] pr-1 -mr-3 mb-4">
        {Array.from(notes, ([_name, value]) => value).map((n) => {
          function onClick() {
            const s = canvasState.shapes.get(n.id);
            if (!s) return;
            const top = s.h < 0 ? s.y : s.y + s.h;
            const left = s.w < 0 ? s.x + s.w : s.x;

            const el = document.getElementById(`note-${s.id}`);

            if (el) {
              el?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            } else {
              canvasState.setSelectedScreenshot &&
                canvasState.setSelectedScreenshot(s.screenshotId);
              setModal({
                open: true,
                id: s.id,
                left,
                top,
              });
            }
          }

          return <Note key={n.id} data={n} onClick={onClick} />;
        })}
      </div>

      {modal.open &&
        createPortal(
          <ModalContent
            onClose={() =>
              setModal({
                open: false,
                id: undefined,
                left: undefined,
                top: undefined,
              })
            }
            data={modal.id ? notes.get(modal.id) : undefined}
            top={modal.top}
            left={modal.left}
            setNotes={setNotes}
          />,
          document.getElementById("canvas-container")!,
        )}
    </>
  );
}
