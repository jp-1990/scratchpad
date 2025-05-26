"use client";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import React from "react";
import Header from "./Header";
import ImageSection from "./ImageSection";
import Actions from "./Actions";
import Details from "./Details";
import { ModalContext, Shapes } from "./context";

import testImg from "./test-img.png";
import testImg2 from "./test-img-2.png";

const images = [
  {
    id: 1,
    src: testImg.src,
    createdAt: "22/05/25 14:30",
    createdBy: "user.name@company.com",
  },
  {
    id: 2,
    src: testImg2.src,
    createdAt: "21/05/25 14:25",
    createdBy: "System",
  },
];

const shapeIds = {};
const shapes: Shapes = new Map();

const defaultModalContext = {
  notes: new Map(),
  shapeIds,
  shapes,
  images,
};

export default function () {
  const [open, setOpen] = React.useState(true);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button onClick={handleOpen}>Open modal</Button>
      <ModalContext.Provider value={defaultModalContext}>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { height: "inherit" } }}
        >
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            aria-label="close"
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent
            className="bg-slate-800 rounded-md border border-slate-700 overflow-hidden"
            sx={{ display: "flex", padding: "16px" }}
          >
            <Left />
            <Right />
          </DialogContent>
        </Dialog>
      </ModalContext.Provider>
    </>
  );
}

function Left() {
  const title = "Company Name (12345)";
  const subtitle = "Product name (654321)";
  const logoSrc = "";
  const details = [
    "Landing Page URL: wwww.examplehomepage.com",
    "Source URL: www.targetpage.com",
  ];
  const tags = ["tag 1", "tag 2", "tag 3", "tag 4", "tag 5"];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Header
        title={title}
        subtitle={subtitle}
        logoSrc={logoSrc}
        details={details}
        tags={tags}
      />
      <ImageSection />
    </Box>
  );
}

function Right() {
  return (
    <div className="flex flex-col w-80 min-w-80 max-w-80">
      <Details />
      <Actions />
    </div>
  );
}
