"use client";

// import { DndContext } from "@dnd-kit/core";
// import { useDroppable } from "@dnd-kit/core";
// import { useDraggable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";
// import React, { useId, useState } from "react";
//
// const Droppable = React.memo(function Droppable(props: any) {
//   const { isOver, setNodeRef } = useDroppable({
//     id: "droppable",
//   });
//   const style = {
//     color: isOver ? "green" : undefined,
//   };
//
//   return (
//     <div ref={setNodeRef} style={style}>
//       {props.children}
//     </div>
//   );
// });
//
// const Draggable = React.memo(function Draggable(props: any) {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: "draggable",
//   });
//   const style = {
//     transform: CSS.Translate.toString(transform),
//   };
//
//   return (
//     <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
//       {props.children}
//     </button>
//   );
// });
//
// const SIZE = ["11", "12", "21", "22"] as const;
//
// type ContainerProps = { size: (typeof SIZE)[number]; data?: any };
//
// function Box({ size, data }: ContainerProps) {
//   const height = +size[0] * 250;
//   const width = +size[1] * 250;
//
//   return (
//     <div
//       style={{ height: `${height}px`, width: `${width}px` }}
//       className="bg-red-500 m-1"
//     ></div>
//   );
// }
//
// export default function Masonry() {
//   const [isDropped, setIsDropped] = useState(false);
//   const draggableMarkup = <Draggable>Drag me</Draggable>;
//
//   const id = useId();
//
//   function handleDragEnd(event) {
//     if (event.over && event.over.id === "droppable") {
//       setIsDropped(true);
//     }
//   }
//
//   return (
//     <div className="flex min-h-screen min-w-screen">
//       <DndContext id={id} onDragEnd={handleDragEnd}>
//         {!isDropped ? draggableMarkup : null}
//         <Droppable>{isDropped ? draggableMarkup : "Drop here"}</Droppable>
//       </DndContext>
//     </div>
//   );
// }
//
// import React, {useState} from 'react';
//
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import React, { useId, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SIZE = ["11", "12", "21", "22"] as const;

type SortableBoxProps = {
  id: number;
  size: (typeof SIZE)[number];
  color: string;
  data?: any;
};

export function SortableBox(props: SortableBoxProps) {
  const {
    isOver,
    isDragging,
    over,
    active,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const width = +props.size[0] * 250;
  const height = +props.size[1] * 250;

  const style = {
    width,
    height,
    transition,
    transform: isDragging ? CSS.Translate.toString(transform) : undefined,
    opacity: isOver && over?.id !== active?.id ? 0.5 : 1,
    gridColumn: width < 500 ? "span 1" : "span 2",
    gridRow: width < 500 ? "span 1" : "span 2",
    backgroundColor: props.color,
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-red-500 border-2 border-black"
      style={style}
      {...attributes}
      {...listeners}
    >
      {props.id}
    </div>
  );
}

const initialItems = [
  { id: 1, size: 11, color: "red" },
  { id: 2, size: 11, color: "green" },
  { id: 3, size: 11, color: "blue" },
  { id: 4, size: 22, color: "yellow" },
  { id: 5, size: 11, color: "orange" },
  { id: 6, size: 11, color: "white" },
  { id: 7, size: 11, color: "gray" },
  { id: 8, size: 22, color: "purple" },
];

export default function App() {
  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const id = useId();

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-[repeat(4,minmax(0,250px))] max-w-full">
        <SortableContext items={items} strategy={rectSwappingStrategy}>
          {items.map((item) => (
            <SortableBox
              key={item.id}
              id={item.id}
              size={`${item.size}` as any}
              color={item.color}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
