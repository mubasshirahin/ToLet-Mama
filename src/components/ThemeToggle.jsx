import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

function ThemeToggle({ className = "", compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center gap-2 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21] transition-all hover:border-[#2C1810] hover:text-[#2C1810] ${className}`}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center border border-current">
        {isDark ? <SunMedium className="h-3.5 w-3.5" strokeWidth={2} /> : <MoonStar className="h-3.5 w-3.5" strokeWidth={2} />}
      </span>
      {!compact && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}

export default ThemeToggle;
