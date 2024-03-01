"use client";

import React, { useId, useState } from "react";
import { DndContext, closestCorners, pointerWithin } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

export function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style = {
    color: isOver ? "green" : undefined,
    width: "250px",
    height: "250px",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap border border-white relative"
    >
      {props.children}
    </div>
  );
}

export function Draggable(props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style: any = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  //@ts-ignore
  style.backgroundColor = props.color;
  style.width = props.small ? "248px" : "498px";
  style.height = props.small ? "248px" : "498px";
  style.position = props.position;
  if (props.position === "absolute") {
    style.top = 0;
    style.left = 0;
    style.zIndex = 10;
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      className="bg-sky-500"
      {...listeners}
      {...attributes}
    >
      {props.children}
    </button>
  );
}

export default function Widget() {
  // matrix
  const containers: string[][] = [];
  const initialOccupied: (string | null)[][] = [];
  for (let i = 0; i < 4; i++) {
    const row: string[] = [];
    const row_: (string | null)[] = [];
    for (let j = 0; j < 4; j++) {
      row.push(`${i}:${j}`);
      row_.push(null);
    }
    containers.push(row);
    initialOccupied.push(row_);
  }

  const [widgets, setWidgets] = useState({
    "0": {
      style: { color: "orange", position: "relative" },
      size: "large",
      parent: null,
    },
    "1": {
      style: { color: "blue", position: "relative" },
      size: "small",
      parent: null,
    },
    "2": {
      style: { color: "green", position: "relative" },
      size: "small",
      parent: null,
    },
    "3": {
      style: { color: "purple", position: "relative" },
      size: "small",
      parent: null,
    },
  });
  const [occupied, setOccupied] =
    useState<(string | null)[][]>(initialOccupied);

  const id = useId();

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      id={id}
      collisionDetection={pointerWithin}
    >
      {Object.keys(widgets).map((id) => {
        if ((widgets as any)[id].parent) {
          return null;
        }
        return (
          <Draggable
            id={id}
            key={id}
            color={(widgets as any)[id].style.color}
            position={(widgets as any)[id].style.position}
            small={(widgets as any)[id].size === "small"}
          >
            Drag Me
          </Draggable>
        );
      })}

      <div className="flex flex-wrap w-[1000px]">
        {containers.map((row) => {
          return row.map((id) => {
            const [row, col] = id.split(":");
            const widgetId = occupied[+row][+col];
            return (
              <Droppable key={id} id={id}>
                {!widgetId ? (
                  "Drop here"
                ) : (
                  <Draggable
                    id={widgetId}
                    key={widgetId}
                    color={(widgets as any)[widgetId].style.color}
                    position={(widgets as any)[widgetId].style.position}
                    small={(widgets as any)[widgetId].size === "small"}
                  >
                    Drag Me
                  </Draggable>
                )}
              </Droppable>
            );
          });
        })}
      </div>

      {/* <div className="flex flex-wrap w-[500px]">
        {containers.map((id) => (
          // We updated the Droppable component so it would accept an `id`
          // prop and pass it to `useDroppable`
          <Droppable key={id} id={id}>
            {parent !== id && parent2 !== id && parent3 !== id && parent4 !== id
              ? "Drop here"
              : null}
            {parent === id ? draggableMarkup : null}
            {parent2 === id ? draggableMarkup2 : null}
            {parent3 === id ? draggableMarkup3 : null}
            {parent4 === id ? draggableMarkup4 : null}
          </Droppable>
        ))}
      </div> */}
    </DndContext>
  );

  function handleDragEnd(event) {
    const { over, active } = event;

    const widgetId = active.id;
    let parentId = over?.id ?? null;

    const widget = (widgets as any)[widgetId];

    console.log(widgetId, parentId, widget);

    setOccupied((prev) => {
      const prevParent = widget.parent;
      console.log("prevparent", prevParent);
      if (prevParent) {
        const [prevRow, prevCol] = prevParent.split(":");
        prev[prevRow][prevCol] = null;
      }

      if (!parentId) return [...prev];

      const [row, col] = parentId.split(":");
      console.log(row, col);
      if (prev[row][col] === null) {
        prev[row][col] = widgetId;
      }

      console.log(prev);

      return [...prev];
    });

    setWidgets((prev: any) => {
      if (parentId) {
        const [row, col] = parentId.split(":");
        if (occupied[row][col] !== null) parentId = null;
      }

      widget.parent = parentId;
      if (widget.parent) {
        widget.style.position = "absolute";
      } else {
        widget.style.position = "relative";
      }

      return { ...prev };
    });

    // If the item is dropped over a container, set it as the parent
    // otherwise reset the parent to `null`
  }
}
