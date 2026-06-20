import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely, e.g. cn("px-2", condition && "px-4")
// without leftover conflicting classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
