import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "./lib/smooth-scroll";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>
        <main id="main" />
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
