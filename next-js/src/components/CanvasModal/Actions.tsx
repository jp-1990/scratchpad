"use client";

import React from "react";

export default function Actions() {
  return (
    <div className="flex w-full justify-end gap-2">
      <button className="border border-slate-100 text-slate-100 font-light rounded-sm text-sm px-4 py-1">
        Dismiss
      </button>
      <button className="border border-slate-100 bg-slate-100 text-slate-700 font-light rounded-sm text-sm px-4 py-1">
        Approve
      </button>
    </div>
  );
}
