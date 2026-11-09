import { useCallback, useEffect, useState } from "react";
import { gameRequest } from "../lib/game-api";

export function useGameData(resource) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
    setData(null);
    setLoading(true);
    setError("");

    gameRequest(resource, { signal: controller.signal })
      .then((result) => { if (active && !controller.signal.aborted) setData(result); })
      .catch((failure) => {
        if (!active) return;
        if (timedOut) setError("This is taking too long. Please try again.");
        else if (!controller.signal.aborted) setError(failure.message);
      })
      .finally(() => {
        clearTimeout(timer);
        if (active) setLoading(false);
      });

    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [resource, attempt]);

  return { data, loading, error, retry };
}
