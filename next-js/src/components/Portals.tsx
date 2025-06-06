"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { createPortal } from "react-dom";
import { Autocomplete, TextField } from "@mui/material";

function BasicDropdown() {
  const [open, setOpen] = React.useState(false);

  const ref = React.useRef<HTMLDivElement>(null);

  function toggleOpen() {
    setOpen((p) => !p);
  }

  const { x, y, height } = ref.current?.getBoundingClientRect() ?? {
    x: 0,
    y: 0,
    height: 0,
  };

  const dropdownX = x;
  const dropdownY = y + height;

  return (
    <div ref={ref} className="h-fit">
      <button
        onClick={toggleOpen}
        className="bg-slate-100 border border-slate-600 w-32 py-1 text-slate-600"
      >
        Placeholder
      </button>
      {open &&
        createPortal(
          <div
            className="w-32 h-96 bg-red-500 absolute z-1400"
            style={{ top: dropdownY, left: dropdownX }}
          ></div>,
          document.body,
        )}
    </div>
  );
}

interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

function BasicDialog(props: SimpleDialogProps) {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Modal</DialogTitle>
      <div className="flex flex-wrap w-96 h-36 bg-slate-300 p-2 overflow-auto">
        <BasicDropdown />
        <div className="mr-2"></div>
        <BasicDropdown />
      </div>
    </Dialog>
  );
}

function AutocompleteDialog(props: SimpleDialogProps) {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  const [data, setData] = React.useState<
    { id: number; label: string; temp?: boolean }[]
  >(listItems.slice(0, Math.ceil(containerHeight / rowHeight) * 2));

  const [loading, setLoading] = React.useState<number[]>([]);

  async function loadMore(limit: number, offset: number) {
    setData((prev) => {
      const newItems = listItems.slice(offset, offset + limit).map((i) => {
        return { ...i, temp: true };
      });
      return [...prev, ...newItems];
    });
    setLoading((prev) => {
      const newLoading = [...prev];
      for (let i = offset; i < offset + limit; i++) {
        newLoading.push(i);
      }
      return newLoading;
    });

    setTimeout(() => {
      setData((prev) => {
        const newItems = listItems.slice(offset, offset + limit);
        prev.splice(offset, limit, ...newItems);
        return [...prev];
      });
      setLoading((prev) => {
        return prev.filter((i) => i < offset || i >= offset + limit);
      });
    }, 800);
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Modal</DialogTitle>
      <div className="flex flex-wrap w-96 h-36 bg-slate-800 p-2 overflow-auto">
        <Autocomplete
          id="virtualize-demo"
          sx={{ width: 300 }}
          disableListWrap
          ListboxComponent={ListboxComponent}
          ListboxProps={{ loadMore, loading } as any}
          options={data}
          renderInput={(params) => {
            return (
              <TextField {...params} label="Virtualized infinite scroll" />
            );
          }}
          // renderOption={(props, option, state) =>
          //   [props, option, state.index] as React.ReactNode
          // }
          // renderGroup={(params) => params as any}
        />
      </div>
    </Dialog>
  );
}

const rowHeight = 28;
const containerHeight = 384;

const listItems = Array.from(Array(16000)).map((_, i) => {
  return {
    id: i,
    label: `Item ${i}`,
  };
});

function buildJsx(key: number, label: string, top: number, temp?: boolean) {
  return (
    <li
      key={key}
      style={{ top }}
      className={`transition-all absolute h-7 px-2 text-sm text-slate-600 py-1 w-full border border-slate-300 ${temp ? "animate-pulse bg-slate-400" : ""}`}
    >
      {temp ? "loading..." : label}
    </li>
  );
}

const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const children: any = props.children;

  const [range, setRange] = useState([
    0,
    Math.ceil(containerHeight / rowHeight),
  ]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  function onScroll() {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;

      const startIndex = Math.floor(scrollTop / rowHeight);
      const endIndex =
        Math.floor((scrollTop + containerHeight) / rowHeight) + 1;

      if (endIndex >= children.length) {
        const limit = 15;
        const offset = children.length;

        // @ts-ignore
        props.loadMore(limit, offset);
      }

      setRange([startIndex, endIndex]);
    }
  }

  const items = [];
  for (let i = range[0]; i < range[1]; i++) {
    if (!children[i]) break;
    items.push(
      buildJsx(
        children[i].key,
        children[i].props.children,
        i * rowHeight,
        (props as any).loading.includes(i),
      ),
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      role="listbox"
      className="h-96 w-full bg-slate-300 relative overflow-y-auto"
    >
      <ul style={{ height: `${(props as any).children.length * rowHeight}px` }}>
        {items}
      </ul>
    </div>
  );
});

export default function Portals() {
  const [basicOpen, setBasicOpen] = React.useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(true);

  const handleBasicOpen = () => {
    setBasicOpen(true);
  };

  const handleBasicClose = () => {
    setBasicOpen(false);
  };

  const handleAutocompleteOpen = () => {
    setAutocompleteOpen(true);
  };

  const handleAutocompleteClose = () => {
    setAutocompleteOpen(false);
  };

  return (
    <div>
      <div className="flex">
        <Button variant="outlined" onClick={handleBasicOpen}>
          Open Basic
        </Button>
        <div className="mr-2"></div>
        <Button variant="outlined" onClick={handleAutocompleteOpen}>
          Open Autocomplete
        </Button>
        <BasicDialog open={basicOpen} onClose={handleBasicClose} />
        <AutocompleteDialog
          open={autocompleteOpen}
          onClose={handleAutocompleteClose}
        />
      </div>
    </div>
  );
}
