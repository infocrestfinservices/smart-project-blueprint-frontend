import { useEffect, useRef, useCallback } from "react";
import { reportStorage } from "@/api/localStorageService";

/**
 * Auto-saves report content to the DB and localStorage backup.
 * Triggers on content change (debounced), and on page unload/visibility change.
 */
export function useAutoSave(reportId, content, { onSaved, onError, debounceMs = 3000 } = {}) {
  const lastSavedRef = useRef(content);
  const timerRef = useRef(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async (text) => {
    if (isSavingRef.current || text === lastSavedRef.current) return;
    isSavingRef.current = true;
    try {
      // Always keep localStorage backup
      localStorage.setItem(`report_autosave_${reportId}`, JSON.stringify({ content: text, savedAt: new Date().toISOString() }));
      await reportStorage.update(reportId, { report_content: text });
      lastSavedRef.current = text;
      onSaved?.();
    } catch (e) {
      onError?.(e);
    } finally {
      isSavingRef.current = false;
    }
  }, [reportId, onSaved, onError]);

  // Debounced auto-save on content change
  useEffect(() => {
    if (content === lastSavedRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(content), debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [content, save, debounceMs]);

  // Save on tab close / navigation away
  useEffect(() => {
    const handleUnload = () => {
      if (content !== lastSavedRef.current) {
        localStorage.setItem(`report_autosave_${reportId}`, JSON.stringify({ content, savedAt: new Date().toISOString() }));
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") save(content);
    };
    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [content, reportId, save]);

  // Check for unsaved local backup on mount
  const getLocalBackup = useCallback(() => {
    try {
      const raw = localStorage.getItem(`report_autosave_${reportId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [reportId]);

  const clearLocalBackup = useCallback(() => {
    localStorage.removeItem(`report_autosave_${reportId}`);
  }, [reportId]);

  return { save, getLocalBackup, clearLocalBackup };
}