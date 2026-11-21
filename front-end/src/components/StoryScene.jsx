import { memo, useLayoutEffect, useRef } from "react";
import { fitCameraToImage } from "./story-camera.js";

const CAMERA_DURATION_MS = 600;
const CAMERA_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

export default function StoryScene({ background, camera, onReady, onError, attempt = 0 }) {
  const [defaultX, defaultY, defaultWidth, defaultHeight] = background.viewBox.split(/\s+/).map(Number);
  const { x, y, width, height } = camera ?? {
    x: defaultX,
    y: defaultY,
    width: defaultWidth,
    height: defaultHeight,
  };

  // Numeric props let split dialogue pages reuse the image without rendering it again.
  return (
    <CameraFrame
      background={background}
      x={x}
      y={y}
      width={width}
      height={height}
      onReady={onReady}
      onError={onError}
      attempt={attempt}
    />
  );
}

function positionFrame(frame, viewport, animate, plane) {
  if (viewport.width <= 0 || viewport.height <= 0) return;
  const { background, camera } = frame;
  const target = fitCameraToImage(camera, background, viewport);
  // Keep the raster layer close to its displayed size, then move it on the compositor.
  const baseScale = Math.max(viewport.width / background.width, viewport.height / background.height);
  const scale = viewport.width / target.width;
  const zoom = scale / baseScale;
  const transform = `matrix(${zoom}, 0, 0, ${zoom}, ${-target.x * scale}, ${-target.y * scale})`;
  if (animate && frame.transform === transform) return;
  // CSS retargets an interrupted transition from the currently displayed position.
  plane.style.transition = animate && frame.transform
    ? `transform ${CAMERA_DURATION_MS}ms ${CAMERA_EASING}`
    : "none";
  const displayWidth = `${background.width * baseScale}px`;
  const displayHeight = `${background.height * baseScale}px`;
  if (plane.style.width !== displayWidth) plane.style.width = displayWidth;
  if (plane.style.height !== displayHeight) plane.style.height = displayHeight;
  plane.style.transform = transform;
  frame.transform = transform;
}

const CameraFrame = memo(function CameraFrame({ background, x, y, width, height, onReady, onError, attempt }) {
  const container = useRef(null);
  const cameraPlane = useRef(null);
  const requestScene = useRef(null);
  const callbacks = useRef(null);

  useLayoutEffect(() => {
    const host = container.current;
    const plane = cameraPlane.current;
    let displayed = null;
    let pending = null;
    let disposed = false;
    let failed = false;

    function measure() {
      const bounds = host.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    }

    // Measure on entry/resize, not on each dialogue click.
    let viewport = measure();

    function present(frame) {
      if (disposed || pending !== frame || !frame.decoded) return;
      if (viewport.width <= 0 || viewport.height <= 0) return;
      // Keep the animated layer alive; swap its decoded pixels and framing together.
      positionFrame(frame, viewport, false, plane);
      plane.replaceChildren(frame.element);
      displayed = frame;
      pending = null;
      failed = false;
      callbacks.current.onReady?.();
    }

    requestScene.current = (nextBackground, camera) => {
      if (displayed?.background.src === nextBackground.src) {
        // Returning to the displayed image also invalidates any unfinished swap.
        pending = null;
        displayed.background = nextBackground;
        displayed.camera = camera;
        positionFrame(displayed, viewport, true, plane);
        // Ordinary camera motion needs no parent state update. Still clear a failed swap
        // if navigation returns to the image that is already on screen.
        if (failed) {
          failed = false;
          callbacks.current.onReady?.();
        }
        return;
      }
      if (pending?.background.src === nextBackground.src) {
        // A later dialogue/camera for the same pending image needs no second decode.
        pending.background = nextBackground;
        pending.camera = camera;
        return;
      }

      const element = new Image();
      element.className = "game__scene-image";
      element.alt = "";
      element.draggable = false;
      element.decoding = "async";
      const frame = { element, background: nextBackground, camera, decoded: false };
      pending = frame;
      element.src = nextBackground.src;
      // Entry preloading warms the cache; this decode prepares the actual next node.
      element.decode().then(() => {
        frame.decoded = true;
        present(frame);
      }).catch(() => {
        if (disposed || pending !== frame) return;
        pending = null;
        failed = true;
        // Keep the displayed frame intact and let the existing loading UI offer retry.
        callbacks.current.onError?.();
      });
    };

    const observer = new ResizeObserver(() => {
      const next = measure();
      if (next.width === viewport.width && next.height === viewport.height) return;
      viewport = next;
      if (displayed) positionFrame(displayed, viewport, false, plane);
      if (pending) present(pending);
    });
    observer.observe(host);

    return () => {
      disposed = true;
      pending = null;
      requestScene.current = null;
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    callbacks.current = { onReady, onError };
    requestScene.current(background, { x, y, width, height });
  }, [x, y, width, height, background, onReady, onError, attempt]);

  // React owns the fixed clip and persistent camera plane; the effect owns its image.
  return (
    <div ref={container} className="game__scene">
      <div ref={cameraPlane} className="game__scene-camera" />
    </div>
  );
});
