"use client";

import React, { useId, useRef, useState } from "react";
import { DndContext, pointerWithin } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

export function Droppable(props: any) {
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

export function Draggable(props: any) {
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
    style.top = props.small ? 0 : props.top;
    style.left = props.small ? 0 : props.left;
    style.bottom = props.bottom;
    style.right = props.right;
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

// matrix
const containers: string[][] = [];
const initialOccupied: (string)[][] = [];
for (let i = 0; i < 4; i++) {
  const row: string[] = [];
  const row_: (string)[] = [];
  for (let j = 0; j < 4; j++) {
    row.push(`${i}:${j}`);
    row_.push('');
  }
  containers.push(row);
  initialOccupied.push(row_);
}



export default function Widget() {

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
  const occupied = useRef<(string | null)[][]>(initialOccupied);

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
            const widgetId = occupied.current[+row][+col];
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
                    top={(widgets as any)[widgetId].style.top}
                    left={(widgets as any)[widgetId].style.left}
                    bottom={(widgets as any)[widgetId].style.bottom}
                    right={(widgets as any)[widgetId].style.right}
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

    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { over, active, activatorEvent: { layerX, layerY } } = event;

    const widgetId = active.id as keyof typeof widgets;

    console.log(event)

    // determine size of widget
    const size = widgets[widgetId].size;

    // if large, determine activation quarter
    let grabCorner: null | string = null;
    if (size === 'large') {
      if (layerX < 249 && layerY < 249) grabCorner = '0:0'
      if (layerX >= 249 && layerY < 249) grabCorner = '0:1'
      if (layerX < 249 && layerY >= 249) grabCorner = '1:0'
      if (layerX >= 249 && layerY >= 249) grabCorner = '1:1'
    }

    let parentId = over?.id ?? null;

    // check occupied slots to see if we can drop here
    if (parentId) {
      let [row, col] = parentId.split(':');
      row = +row
      col = +col

      // determine target cells
      const cells = [];
      switch (grabCorner) {
        case '0:0':
          cells.push([row, col]);
          cells.push([row, col + 1]);
          cells.push([row + 1, col]);
          cells.push([row + 1, col + 1]);
          break;
        case '0:1':
          break;
        case '1:0':
          break;
        case '1:1':
          break;

        default:
          cells.push([row, col]);
      }

      console.log('cells', cells)

      // check if free
      for (const cell of cells) {
        if (!cell) continue
        if (occupied.current[cell[0]][cell[1]]) return
      }


      // we're dropping in a valid cell - clear the previous cell/cells
      for (let i = 0; i < occupied.current.length; i++) {
        for (let j = 0; j < occupied.current[i].length; j++) {
          if (occupied.current[i][j] === widgetId) {
            occupied.current[i][j] = '';
          }
        }
      }
      // set new cell
      for (const cell of cells) {
        if (!cell) continue
        occupied.current[cell[0]][cell[1]] = widgetId;
      }
    } else {
      // if theres no parent id we dropped outside the grid - clear the widgetid from the grid
      for (let i = 0; i < occupied.current.length; i++) {
        for (let j = 0; j < occupied.current[i].length; j++) {
          if (occupied.current[i][j] === widgetId) {
            occupied.current[i][j] = '';
          }
        }
      }
    }

    // update widgets with new parent
    setWidgets((prev: any) => {
      prev[widgetId].parent = parentId
      if (parentId) {
        prev[widgetId].style.position = 'absolute'

        if (grabCorner) {
          switch (grabCorner) {
            case '0:0':
              prev[widgetId].style.top = 0
              prev[widgetId].style.left = 0
              prev[widgetId].style.bottom = undefined
              prev[widgetId].style.right = undefined
              break;
            case '0:1':
              prev[widgetId].style.top = 0
              prev[widgetId].style.left = undefined
              prev[widgetId].style.bottom = undefined
              prev[widgetId].style.right = 0
              break;
            case '1:0':
              prev[widgetId].style.top = undefined
              prev[widgetId].style.left = 0
              prev[widgetId].style.bottom = 0
              prev[widgetId].style.right = undefined
              break;
            case '1:1':
              prev[widgetId].style.top = undefined
              prev[widgetId].style.left = undefined
              prev[widgetId].style.bottom = 0
              prev[widgetId].style.right = 0
              break;
          }
        }
      } else {
        prev[widgetId].style.position = 'relative'
      }

      return { ...prev };
    });

    // If the item is dropped over a container, set it as the parent
    // otherwise reset the parent to `null`
  }
}
