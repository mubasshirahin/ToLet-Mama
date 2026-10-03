import { useEffect, useRef, useState } from "react";
import { cn } from "./cn";

export function Dropdown({ trigger, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {typeof trigger === "function"
        ? trigger({ isOpen, setIsOpen })
        : trigger}

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-1 shadow-[0_16px_40px_rgba(44,24,16,0.12)]",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
