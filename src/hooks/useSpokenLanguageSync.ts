import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALL_SUPPORTED_LANGUAGES,
  detectLanguageFromTranscript,
} from "../i18n/translations";

interface UseSpokenLanguageSyncOptions {
  language: string;
  onLanguageChange?: (newLanguage: string) => void;
}

/**
 * Real-time spoken language detection & synchronization hook for Gemini Live Voice
 * and text inputs. Automatically detects any of the 33 supported Indian & regional
 * languages from live transcripts or server tool calls and keeps the app's
 * `language` state and voice assistant response language synchronized.
 */
export function useSpokenLanguageSync({
  language,
  onLanguageChange,
}: UseSpokenLanguageSyncOptions) {
  const [autoDetectedNotice, setAutoDetectedNotice] = useState<string>("");
  const languageRef = useRef<string>(language);
  const onLanguageChangeRef = useRef<typeof onLanguageChange>(onLanguageChange);
  const inputBufferRef = useRef<string>("");

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    onLanguageChangeRef.current = onLanguageChange;
  }, [onLanguageChange]);

  const normalizeMatchedLanguage = useCallback((rawName: string): string | null => {
    const cleaned = rawName.trim().toLowerCase();
    if (!cleaned) return null;
    for (const supported of ALL_SUPPORTED_LANGUAGES) {
      if (supported.toLowerCase() === cleaned) return supported;
      const parenMatch = supported.match(/\((.+)\)/);
      const insideParen = parenMatch ? parenMatch[1].toLowerCase() : "";
      if (
        insideParen === cleaned ||
        supported.toLowerCase().includes(cleaned)
      ) {
        return supported;
      }
    }
    return null;
  }, []);

  const syncConfirmedLanguage = useCallback(
    (candidateLanguage: string, sourceLabel: string = "Auto-detected") => {
      const matched =
        ALL_SUPPORTED_LANGUAGES.includes(candidateLanguage)
          ? candidateLanguage
          : normalizeMatchedLanguage(candidateLanguage);

      if (!matched) return languageRef.current;

      if (matched !== languageRef.current) {
        languageRef.current = matched;
        setAutoDetectedNotice(`${sourceLabel}: ${matched}`);
        if (onLanguageChangeRef.current) {
          onLanguageChangeRef.current(matched);
        }
      }
      return matched;
    },
    [normalizeMatchedLanguage]
  );

  const inspectTranscriptChunk = useCallback(
    (chunkText: string, isUserInput: boolean = false): string => {
      if (!chunkText) return languageRef.current;

      if (isUserInput) {
        inputBufferRef.current = `${inputBufferRef.current} ${chunkText}`
          .trim()
          .slice(-240);
      }

      const textToInspect = isUserInput
        ? `${inputBufferRef.current} ${chunkText}`.trim()
        : chunkText;

      const detected = detectLanguageFromTranscript(
        textToInspect,
        languageRef.current
      );

      if (detected && detected !== languageRef.current) {
        return syncConfirmedLanguage(
          detected,
          isUserInput ? "Auto-detected spoken language" : "Synced voice language"
        );
      }

      return languageRef.current;
    },
    [syncConfirmedLanguage]
  );

  const resetTranscriptBuffer = useCallback(() => {
    inputBufferRef.current = "";
  }, []);

  return {
    languageRef,
    autoDetectedNotice,
    setAutoDetectedNotice,
    syncConfirmedLanguage,
    inspectTranscriptChunk,
    resetTranscriptBuffer,
  };
}
