"use client";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import { Box, Chip } from "@mui/material";
import React from "react";

type HeaderProps = {
  title: string;
  subtitle: string;
  logoSrc?: string;
  details: string[];
  tags: string[];
};

export default function Header({
  title,
  subtitle,
  logoSrc,
  details = [],
  tags = [],
}: HeaderProps) {
  return (
    <Box className="relative mb-2 h-24">
      <Box className="flex items-center -mt-1 mb-1.5">
        {logoSrc && <img src={logoSrc} className="w-10 h-10 rounded-lg" />}
        {!logoSrc && (
          <HelpCenterIcon
            sx={{ fontSize: "42px" }}
            className="bg-slate-500 rounded-lg"
          />
        )}
        <Box className="flex flex-col justify-center ml-2 h-12 gap-1">
          <h1 className="leading-none text-lg text-slate-50">{title}</h1>
          <h2 className="leading-none font-light text-slate-400">{subtitle}</h2>
        </Box>
      </Box>

      {details.map((d) => {
        return (
          <p key={d} className="text-sm font-light text-slate-200">
            {d}
          </p>
        );
      })}

      <Box className="flex absolute top-0 right-2 gap-2">
        {tags.map((t) => {
          return <Chip key={t} label={t} variant="filled" />;
        })}
      </Box>
    </Box>
  );
}
