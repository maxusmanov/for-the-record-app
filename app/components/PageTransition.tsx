import { ViewTransition, type ReactNode } from "react";

// slides the page in and out when a link is tagged "nav-forward" or "nav-back"
const slide = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={slide} exit={slide} default="none">
      {children}
    </ViewTransition>
  );
}
