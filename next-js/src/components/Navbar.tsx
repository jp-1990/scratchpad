"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="p-2 border border-teal-500 rounded-sm">
      <Link
        href="/"
        className={`mr-4 ${pathname === "/" ? "text-teal-500" : ""}`}
      >
        HOME
      </Link>
      <Link
        href="/todo"
        className={`mr-4 ${pathname === "/todo" ? "text-teal-500" : ""}`}
      >
        TODO
      </Link>
    </nav>
  );
}