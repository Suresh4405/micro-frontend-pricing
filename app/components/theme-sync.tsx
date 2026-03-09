"use client";

import { useEffect, useState } from "react";

export default function ThemeSync({ children }: any) {

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {

    const handler = (event: MessageEvent) => {

      if (event.data?.type === "theme") {
        setDarkMode(event.data.darkMode);
      }

    };

    window.addEventListener("message", handler);

    return () => window.removeEventListener("message", handler);

  }, []);

  return (
    <div className={darkMode ? "dark-theme" : "light-theme"}>
      {children}
    </div>
  );
}