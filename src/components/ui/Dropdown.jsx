import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { cn } from "./cn";

export function Dropdown({ trigger, children, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const menuId = useId();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleClickOutside);
        return () => document.removeEventListener("pointerdown", handleClickOutside);
    }, []);

    const triggerProps = {
        "aria-expanded": isOpen,
        "aria-controls": menuId,
        "data-dropdown-trigger": "true",
    };
    const renderedTrigger = typeof trigger === "function"
        ? trigger({ isOpen, setIsOpen, triggerProps })
        : isValidElement(trigger)
            ? cloneElement(trigger, { ...trigger.props, ...triggerProps })
            : trigger;

    return (
        <div
            ref={ref}
            className="relative"
            onKeyDown={(event) => {
                if (event.key !== "Escape" || !isOpen) return;
                event.preventDefault();
                setIsOpen(false);
                ref.current?.querySelector("[data-dropdown-trigger='true']")?.focus();
            }}
        >
            {renderedTrigger}

            <div
                id={menuId}
                hidden={!isOpen}
                className={cn(
                    "absolute right-0 top-full z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-1 shadow-[0_16px_40px_rgba(44,24,16,0.12)]",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default Dropdown;
