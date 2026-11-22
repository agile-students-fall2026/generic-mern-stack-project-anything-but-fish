import { useCallback, useEffect, useRef, useState } from "react";
import { completeChapter, getChapterProgress, saveChapterProgress } from "../lib/chapter-api";

async function writeWithTimeout(action) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try { return await action({ signal: controller.signal }); }
  catch (error) {
    if (controller.signal.aborted) throw new Error("Saving progress is taking too long. Please retry.");
    throw error;
  } finally { clearTimeout(timer); }
}

export default function useChapterProgress(chapterId, enabled) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [readAttempt, setReadAttempt] = useState(0);
  const alive = useRef(false);
  const ready = useRef(false);
  const latest = useRef(null);
  const failure = useRef(null);
  const queue = useRef([]);
  const writing = useRef(false);
  const finishing = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; queue.current = []; };
  }, []);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    ready.current = false;
    setLoading(true);
    setError(null);
    failure.current = null;
    getChapterProgress(chapterId, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        latest.current = result;
        setProgress(result);
        ready.current = true;
      })
      .catch((cause) => {
        if (controller.signal.aborted && !timedOut) return;
        failure.current = { message: timedOut ? "Loading progress is taking too long. Please retry." : cause.message, status: cause.status, action: "read" };
        setError(failure.current);
      })
      .finally(() => {
        clearTimeout(timer);
        if (!controller.signal.aborted || timedOut) setLoading(false);
      });
    return () => { clearTimeout(timer); controller.abort(); };
  }, [chapterId, enabled, readAttempt]);

  const flush = useCallback(async () => {
    if (writing.current || failure.current || !ready.current) return;
    writing.current = true;
    setSaving(true);
    try {
      while (alive.current && queue.current.length) {
        const entryId = queue.current[0];
        try {
          // Mutations are serialized and are not aborted on each route change.
          const result = await writeWithTimeout((options) => saveChapterProgress(chapterId, entryId, options));
          if (!alive.current) return;
          queue.current.shift();
          latest.current = result;
          setProgress(result);
        } catch (cause) {
          if (!alive.current) return;
          failure.current = { message: cause.message, status: cause.status, action: "write" };
          setError(failure.current);
          break;
        }
      }
    } finally {
      writing.current = false;
      if (alive.current) setSaving(false);
    }
  }, [chapterId]);

  const recordEntry = useCallback((entryId) => {
    if (!enabled || !ready.current || finishing.current) return;
    const previous = queue.current.length ? queue.current.at(-1) : latest.current?.entryId;
    if (previous === entryId) return;
    queue.current.push(entryId);
    void flush();
  }, [enabled, flush]);

  const finish = useCallback(async () => {
    if (!enabled || !ready.current || writing.current || queue.current.length || finishing.current) return;
    finishing.current = true;
    setCompleting(true);
    setError(null);
    failure.current = null;
    try {
      const result = await writeWithTimeout((options) => completeChapter(chapterId, options));
      if (!alive.current) return;
      latest.current = result.progress;
      setProgress(result.progress);
      setCompletion(result);
    } catch (cause) {
      if (!alive.current) return;
      failure.current = { message: cause.message, status: cause.status, action: "complete" };
      setError(failure.current);
    } finally {
      finishing.current = false;
      if (alive.current) setCompleting(false);
    }
  }, [chapterId, enabled]);

  const retry = useCallback(() => {
    const action = failure.current?.action;
    failure.current = null;
    setError(null);
    if (action === "read") setReadAttempt((value) => value + 1);
    else if (action === "complete") void finish();
    else void flush();
  }, [finish, flush]);

  const resume = useCallback(() => {
    if (writing.current || finishing.current) return;
    queue.current = [];
    failure.current = null;
    setError(null);
    return latest.current;
  }, []);

  return { progress, loading, saving, completing, error, completion, recordEntry, finish, retry, resume };
}
