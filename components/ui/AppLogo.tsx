import type { SVGProps } from "react";

export interface AppLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * "The Apex Stack" — a minimalist mark of three receding parallel slabs with
 * progressive opacity and a terminal flow dot. Dark-mode-first by default:
 * the slabs render in `currentColor` (inherits text color) and the flow dot
 * uses an accent override passed via `className`.
 */
export function AppLogo({
  size = 24,
  className = "",
  ...props
}: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2"
        className="opacity-40"
      />
      <path
        d="M7 11h10M4 11a2 2 0 012-2h12a2 2 0 012 2"
        className="opacity-70"
      />
      <path
        d="M10 16h4M4 16a2 2 0 012-2h12a2 2 0 012 2"
        className="opacity-100"
      />
      <path d="M12 20v.01" className="stroke-[3] text-emerald-500" />
    </svg>
  );
}
