import { useEffect, useState } from "react";

// Reuse completed/in-flight requests without permanently retaining every decoded bitmap.
const images = new Map();

function preloadImage(src) {
  if (images.has(src)) return images.get(src).promise;

  const image = new Image();
  const entry = { ready: false, promise: null };
  image.src = src;
  entry.promise = image.decode().then(() => {
    entry.ready = true;
  }).catch((error) => {
    images.delete(src);
    throw error;
  });
  images.set(src, entry);
  return entry.promise;
}

export default function usePreloadedImages(sources) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(() => {
    const completed = sources.filter((src) => images.get(src)?.ready).length;
    return { ready: completed === sources.length, completed, error: false };
  });

  useEffect(() => {
    let active = true;
    let completed = 0;
    Promise.all(sources.map(async (src) => {
      await preloadImage(src);
      completed += 1;
      if (active) setState((current) => ({ ...current, completed }));
    })).then(() => {
      if (active) setState({ ready: true, completed, error: false });
    }).catch(() => {
      if (active) setState((current) => ({ ...current, error: true }));
    });
    return () => { active = false; };
  }, [sources, attempt]);

  function retry() {
    setState({ ready: false, completed: 0, error: false });
    setAttempt((value) => value + 1);
  }

  return { ...state, retry };
}
