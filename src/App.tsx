import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "./lib/smooth-scroll";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Reel } from "./components/Reel";
import { Productions } from "./components/Productions";
import { Booking } from "./components/Booking";
import { Footer } from "./components/Footer";
import { VideoModalProvider } from "./components/VideoModal";
import { Cursor } from "./components/Cursor";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>
        <VideoModalProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-limelight focus:px-4 focus:py-2 focus:text-velvet"
          >
            Skip to content
          </a>
          <Nav />
          <Hero />
          <main id="main" tabIndex={-1} className="outline-none">
            <About />
            <Reel />
            <Productions />
            <Booking />
          </main>
          <Footer />
          <div className="grain" aria-hidden />
          <Cursor />
        </VideoModalProvider>
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
