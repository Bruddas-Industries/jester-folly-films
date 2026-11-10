import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "./lib/smooth-scroll";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Cursor } from "./components/Cursor";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-limelight focus:px-4 focus:py-2 focus:text-velvet"
        >
          Skip to content
        </a>
        <Nav />
        <Hero />
        <main id="main" tabIndex={-1} className="outline-none">
          <div className="h-[150vh]" />
        </main>
        <div className="grain" aria-hidden />
        <Cursor />
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
