'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Wrapper({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;

    if (pathname === "/") {
      body.classList.add("main");
    } else {
      body.classList.remove("main");
    }
  }, [pathname]);

  return <div className="wrapper">{children}</div>;
}
