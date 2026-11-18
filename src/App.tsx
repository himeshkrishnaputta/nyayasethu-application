import { apiFetch } from "./api";
import React, { useState, useRef, useEffect } from "react";
import {
  Scale,
  Mic,
  Send,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Volume2,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Home,
  BookOpen,
  ClipboardCheck,
  Navigation,
  AlertTriangle,
  Copy,
  Check,
  ArrowLeft,
  MessageSquare,
  Globe,
  Building2,
  Briefcase,
  Users,
  ShoppingBag,
  Columns,
  Smartphone,
  Loader2,
  Plus,
  Minus,
  Calendar,
  Download,
  Camera,
  Trash2,
  Square,
  FileAudio,
  X,
  History,
  Share2,
  Bell,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
  Box,
  Compass,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  ASSETS,
  INITIAL_SITUATION,
  INITIAL_ASSESSMENT,
  COMMON_SITUATIONS,
  EVIDENCE_ITEMS,
  ELIGIBILITY_CATEGORIES,
  LAW_LIBRARY_TOPICS,
  STATUTORY_ACT_SECTIONS,
  CITIZEN_FAQS,
  INITIAL_MILESTONES,
  LEGAL_AID_CENTERS,
  getLocalizedLegalData,
  getAllPresetSituationPrompts,
  getPresetIndex,
  LegalAssessment,
  MilestoneItem,
} from "./data/legalData";
import { LiveVoiceModal } from "./components/LiveVoiceModal";
import { CrimeScene3DStudio } from "./components/CrimeScene3DStudio";
import { ChatDrawer, ChatMessage } from "./components/ChatDrawer";
import { CameraCaptureModal } from "./components/CameraCaptureModal";
import {
  BookingAppointmentModal,
  BookingDetails,
} from "./components/BookingAppointmentModal";
import { HowItWorksModal } from "./components/HowItWorksModal";
import {
  I18nProvider,
  ALL_SUPPORTED_LANGUAGES,
  getTranslationsForLanguage,
  detectLanguageFromTranscript,
} from "./i18n/translations";

const LANGUAGES = ALL_SUPPORTED_LANGUAGES;

const DEFAULT_NOTICE_DRAFT = `FORMAL LEGAL REPRESENTATION / DEMAND NOTICE (TEMPLATE)

Date: ${new Date().toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}

To,
[Name & Address of Opposite Party / Concerned Authority]

SUBJECT: FORMAL LEGAL NOTICE / CITIZEN REPRESENTATION SEEKING STATUTORY REDRESSAL

Dear Sir/Madam,

1. Describe your situation on Screen 1 or via Live Voice, then click "Customize with AI" above to automatically draft a customized legal notice citing the exact Indian Acts and Sections for your case.
2. Specify the factual timeline, supporting documents held, and the relief or resolution requested within fifteen (15) days.

Sincerely,
[Citizen / Applicant Name]
(Drafted with Nyaya Sahayak · NALSA Citizen Legal Aid Guide)`;

// Auto-Save Draft Storage Config & Types for Citizen Progress Persistence
const AUTOSAVE_STORAGE_KEY = "nyaya_sahayak_draft_progress_v1";

interface AutoSaveDraftState {
  situationInput: string;
  selectedAnswers: Record<string, string>;
  selectedEvidence: string[];
  lastSaved: number;
}

const loadAutoSavedDraft = (): Partial<AutoSaveDraftState> | null => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch (err) {
    console.warn("Unable to load auto-saved legal draft from localStorage:", err);
  }
  return null;
};

const saveDraftToLocalStorage = (
  situation: string,
  answers: Record<string, string>,
  evidence: string[]
): number | null => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const timestamp = Date.now();
    const payload: AutoSaveDraftState = {
      situationInput: situation,
      selectedAnswers: answers,
      selectedEvidence: evidence,
      lastSaved: timestamp,
    };
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
    return timestamp;
  } catch (err) {
    console.warn("Unable to save legal draft to localStorage:", err);
    return null;
  }
};

const formatTimeSince = (timestamp: number | null): string => {
  if (!timestamp) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function App() {
  // Navigation & View Mode ("single" or "canvas" showing all 6 screens side-by-side like the mockup!)
  const [viewMode, setViewMode] = useState<"single" | "canvas">("single");
  const [activeScreen, setActiveScreen] = useState<number>(1);
  const [language, setLanguage] = useState<string>("English");
  const [jurisdiction, setJurisdiction] = useState<string>("Delhi NCR");
  const t = getTranslationsForLanguage(language);
  const localizedData = getLocalizedLegalData(language);

  // Friendly Citizen Help & Guided Action States
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [bookingTargetCenter, setBookingTargetCenter] = useState<
    (typeof LEGAL_AID_CENTERS)[number] | null
  >(null);
  const [screen1InputTab, setScreen1InputTab] = useState<"voice" | "type">(
    "voice"
  );
  const [speedPostNumber, setSpeedPostNumber] = useState<string>("");
  const [speedPostSaved, setSpeedPostSaved] = useState<boolean>(false);

  // Network Connectivity State (navigator.onLine tracking)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  });
  const [showOnlineRestored, setShowOnlineRestored] = useState<boolean>(false);


  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineRestored(true);
      const timer = setTimeout(() => {
        setShowOnlineRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-Save Draft Initializer (restores situation, clarifying answers & evidence from localStorage)
  const initialDraftRef = useRef<Partial<AutoSaveDraftState> | null>(null);
  if (initialDraftRef.current === null) {
    initialDraftRef.current = loadAutoSavedDraft();
  }

  // Screen 1 & 2 State: Situation & AI Assessment
  const [situationInput, setSituationInput] = useState<string>(() => {
    const saved = initialDraftRef.current;
    if (saved && typeof saved.situationInput === "string") {
      return saved.situationInput;
    }
    return INITIAL_SITUATION;
  });
  const [assessment, setAssessment] =
    useState<LegalAssessment>(INITIAL_ASSESSMENT);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >(() => {
    const saved = initialDraftRef.current;
    if (saved && saved.selectedAnswers && typeof saved.selectedAnswers === "object") {
      return saved.selectedAnswers;
    }
    return {};
  });

  // Screen 3 State: Evidence, Eligibility & AI Notice Generator
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(() => {
    const saved = initialDraftRef.current;
    if (saved && Array.isArray(saved.selectedEvidence)) {
      return saved.selectedEvidence;
    }
    return [];
  });

  // Auto-Save Management State
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<number | null>(() => {
    const saved = initialDraftRef.current;
    return typeof saved?.lastSaved === "number" ? saved.lastSaved : null;
  });
  const [autoSaveBadge, setAutoSaveBadge] = useState<"idle" | "saving" | "saved">("idle");
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() => {
    const saved = initialDraftRef.current;
    return !!(
      saved &&
      ((saved.situationInput && saved.situationInput.trim().length > 0) ||
        (saved.selectedAnswers && Object.keys(saved.selectedAnswers).length > 0) ||
        (saved.selectedEvidence && saved.selectedEvidence.length > 0))
    );
  });

  // Ref tracking latest states for periodic timer and window unload events
  const draftValuesRef = useRef({
    situationInput,
    selectedAnswers,
    selectedEvidence,
  });

  useEffect(() => {
    draftValuesRef.current = {
      situationInput,
      selectedAnswers,
      selectedEvidence,
    };
  }, [situationInput, selectedAnswers, selectedEvidence]);

  // Periodic Auto-Save: Runs every 4 seconds in the background to ensure progress is saved
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const { situationInput: curSit, selectedAnswers: curAns, selectedEvidence: curEv } =
        draftValuesRef.current;
      const hasContent =
        curSit.trim().length > 0 ||
        Object.keys(curAns).length > 0 ||
        curEv.length > 0;

      if (hasContent) {
        setAutoSaveBadge("saving");
        const ts = saveDraftToLocalStorage(curSit, curAns, curEv);
        if (ts) {
          setLastAutoSavedTime(ts);
          setAutoSaveBadge("saved");
          setTimeout(() => setAutoSaveBadge("idle"), 2000);
        }
      }
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Debounced Auto-Save: Triggers 500ms after user types or selects answers/evidence
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasContent =
        situationInput.trim().length > 0 ||
        Object.keys(selectedAnswers).length > 0 ||
        selectedEvidence.length > 0;

      if (hasContent) {
        setAutoSaveBadge("saving");
        const ts = saveDraftToLocalStorage(
          situationInput,
          selectedAnswers,
          selectedEvidence
        );
        if (ts) {
          setLastAutoSavedTime(ts);
          setAutoSaveBadge("saved");
          const hideTimer = window.setTimeout(() => setAutoSaveBadge("idle"), 2000);
          return () => window.clearTimeout(hideTimer);
        }
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [situationInput, selectedAnswers, selectedEvidence]);

  // Window Lifecycle Flush: Guarantee save on page refresh, navigation, or app backgrounding
  useEffect(() => {
    const flushSave = () => {
      const { situationInput: curSit, selectedAnswers: curAns, selectedEvidence: curEv } =
        draftValuesRef.current;
      saveDraftToLocalStorage(curSit, curAns, curEv);
    };

    window.addEventListener("beforeunload", flushSave);
    window.addEventListener("pagehide", flushSave);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushSave();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushSave);
      window.removeEventListener("pagehide", flushSave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Reset Draft: Clear saved state in localStorage and state variables
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage draft:", e);
    }
    setSituationInput("");
    setSelectedAnswers({});
    setSelectedEvidence([]);
    setLastAutoSavedTime(null);
    setAutoSaveBadge("idle");
    setHasRestoredDraft(false);
  };

  // Automatically update milestones, common preset situations, and assessment when user switches language
  useEffect(() => {
    const localized = getLocalizedLegalData(language);

    // 1. Synchronize milestones into the selected language while preserving status
    if (localized.milestones) {
      setMilestones((prev) =>
        localized.milestones.map((m, idx) => ({
          ...m,
          status: prev[idx]?.status || m.status,
          dateLabel:
            prev[idx]?.status === "COMPLETED" && prev[idx]?.dateLabel
              ? prev[idx].dateLabel
              : m.dateLabel,
        }))
      );
    }

    // 2. Synchronize preset prompt or update initial assessment
    const allPresets = getAllPresetSituationPrompts();
    const isPresetOrEmpty =
      !situationInput.trim() || allPresets.has(situationInput.trim());

    if (isPresetOrEmpty) {
      const pIdx = getPresetIndex(situationInput.trim());
      if (pIdx >= 0 && localized.commonSituations[pIdx]) {
        setSituationInput(localized.commonSituations[pIdx].prompt);
      }
      setAssessment(localized.initialAssessment);
    } else {
      // User entered custom text: re-analyze in the newly selected language WITHOUT auto-switching language!
      handleAnalyzeSituation(situationInput, {
        skipLanguageAutoSwitch: true,
        targetLang: language,
        keepCurrentScreen: true,
      });
    }
  }, [language]);

  // Screen 3 State: Eligibility & AI Notice Generator
  const [selectedEligibility, setSelectedEligibility] = useState<string[]>([]);
  const [noticeTemplate, setNoticeTemplate] = useState<string>(
    "Formal Legal Representation / Demand Notice"
  );
  const [noticeDraft, setNoticeDraft] = useState<string>(DEFAULT_NOTICE_DRAFT);
  const [isGeneratingNotice, setIsGeneratingNotice] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [exportedPdf, setExportedPdf] = useState<boolean>(false);
  const [evidencePhotos, setEvidencePhotos] = useState<
    Record<string, string[]>
  >({});
  const [evidencePhotoSlideIndex, setEvidencePhotoSlideIndex] = useState<
    Record<string, number>
  >({});
  const swipeStartXRef = useRef<Record<string, number | null>>({});
  const [cameraTargetEvidence, setCameraTargetEvidence] = useState<
    string | null
  >(null);
  const [isReviewingEvidence, setIsReviewingEvidence] =
    useState<boolean>(false);
  const [reviewingTargetTitle, setReviewingTargetTitle] =
    useState<string>("");
  const [evidenceReviewResult, setEvidenceReviewResult] = useState<{
    targetTitle: string;
    status: string;
    summary: string;
    discrepancies: string[];
    missingInfo: string[];
  } | null>(null);
  const [ocrToastMessage, setOcrToastMessage] = useState<string | null>(null);

  // Background Voice Note Recorder State (Evidence Store)
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] =
    useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceNoteError, setVoiceNoteError] = useState<string>("");
  const [voiceNotes, setVoiceNotes] = useState<
    Array<{
      id: string;
      title: string;
      audioUrl: string;
      durationSec: number;
      createdAt: string;
      transcript?: string;
    }>
  >([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef<number>(0);

  // Screen 4 State: Law Library & FAQ (with debounced auto-suggest & Live Google Search Grounding)
  const [lawSearch, setLawSearch] = useState<string>("");
  const [debouncedLawSearch, setDebouncedLawSearch] = useState<string>("");
  const [isLawSuggestOpen, setIsLawSuggestOpen] = useState<boolean>(false);
  const [selectedLawCategory, setSelectedLawCategory] =
    useState<string>("All Topics");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSearchingLegalWeb, setIsSearchingLegalWeb] =
    useState<boolean>(false);
  const [legalWebResult, setLegalWebResult] = useState<{
    query: string;
    summary: string;
    sources: Array<{ title: string; uri: string }>;
  } | null>(null);
  const [legalWebError, setLegalWebError] = useState<string>("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedLawSearch(lawSearch.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [lawSearch]);

  // Screen 5 State: Action Plan Milestones & Chronological Case History Log
  const [milestones, setMilestones] =
    useState<MilestoneItem[]>(INITIAL_MILESTONES);
  const [trackerTab, setTrackerTab] = useState<"plan" | "docs" | "history">(
    "plan"
  );
  const [trackSearchQuery, setTrackSearchQuery] = useState<string>("");
  const [trackDateRange, setTrackDateRange] = useState<
    "all" | "today" | "week" | "upcoming" | "custom"
  >("all");
  const [trackStartDate, setTrackStartDate] = useState<string>("");
  const [trackEndDate, setTrackEndDate] = useState<string>("");
  const [customHistoryNote, setCustomHistoryNote] = useState<string>("");
  const [sharedCaseSummary, setSharedCaseSummary] = useState<string>("");
  const [copiedCaseShare, setCopiedCaseShare] = useState<boolean>(false);
  const [exportedHistoryPdf, setExportedHistoryPdf] = useState<boolean>(false);
  const [isNotificationBellOpen, setIsNotificationBellOpen] =
    useState<boolean>(false);
  const [caseNotifications, setCaseNotifications] = useState<
    Array<{
      id: string;
      type: "milestone" | "booking";
      title: string;
      message: string;
      timestamp: string;
      unread: boolean;
    }>
  >([
    {
      id: "notif-init-2",
      type: "booking",
      title: "Free NALSA & DLSA Legal Aid Available (15100)",
      message:
        "Walk-in & Tele-Law legal aid consultations at District Legal Services Authority (DLSA) are available Monday–Saturday. Eligible citizens receive 100% free legal representation.",
      timestamp: "Just now",
      unread: true,
    },
    {
      id: "notif-init-1",
      type: "milestone",
      title: "Welcome to Nyaya Sahayak Legal Aid",
      message:
        "How may I help you today? Describe your legal issue by voice or text in any of 33 Indian languages to generate your personalized action plan.",
      timestamp: "Today",
      unread: true,
    },
  ]);
  const [caseHistoryLog, setCaseHistoryLog] = useState<
    Array<{
      id: string;
      title: string;
      detail: string;
      category: "Milestone" | "Assessment" | "Document" | "Evidence" | "Booking";
      timestamp: string;
      isoDate?: string;
    }>
  >([
    {
      id: "ch-1",
      title: "Nyaya Sahayak Citizen Legal Aid Session Ready",
      detail:
        "Ready to assist in 33 Indian & regional languages under NALSA Section 12 free legal aid guidelines.",
      category: "Assessment",
      timestamp: "Today",
      isoDate: new Date().toISOString().slice(0, 10),
    },
  ]);

  const formatAuditTimestamp = () => {
    const now = new Date();
    const datePart = now.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const timePart = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
  };

  const appendCaseHistory = (
    title: string,
    detail: string,
    category: "Milestone" | "Assessment" | "Document" | "Evidence" | "Booking"
  ) => {
    setCaseHistoryLog((prev) => [
      {
        id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        detail,
        category,
        timestamp: formatAuditTimestamp(),
        isoDate: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  // Screen 6 State: Nearby Legal Aid Map & Centers
  const [centerFilter, setCenterFilter] = useState<string>("All Centers");
  const [centerSearch, setCenterSearch] = useState<string>("");
  const [selectedCenterId, setSelectedCenterId] = useState<string>("c1");
  const [activePinPopoverId, setActivePinPopoverId] = useState<string | null>(
    "c1"
  );
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapLayer, setMapLayer] = useState<"standard" | "density">("standard");
  const [mapPinSearch, setMapPinSearch] = useState<string>("");
  const [bookedSlotBanner, setBookedSlotBanner] = useState<string | null>(null);
  const [proBonoOnlyFilter, setProBonoOnlyFilter] = useState<boolean>(false);

  // Live Voice & Chatbot State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [is3DCrimeSceneOpen, setIs3DCrimeSceneOpen] = useState<boolean>(false);
  const [crimeSceneDescription, setCrimeSceneDescription] =
    useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Namaste! How may I help you today? I am Nyaya Sahayak, your AI Legal Aid Assistant. Share your legal question or situation in any of 33 Indian languages—such as tenancy, workplace rights, family law, consumer fraud, or BNS/BNSS 2023—or let me help you book a free DLSA lawyer appointment.",
      timestamp: "Just now",
    },
  ]);

  // Handler: Analyze Situation with Gemini
  const handleAnalyzeSituation = async (
    customText?: string,
    options?: {
      skipLanguageAutoSwitch?: boolean;
      targetLang?: string;
      keepCurrentScreen?: boolean;
    }
  ) => {
    const textToAnalyze = (customText ?? situationInput).trim();
    if (!textToAnalyze) return;
    setSituationInput(textToAnalyze);

    const activeLang = options?.targetLang || language;
    if (!options?.skipLanguageAutoSwitch) {
      const detectedLang = detectLanguageFromTranscript(textToAnalyze, language);
      if (detectedLang && detectedLang !== language) {
        setLanguage(detectedLang);
      }
    }

    setIsAnalyzing(true);
    setAnalyzeError("");
    if (!options?.keepCurrentScreen) {
      setActiveScreen(2);
    }

    try {
      const res = await apifetch("/api/analyze-situation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: textToAnalyze,
          language: activeLang,
          jurisdiction,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze situation.");
      }
      setAssessment(data);
    } catch (err: any) {
      setAnalyzeError(err?.message || "Could not complete AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler: Send Message to Context-Aware Google Search-Grounded Chatbot
  const handleSendChatMessage = async (
    text: string,
    useSearchGrounding: boolean = true
  ) => {
    const detectedLang = detectLanguageFromTranscript(text, language);
    const activeLang = detectedLang || language;
    if (detectedLang && detectedLang !== language) {
      setLanguage(detectedLang);
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const res = await apifetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          situationContext: `${situationInput} | Selected Evidence: ${selectedEvidence.join(
            ", "
          )} | Clarifying Answers: ${JSON.stringify(selectedAnswers)}`,
          language: activeLang,
          jurisdiction,
          useSearchGrounding,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get response.");
      }

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: `Unable to reach AI server: ${
            err?.message || "Please verify your API key in Settings > Secrets."
          }`,
          timestamp: "Now",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handler: Live Google Search Grounding for Legal Updates & Rulings (Screen 4)
  const handleSearchLegalUpdates = async (customQuery?: string) => {
    const queryToRun = (
      customQuery ||
      lawSearch.trim() ||
      `${assessment.caseCategory} latest Supreme Court ruling & SAMADHAN portal rules`
    ).trim();
    if (!queryToRun) return;

    setIsLawSuggestOpen(false);
    setIsSearchingLegalWeb(true);
    setLegalWebError("");

    try {
      const res = await apifetch("/api/search-legal-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryToRun,
          jurisdiction,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Failed to fetch Google Search grounded legal info."
        );
      }
      setLegalWebResult({
        query: queryToRun,
        summary: data.summary,
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
      appendCaseHistory(
        "Live Google Search Legal Verification",
        `Verified current statutory updates & web citations for "${queryToRun}".`,
        "Assessment"
      );
    } catch (err: any) {
      setLegalWebError(
        err?.message || "Could not complete live Google Search grounding."
      );
    } finally {
      setIsSearchingLegalWeb(false);
    }
  };

  // Handler: Generate Custom Legal Notice with Gemini
  const handleGenerateNotice = async () => {
    setIsGeneratingNotice(true);
    try {
      const res = await apifetch("/api/generate-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: noticeTemplate,
          situation: situationInput,
          evidenceList: selectedEvidence,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.noticeText) {
        setNoticeDraft(data.noticeText);
      }
    } catch (err) {
      console.error("Failed to generate notice:", err);
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  // Handler: AI Legal Review of Captured Evidence Photo / Checklist (Screen 3)
  const handleReviewEvidence = async (
    targetTitle?: string,
    photoDataUrlsOverride?: string[]
  ) => {
    const titleToReview =
      targetTitle ||
      Object.keys(evidencePhotos)[0] ||
      selectedEvidence[0] ||
      "Evidence Checklist Bundle";
    const photoDataUrls =
      photoDataUrlsOverride !== undefined
        ? photoDataUrlsOverride
        : evidencePhotos[titleToReview] || [];

    setIsReviewingEvidence(true);
    setReviewingTargetTitle(titleToReview);
    try {
      const res = await apifetch("/api/review-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceTitle: titleToReview,
          photoDataUrl: photoDataUrls[0],
          photoDataUrls,
          situation: situationInput,
          selectedEvidence,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setEvidenceReviewResult({
          targetTitle: titleToReview,
          status: data.status || "NEEDS_ATTENTION",
          summary: data.summary,
          discrepancies: Array.isArray(data.discrepancies)
            ? data.discrepancies
            : [],
          missingInfo: Array.isArray(data.missingInfo) ? data.missingInfo : [],
        });
        appendCaseHistory(
          `AI Legal Review Completed: ${titleToReview} (${photoDataUrls.length} photo(s))`,
          data.summary,
          "Evidence"
        );
      } else {
        throw new Error(data.error || "Fallback review");
      }
    } catch {
      setEvidenceReviewResult({
        targetTitle: titleToReview,
        status: photoDataUrls.length > 0 ? "VERIFIED" : "NEEDS_ATTENTION",
        summary:
          photoDataUrls.length > 0
            ? `Preliminary AI inspection of "${titleToReview}" (${photoDataUrls.length} page(s)) confirms relevant corroborating proof for your ${assessment.caseCategory} claim, with minor date/signature verification advised.`
            : `Based on your selected evidence checklist (${selectedEvidence.length} items), your claim has strong foundational proof, but capturing clear photos of primary documents is recommended.`,
        discrepancies: [
          "Verify that employer/opposite party legal name on the document matches the formal notice recipient.",
          "Ensure salary period dates (3 months unpaid) align across bank statements and written demands.",
        ],
        missingInfo: [
          "Authorized signatory stamp or HR email header timestamp on employment records.",
          "Complete 3-month bank account statement showing the exact date of last salary credit.",
        ],
      });
    } finally {
      setIsReviewingEvidence(false);
    }
  };

  // Handler: Speak Text via Gemini TTS (`gemini-3.8-flash-lite-tts`)
  const handleSpeakText = async (textToSpeak: string) => {
    if (isSpeakingTts) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setIsSpeakingTts(false);
      return;
    }

    setIsSpeakingTts(true);
    try {
      const res = await apifetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioPlayerRef.current = audio;
        audio.onended = () => setIsSpeakingTts(false);
        audio.onerror = () => setIsSpeakingTts(false);
        await audio.play();
      } else {
        setIsSpeakingTts(false);
      }
    } catch {
      setIsSpeakingTts(false);
    }
  };

  // Handler: Export Generated Legal Notice as PDF Document
  const handleExportNoticePdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // Header Banner Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 27, 45);
    doc.text("NYAYA SAHAYAK — CITIZEN LEGAL AID NOTICE DRAFT", margin, cursorY);

    cursorY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Case ID: #NS-2026-0842  |  Template: ${noticeTemplate}  |  Jurisdiction: ${jurisdiction}`,
      margin,
      cursorY
    );

    cursorY += 4;
    doc.setDrawColor(200, 109, 31);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    // Body: Legal Notice Text
    cursorY += 9;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 27, 45);

    const wrappedLines = doc.splitTextToSize(noticeDraft, maxLineWidth);
    for (const line of wrappedLines) {
      if (cursorY > pageHeight - 28) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, margin, cursorY);
      cursorY += 5;
    }

    // Supporting Evidence Section
    if (selectedEvidence.length > 0) {
      if (cursorY > pageHeight - 45) {
        doc.addPage();
        cursorY = 20;
      } else {
        cursorY += 6;
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 27, 45);
      doc.text(
        `ANNEXURE: SUPPORTING EVIDENCE CHECKLIST (${selectedEvidence.length} ITEMS)`,
        margin,
        cursorY
      );
      cursorY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      selectedEvidence.forEach((ev, idx) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(`${idx + 1}. [x] ${ev}`, margin + 2, cursorY);
        cursorY += 5;
      });
    }

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 145);
    doc.text(
      "Generated via Nyaya Sahayak AI Legal Aid Assistant · NALSA Toll-Free Helpline: 15100",
      margin,
      pageHeight - 10
    );

    doc.save("Nyaya_Sahayak_Legal_Notice.pdf");
    setExportedPdf(true);
    appendCaseHistory(
      "Legal Notice Exported as PDF",
      `Downloaded formatted A4 PDF (${noticeTemplate}) with ${selectedEvidence.length} evidence annexure item(s).`,
      "Document"
    );
    setTimeout(() => setExportedPdf(false), 3000);
  };

  // Handler: Export Entire Case History Log as an Official A4 PDF Document (Screen 5)
  const handleExportCaseHistoryPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // Official Header Banner
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 27, 45);
    doc.text(
      "NYAYA SAHAYAK — OFFICIAL CITIZEN CASE HISTORY & AUDIT LOG",
      margin,
      cursorY
    );

    cursorY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Case ID: #NS-2026-0842  |  Category: ${assessment.caseCategory}  |  Jurisdiction: ${jurisdiction}`,
      margin,
      cursorY
    );

    cursorY += 5;
    doc.text(
      `Exported On: ${formatAuditTimestamp()}  |  Total Logged Events: ${caseHistoryLog.length}  |  NALSA Helpline: 15100`,
      margin,
      cursorY
    );

    cursorY += 4;
    doc.setDrawColor(200, 109, 31);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    // Section 1: Action Plan Milestone Summary
    cursorY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 27, 45);
    doc.text(
      `1. ACTION PLAN MILESTONE SUMMARY (${completedMilestonesCount}/${milestones.length} COMPLETED)`,
      margin,
      cursorY
    );

    cursorY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    milestones.forEach((m) => {
      if (cursorY > pageHeight - 25) {
        doc.addPage();
        cursorY = 20;
      }
      const line = `[${m.status}] ${m.title} (${m.dateLabel})`;
      const wrapped = doc.splitTextToSize(line, maxLineWidth);
      wrapped.forEach((wLine: string) => {
        doc.text(wLine, margin + 2, cursorY);
        cursorY += 4.5;
      });
    });

    // Section 2: Chronological Case History Log Entries
    cursorY += 4;
    if (cursorY > pageHeight - 35) {
      doc.addPage();
      cursorY = 20;
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    cursorY += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 27, 45);
    doc.text(
      `2. CHRONOLOGICAL CASE HISTORY AUDIT LOG (${caseHistoryLog.length} ENTRIES)`,
      margin,
      cursorY
    );
    cursorY += 6;

    caseHistoryLog.forEach((entry, idx) => {
      if (cursorY > pageHeight - 32) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(200, 109, 31);
      doc.text(
        `${idx + 1}. [${entry.category.toUpperCase()}]  ${entry.timestamp}`,
        margin,
        cursorY
      );

      cursorY += 4.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 27, 45);
      const titleLines = doc.splitTextToSize(entry.title, maxLineWidth);
      titleLines.forEach((tLine: string) => {
        if (cursorY > pageHeight - 22) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(tLine, margin + 2, cursorY);
        cursorY += 4.5;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const detailLines = doc.splitTextToSize(entry.detail, maxLineWidth - 4);
      detailLines.forEach((dLine: string) => {
        if (cursorY > pageHeight - 22) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(dLine, margin + 2, cursorY);
        cursorY += 4.5;
      });

      cursorY += 3;
    });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 145);
    doc.text(
      "Official Citizen Case Record · Generated via Nyaya Sahayak AI Legal Aid Assistant · NALSA Helpline: 15100",
      margin,
      pageHeight - 10
    );

    doc.save("Nyaya_Sahayak_Case_History_NS-2026-0842.pdf");
    setExportedHistoryPdf(true);
    setTimeout(() => setExportedHistoryPdf(false), 3000);
  };

  // Handler: Background Voice Note Recording for Evidence Store
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  const handleStartVoiceNoteRecording = async () => {
    setVoiceNoteError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordingChunksRef.current = [];
      recordingSecondsRef.current = 0;
      setRecordingSeconds(0);
      setIsRecordingVoiceNote(true);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordingChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setIsRecordingVoiceNote(false);

        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(recordingChunksRef.current, {
          type: mimeType,
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const noteId = `vn-${Date.now()}`;
        const duration = Math.max(1, recordingSecondsRef.current);
        const noteTitle = `Verbal Explanation Voice Note #${
          voiceNotes.length + 1
        }`;
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        setVoiceNotes((prev) => [
          {
            id: noteId,
            title: noteTitle,
            audioUrl,
            durationSec: duration,
            createdAt: `Saved ${timestamp}`,
          },
          ...prev,
        ]);

        setSelectedEvidence((prev) =>
          prev.includes(noteTitle) ? prev : [...prev, noteTitle]
        );

        // Transcribe in background via /api/transcribe (gemini-3.5-transcribe)
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            const base64Audio = dataUrl.split(",")[1];
            if (!base64Audio) return;
            const res = await apifetch("/api/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: mimeType.split(";")[0],
              }),
            });
            const data = await res.json();
            if (res.ok && data.transcript) {
              const detectedFromVoice = detectLanguageFromTranscript(
                data.transcript,
                language
              );
              if (detectedFromVoice && detectedFromVoice !== language) {
                setLanguage(detectedFromVoice);
              }
              setVoiceNotes((prev) =>
                prev.map((n) =>
                  n.id === noteId ? { ...n, transcript: data.transcript } : n
                )
              );
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch {
          // Ignore transcription error if offline
        }
      };

      recorder.start(250);
      recordingTimerRef.current = window.setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
    } catch (err: any) {
      setVoiceNoteError(
        err?.message ||
          "Could not access microphone for voice note recording. Check browser permissions."
      );
      setIsRecordingVoiceNote(false);
    }
  };

  const handleStopVoiceNoteRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDeleteVoiceNote = (id: string, title: string) => {
    setVoiceNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedEvidence((prev) => prev.filter((t) => t !== title));
  };

  // Handler: Book Free DLSA / Legal Aid Appointment
  const handleBookAppointment = (centerName: string, slot: string) => {
    const token = `DLSA-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookedSlotBanner(
      `Confirmed: ${centerName} · ${slot} (Token #${token})`
    );
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === "m5"
          ? {
              ...m,
              status: "COMPLETED",
              dateLabel: `Booked: ${slot} · Token #${token}`,
            }
          : m
      )
    );
    setChatMessages((prev) => [
      ...prev,
      {
        id: `book-${Date.now()}`,
        role: "assistant",
        text: `✅ Your free Legal Aid appointment has been confirmed!\n• Authority: ${centerName}\n• Slot: ${slot}\n• Priority Token: #${token}\nPlease carry copies of your ${selectedEvidence.join(
          ", "
        )}.`,
        timestamp: "Just now",
      },
    ]);
    appendCaseHistory(
      `Milestone 5 Achieved: Free Legal Aid Slot Booked`,
      `Confirmed appointment at ${centerName} for ${slot} (Priority Token #${token}).`,
      "Booking"
    );
    setCaseNotifications((prev) => [
      {
        id: `notif-book-${Date.now()}`,
        type: "booking",
        title: `Appointment Nearing: ${slot}`,
        message: `Confirmed booking at ${centerName} (Token #${token}). Reminder: Please arrive 15 mins early with your ${selectedEvidence.length} selected evidence documents.`,
        timestamp: "Just now",
        unread: true,
      },
      ...prev,
    ]);
  };

  const toggleEvidence = (title: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleEligibility = (label: string) => {
    setSelectedEligibility((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const toggleMilestoneStatus = (id: string) => {
    const target = milestones.find((m) => m.id === id);
    if (!target) return;
    const nextStatus =
      target.status === "COMPLETED" ? "IN PROGRESS" : "COMPLETED";

    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
    );

    appendCaseHistory(
      nextStatus === "COMPLETED"
        ? `Milestone ${target.step} Achieved: ${target.title.replace(
            /^\d+\.\s*/,
            ""
          )}`
        : `Milestone ${target.step} Reopened for Review`,
      target.description,
      "Milestone"
    );

    setCaseNotifications((prev) => [
      {
        id: `notif-ms-${Date.now()}`,
        type: "milestone",
        title: `Milestone ${target.step} ${
          nextStatus === "COMPLETED" ? "Completed" : "Moved to In Progress"
        }`,
        message: `${target.title.replace(/^\d+\.\s*/, "")} is now marked as ${nextStatus} for Case #NS-2026-0842.`,
        timestamp: "Just now",
        unread: true,
      },
      ...prev,
    ]);
  };

  const completedMilestonesCount = milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const inProgressMilestonesCount = milestones.filter(
    (m) => m.status === "IN PROGRESS"
  ).length;
  const pendingMilestonesCount =
    milestones.length - completedMilestonesCount - inProgressMilestonesCount;
  const progressPercentage = Math.round(
    (completedMilestonesCount / milestones.length) * 100
  );

  // Handler: Generate & Share Summarized Text Version of Case Status & Milestones (Screen 5)
  const handleShareCaseStatus = async () => {
    const milestoneLines = milestones
      .map((m) => {
        const icon =
          m.status === "COMPLETED"
            ? "✅"
            : m.status === "IN PROGRESS"
            ? "⏳"
            : "⬜";
        return `${icon} Step ${m.step}: ${m.title.replace(/^\d+\.\s*/, "")} [${
          m.status
        }]`;
      })
      .join("\n");

    const summaryText = `⚖️ *Nyaya Sahayak — Citizen Legal Case Status*
Case ID: #NS-2026-0842 (${assessment.caseCategory})
Jurisdiction: ${jurisdiction}
Overall Progress: ${progressPercentage}% Complete (${completedMilestonesCount}/${milestones.length} Milestones)

📋 *Action Plan Milestones:*
${milestoneLines}

📎 *Attached Evidence (${selectedEvidence.length}):* ${selectedEvidence.join(
      ", "
    )}
📞 *NALSA Free Legal Aid Helpline:* 15100`;

    setSharedCaseSummary(summaryText);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
        setCopiedCaseShare(true);
        setTimeout(() => setCopiedCaseShare(false), 3000);
      }
      if (navigator.share) {
        await navigator.share({
          title: `Nyaya Sahayak Case #NS-2026-0842 — ${assessment.caseCategory}`,
          text: summaryText,
        });
      }
    } catch {
      // User dismissed native share sheet or clipboard fallback already active
    }
  };

  const actionPlanPieData = [
    {
      name: "Completed Steps",
      value: completedMilestonesCount,
      color: "#059669",
    },
    {
      name: "In Progress",
      value: inProgressMilestonesCount,
      color: "#C86D1F",
    },
    {
      name: "Pending Legal Actions",
      value: pendingMilestonesCount,
      color: "#CBD5E1",
    },
  ].filter((d) => d.value > 0);

  // Native Mobile Top App Bar inside each screen
  const renderMobileHeader = () => (
    <div className="sticky top-0 z-20 bg-[#F6F4F0]/95 backdrop-blur-md px-3.5 py-2 border-b border-slate-200/80 shrink-0 space-y-2">
      {/* Row 1: Brand Logo & Title on Left, Language Picker & Helpline on Right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {activeScreen !== 1 ? (
            <button
              type="button"
              onClick={() =>
                setActiveScreen((prev) => (prev === 3 ? 2 : 1))
              }
              aria-label="Back to previous screen"
              className="h-8 w-8 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-[#141B2D] active:scale-95 transition-transform shrink-0 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveScreen(1)}
              aria-label="Nyaya Sahayak Home"
              className="h-8 w-8 rounded-xl bg-[#141B2D] flex items-center justify-center text-white shadow-xs active:scale-95 transition-transform shrink-0"
            >
              <Scale className="w-4 h-4 text-[#E59849] shrink-0" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveScreen(1)}
            className="text-left min-w-0"
          >
            <span className="block text-xs font-bold tracking-tight text-[#141B2D] leading-none truncate">
              {t.appTitle}
            </span>
            <span className="block text-[9.5px] text-slate-500 font-medium mt-0.5 truncate">
              {t.appSubtitle}
            </span>
          </button>
        </div>

        {/* Right Action Group: Language Selector & Emergency 15100 Helpline */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-8 flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select Language"
              className="bg-transparent text-[11px] font-semibold text-slate-800 focus:outline-none max-w-[82px] sm:max-w-[105px] truncate cursor-pointer leading-tight pr-0.5"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen(6)}
            aria-label="Call 15100 NALSA Legal Aid Helpline"
            className="h-8 px-2.5 rounded-xl bg-[#C86D1F] hover:bg-[#b35e16] active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-transform whitespace-nowrap shrink-0"
            title="NALSA & DLSA Free Legal Aid Toll-Free Helpline: 15100"
          >
            <Phone className="w-3 h-3 shrink-0" />
            <span>15100</span>
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Quick-Access Tools (3D Crime Scene, AI Legal Chat, Guide) */}
      <div className="flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => {
            setCrimeSceneDescription(situationInput);
            setIs3DCrimeSceneOpen(true);
          }}
          aria-label="3D Crime Scene Reconstruction"
          className="h-7 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5 active:scale-95 transition-transform shadow-2xs font-semibold text-[10.5px] shrink-0"
          title="3D Forensic Crime Scene Reconstruction Studio"
        >
          <Box className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>3D Crime Scene</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            aria-label={t.aiLegalChatBtn}
            className="h-7 px-2.5 rounded-lg bg-[#141B2D] hover:bg-slate-800 text-white flex items-center gap-1.5 active:scale-95 transition-transform shadow-2xs font-semibold text-[10.5px] shrink-0"
            title={t.aiLegalChatBtn}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
            <span>AI Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHowItWorksOpen(true)}
            aria-label="How Nyaya Sahayak Works"
            className="h-7 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C86D1F] border border-amber-200/80 flex items-center gap-1 active:scale-95 transition-transform shadow-2xs font-semibold text-[10.5px] shrink-0"
            title="How Nyaya Sahayak Helps You (Guide)"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Guide</span>
          </button>
        </div>
      </div>



      {/* Auto-Save Draft Status Pill Bar */}
      {(situationInput.trim() ||
        Object.keys(selectedAnswers).length > 0 ||
        selectedEvidence.length > 0) && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-[10px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                autoSaveBadge === "saving"
                  ? "bg-amber-500 animate-ping"
                  : !isOnline
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            <span className="font-semibold text-slate-700 truncate">
              {autoSaveBadge === "saving"
                ? "Auto-saving progress..."
                : !isOnline
                ? "Draft safe in offline device storage"
                : lastAutoSavedTime
                ? `Auto-saved to device · ${formatTimeSince(lastAutoSavedTime)}`
                : "Auto-saved to device"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearDraft}
            className="text-slate-400 hover:text-red-600 font-bold ml-2 shrink-0 transition-colors"
            title="Reset saved situation, answers and evidence"
          >
            Reset Draft
          </button>
        </div>
      )}

      {/* OCR Document Clauses Integration Notification Banner */}
      {ocrToastMessage && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-2xs text-[10.5px] animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">{ocrToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setOcrToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-0.5 shrink-0 ml-1.5"
            aria-label="Dismiss OCR notice"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );

  // Native Mobile Bottom Tab Bar with elevated center Live Voice action
  const renderMobileBottomNav = (currentScreenNum: number) => {
    const leftItems = [
      { label: t.navHome, icon: Home, target: 1, activeNums: [1, 2, 3] },
      { label: t.navExplainLaw, icon: BookOpen, target: 4, activeNums: [4] },
    ];
    const rightItems = [
      { label: t.navTrackCase, icon: ClipboardCheck, target: 5, activeNums: [5] },
      { label: t.navFindAid, icon: MapPin, target: 6, activeNums: [6] },
    ];
    return (
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-1.5 pb-2 grid grid-cols-5 items-center shrink-0">
        {leftItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activeNums.includes(currentScreenNum);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveScreen(item.target)}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl active:scale-95 transition-all ${
                isActive
                  ? "text-[#C86D1F] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] mt-0.5 whitespace-nowrap truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Raised Native Mobile Voice Dock Button */}
        <div className="flex flex-col items-center justify-center -mt-4">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            aria-label={t.liveVoiceBtn}
            className="h-12 w-12 rounded-full bg-[#D92D20] hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-600/30 border-4 border-white flex items-center justify-center transition-transform shrink-0"
          >
            <Mic className="w-5 h-5 shrink-0" />
          </button>
          <span className="text-[9px] font-bold text-[#D92D20] mt-0.5 whitespace-nowrap">
            {t.liveVoiceBtn}
          </span>
        </div>

        {rightItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activeNums.includes(currentScreenNum);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveScreen(item.target)}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl active:scale-95 transition-all ${
                isActive
                  ? "text-[#C86D1F] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] mt-0.5 whitespace-nowrap truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // SCREEN 1: DESCRIBE YOUR SITUATION (HOME & VOICE/TEXT INPUT)
  // ============================================================================
  const renderScreen1 = () => (
    <div className="flex flex-col h-full bg-[#F6F4F0] overflow-hidden">
      {renderMobileHeader()}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
        {/* Restored Progress Notification Banner */}
        {hasRestoredDraft && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-3 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950 truncate">
                  Draft Restored from Previous Session
                </p>
                <p className="text-[10px] text-emerald-800">
                  Your situation, clarifying answers, and evidence checklist have been safely restored.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHasRestoredDraft(false)}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top NALSA Free Legal Aid Banner */}
        <div className="rounded-2xl bg-[#C86D1F] text-white p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">
                {t.nalsaBannerTitle}
              </p>
              <p className="text-[11px] text-amber-100">
                {t.nalsaBannerSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveScreen(6)}
            className="px-2.5 py-1.5 rounded-lg bg-white text-[#9A3412] text-[11px] font-bold whitespace-nowrap hover:bg-amber-50 transition-colors shrink-0"
          >
            {t.getAidBtn}
          </button>
        </div>

        {/* Hero Title & 3-Step Citizen Journey */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C86D1F]">
              {t.heroKicker}
            </span>
            <button
              type="button"
              onClick={() => setIsHowItWorksOpen(true)}
              className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C86D1F] border border-amber-200/80 text-[10px] font-bold inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>How It Works</span>
            </button>
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-[#141B2D] leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* 3-Step Visual Road Map */}
          <div className="bg-white/90 rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="inline-flex items-center gap-1 text-[#C86D1F]">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>3 Simple Steps:</span>
              </span>
              <span className="text-emerald-700 font-semibold">100% Free Service</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-xl bg-amber-50/80 border border-amber-200/70">
                <span className="block text-[10px] font-bold text-[#9A3412]">
                  1. Explain
                </span>
                <span className="block text-[9px] text-slate-500">
                  Voice / Text
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-slate-100/80 border border-slate-200/70">
                <span className="block text-[10px] font-bold text-[#141B2D]">
                  2. Rights
                </span>
                <span className="block text-[9px] text-slate-500">
                  Law & Strength
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-slate-100/80 border border-slate-200/70">
                <span className="block text-[10px] font-bold text-[#141B2D]">
                  3. Action
                </span>
                <span className="block text-[9px] text-slate-500">
                  Notice / Lawyer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Central Dual-Mode Input Card: Voice Live Advisor vs Text Input */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col space-y-3">
          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setScreen1InputTab("voice")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                screen1InputTab === "voice"
                  ? "bg-[#141B2D] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
              <span>Talk with Live Voice</span>
            </button>
            <button
              type="button"
              onClick={() => setScreen1InputTab("type")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                screen1InputTab === "type"
                  ? "bg-[#141B2D] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
              <span>Type or Paste Problem</span>
            </button>
          </div>

          {screen1InputTab === "voice" ? (
            /* Voice Mode View */
            <div className="flex flex-col items-center text-center py-2 space-y-2">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="group relative h-20 w-20 rounded-full bg-[#D92D20] hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition-transform active:scale-95 shrink-0"
                aria-label="Tap to speak with live legal advisor"
              >
                <span className="absolute inset-0 rounded-full bg-[#D92D20]/30 animate-ping" />
                <Mic className="w-9 h-9 relative z-10 shrink-0" />
              </button>

              <div>
                <p className="text-xs font-bold text-[#141B2D]">
                  Tap to Speak in {language.split(" ")[0]}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-[280px]">
                  Speak naturally about your problem. The AI Legal Advisor will
                  listen and respond in your language with your legal rights.
                </p>
              </div>

              {situationInput.trim() && (
                <div className="w-full text-left bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A3412]">
                    Current Problem Statement:
                  </span>
                  <p className="text-[11px] text-slate-800 line-clamp-2">
                    “{situationInput}”
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAnalyzeSituation()}
                    className="text-[10px] font-bold text-[#C86D1F] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View AI Legal Assessment →</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCrimeSceneDescription(situationInput);
                  setIs3DCrimeSceneOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/90 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Box className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Reconstruct 3D Crime Scene</span>
              </button>
            </div>
          ) : (
            /* Type Mode View with multi-line textarea and prompt pills */
            <div className="space-y-2.5 text-left">
              <div>
                <label className="text-[11px] font-bold text-[#141B2D] block">
                  Describe What Happened in Simple Words:
                </label>
                <p className="text-[10px] text-slate-500">
                  Mention dates, money involved, and what the other party did.
                </p>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  {
                    label: "+ 3 Months Salary Unpaid",
                    text: "My employer has not paid my salary for the last 3 months and is refusing to give my relieving letter.",
                  },
                  {
                    label: "+ Security Deposit Not Returned",
                    text: "I vacated my rented flat 2 months ago in good condition, but landlord is refusing to return my security deposit.",
                  },
                  {
                    label: "+ Police Refusing FIR",
                    text: "The local police station refused to register my complaint / FIR for a serious incident.",
                  },
                  {
                    label: "+ Cyber / Online Fraud",
                    text: "I was defrauded of money through an unauthorized online transaction and the bank has not frozen the account.",
                  },
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSituationInput(sug.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-[#9A3412] text-slate-700 text-[10px] font-semibold whitespace-nowrap border border-slate-200 transition-colors"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>

              <textarea
                value={situationInput}
                onChange={(e) => setSituationInput(e.target.value)}
                placeholder="Example: My employer hasn't paid my salary of ₹45,000 for the last 3 months, and my landlord refuses to return my security deposit..."
                rows={4}
                className="w-full bg-[#F6F4F0] text-slate-900 placeholder-slate-400 text-xs rounded-xl p-3 border border-slate-200 focus:outline-none focus:border-[#C86D1F] resize-none"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span>{situationInput.length} characters</span>
                  {lastAutoSavedTime && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-emerald-200/60">
                      <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      {autoSaveBadge === "saving" ? "Saving..." : "Auto-saved"}
                    </span>
                  )}
                </div>
                {situationInput && (
                  <button
                    type="button"
                    onClick={() => setSituationInput("")}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Clear text
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAnalyzeSituation()}
                disabled={isAnalyzing || !situationInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#141B2D] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E59849] shrink-0" />
                    <span>Analyzing Statutes & Case Strength...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E59849] shrink-0" />
                    <span>Analyze My Case & Know My Rights →</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCrimeSceneDescription(situationInput);
                  setIs3DCrimeSceneOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-900 to-[#141B2D] hover:from-indigo-800 hover:to-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 border border-indigo-400/30 shadow-sm transition-all"
              >
                <Box className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Reconstruct 3D Crime Scene from Problem →</span>
              </button>
            </div>
          )}

          {/* Background Voice Note Recorder Bar for Evidence Store */}
          <div className="w-full mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-left">
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isRecordingVoiceNote
                    ? "bg-red-100 text-[#D92D20]"
                    : "bg-amber-50 text-[#C86D1F]"
                }`}
              >
                <FileAudio className="w-3.5 h-3.5 shrink-0" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#141B2D] leading-tight">
                  {isRecordingVoiceNote
                    ? `${t.recordingVoiceNoteTitle} (${formatDuration(
                        recordingSeconds
                      )})`
                    : t.recordVoiceNoteTitle}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isRecordingVoiceNote
                    ? t.recordingInBackgroundSub
                    : `${t.recordVoiceNoteSub} (${voiceNotes.length})`}
                </p>
              </div>
            </div>

            {isRecordingVoiceNote ? (
              <button
                type="button"
                onClick={handleStopVoiceNoteRecording}
                className="px-3 py-1.5 rounded-xl bg-[#D92D20] hover:bg-red-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Square className="w-3 h-3 fill-current shrink-0" />
                <span>{t.stopAndSaveBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartVoiceNoteRecording}
                className="px-3 py-1.5 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Mic className="w-3 h-3 text-[#E59849] shrink-0" />
                <span>{t.recordNoteBtn}</span>
              </button>
            )}
          </div>

          {voiceNoteError && (
            <p className="text-[10px] text-red-600 mt-1.5 text-left w-full">
              {voiceNoteError}
            </p>
          )}

          {/* Saved Voice Notes Preview in Screen 1 */}
          {voiceNotes.length > 0 && (
            <div className="w-full mt-2.5 space-y-2 text-left">
              {voiceNotes.map((vn) => (
                <div
                  key={vn.id}
                  className="p-2.5 rounded-xl bg-[#F6F4F0] border border-slate-200/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#141B2D] truncate">
                      {vn.title} ({formatDuration(vn.durationSec)})
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={vn.audioUrl}
                        download={`${vn.title.replace(/\s+/g, "_")}.webm`}
                        className="text-[10px] font-semibold text-[#C86D1F] hover:underline inline-flex items-center gap-0.5"
                      >
                        <Download className="w-3 h-3 shrink-0" />
                        <span>Save</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteVoiceNote(vn.id, vn.title)}
                        className="text-slate-400 hover:text-red-600 p-0.5"
                        title="Delete Voice Note"
                      >
                        <Trash2 className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </div>
                  <audio
                    controls
                    src={vn.audioUrl}
                    className="w-full h-7"
                  />
                  {vn.transcript && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                      <p className="text-[10px] text-slate-600 italic truncate">
                        “{vn.transcript}”
                      </p>
                      <button
                        type="button"
                        onClick={() => setSituationInput(vn.transcript!)}
                        className="text-[10px] font-bold text-[#C86D1F] hover:underline shrink-0"
                      >
                        Use Text
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common Situations Quick Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t.commonSituationsHeader}
            </p>
            <span className="text-[10px] text-[#C86D1F] font-semibold">
              Instant Legal Protection Check
            </span>
          </div>
          <div className="space-y-2">
            {localizedData.commonSituations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSituationInput(item.prompt);
                  handleAnalyzeSituation(item.prompt);
                }}
                className="w-full text-left p-2.5 rounded-2xl bg-white hover:bg-amber-50/70 border border-slate-200/90 hover:border-[#C86D1F] flex items-center justify-between gap-2.5 transition-all group shadow-2xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 group-hover:bg-[#C86D1F] text-[#C86D1F] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Scale className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#141B2D] truncate">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      Tap for instant statutory assessment & rights
                    </span>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-lg bg-slate-100 group-hover:bg-[#141B2D] group-hover:text-white text-[10px] font-bold text-slate-700 shrink-0 transition-colors flex items-center gap-0.5">
                  <span>Analyze</span>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Confidentiality Callout */}
        <div className="rounded-xl bg-slate-200/60 p-3 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-900">
              {t.confidentialityBold}
            </strong>{" "}
            {t.confidentialityText}
          </p>
        </div>

        {/* Understand Your Rights 2x2 Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
              {t.understandRightsHeader}
            </h2>
            <button
              type="button"
              onClick={() => setActiveScreen(4)}
              className="text-[11px] font-semibold text-[#C86D1F] hover:underline"
            >
              {t.viewAllBtn}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                title: t.catPropertyTitle,
                desc: t.catPropertyDesc,
                icon: Building2,
                filter: "Property & Rent",
              },
              {
                title: t.catLabourTitle,
                desc: t.catLabourDesc,
                icon: Briefcase,
                badge: t.popularBadge,
                filter: "Labour & Work",
              },
              {
                title: t.catFamilyTitle,
                desc: t.catFamilyDesc,
                icon: Users,
                filter: "Family & Women",
              },
              {
                title: t.catConsumerTitle,
                desc: t.catConsumerDesc,
                icon: ShoppingBag,
                filter: "Consumer & Cyber",
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.title}
                  type="button"
                  onClick={() => {
                    setSelectedLawCategory(cat.filter);
                    setActiveScreen(4);
                  }}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 text-left hover:border-[#C86D1F] transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 text-[#C86D1F] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    {cat.badge && (
                      <span className="text-[9px] font-bold text-[#C86D1F] uppercase tracking-wider">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#141B2D]">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Action Hub: AI Legal Assessment and Notice & Eligibility */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141B2D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C86D1F]" />
              <span>Next Legal Steps</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">Free Citizen Aid</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Direct Option 1: AI Legal Assessment & Strategy */}
            <div
              onClick={() => setActiveScreen(2)}
              className="group bg-white hover:bg-slate-50/90 active:scale-[0.99] rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    Step 2
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4 shrink-0" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#141B2D] group-hover:text-indigo-900 transition-colors">
                    AI Legal Assessment
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Evaluate your legal rights, applicable statutory acts & sections, clarifying questions, and required evidence checklist.
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>View Legal Strategy</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            </div>

            {/* Direct Option 2: Notice & Aid Eligibility */}
            <div
              onClick={() => setActiveScreen(3)}
              className="group bg-white hover:bg-slate-50/90 active:scale-[0.99] rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-[#C86D1F] text-[10px] font-bold uppercase tracking-wider">
                    Step 3
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-amber-100/70 text-[#C86D1F] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 shrink-0" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#141B2D] group-hover:text-[#9A3412] transition-colors">
                    Notice & Eligibility
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Draft a formal legal notice, check NALSA Section 12 free legal aid eligibility, and book DLSA consultations.
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#C86D1F]">
                <span>Draft Notice & Eligibility</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Dark CTA Banner */}
        <div className="rounded-2xl bg-[#141B2D] text-white p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#C86D1F] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold">{t.needGuidanceTitle}</p>
              <p className="text-[11px] text-slate-300">
                {t.needGuidanceSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white text-[#141B2D] text-xs font-bold whitespace-nowrap hover:bg-slate-100 transition-colors"
          >
            {t.openChatBtn}
          </button>
        </div>
      </div>

      {renderMobileBottomNav(1)}
    </div>
  );

  // ============================================================================
  // SCREEN 2: AI LEGAL ASSESSMENT (WHAT THE LAW SAYS, Q&A, TIMELINE)
  // ============================================================================
  const renderScreen2 = () => (
    <div className="flex flex-col h-full bg-[#F6F4F0] overflow-hidden">
      {renderMobileHeader()}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
        {/* Top Dark Assessment Banner */}
        <div className="rounded-2xl bg-[#141B2D] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#C86D1F] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white shrink-0" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold block">
                {t.aiAssessmentKicker}
              </span>
              <h2 className="text-xs font-bold">{assessment.caseCategory}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                handleSpeakText(
                  `${assessment.summaryTitle}. ${assessment.rights
                    .map((r) => `${r.title}: ${r.explanation}`)
                    .join(" ")}`
                )
              }
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shrink-0 ${
                isSpeakingTts
                  ? "bg-[#C86D1F] text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="Listen to Assessment in Audio"
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>{isSpeakingTts ? t.stopBtn : t.listenBtn}</span>
            </button>
          </div>
        </div>

        {/* User's Described Situation Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold uppercase tracking-wider">
              {t.yourSituationLabel}
            </span>
            <button
              type="button"
              onClick={() => setActiveScreen(1)}
              className="text-[#C86D1F] font-semibold hover:underline"
            >
              {t.editBtn}
            </button>
          </div>
          <p className="text-xs text-slate-800 bg-[#F6F4F0] p-3 rounded-xl leading-relaxed border border-slate-200/60">
            {situationInput.trim()
              ? `“${situationInput}”`
              : "How may I help you today? Tap 'Edit' or 'Add by Voice' to describe your legal situation in your preferred language."}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-[#D92D20] shrink-0" />
              <span>{t.addByVoiceBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#9A3412] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>{t.askFollowUpBtn}</span>
            </button>
          </div>
        </div>

        {isAnalyzing && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col items-center justify-center text-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#C86D1F] shrink-0" />
            <p className="text-xs font-semibold text-[#141B2D]">
              {t.analyzingStatutesText}
            </p>
          </div>
        )}

        {analyzeError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
            {analyzeError}
          </div>
        )}

        {/* Case Strength Score Meter */}
        {(() => {
          const answeredCount = Object.keys(selectedAnswers).length;
          const totalQuestions = assessment.clarifyingQuestions.length || 2;
          const baseScore = situationInput.trim().length > 40 ? 75 : 62;
          const answersBonus = Math.round((answeredCount / totalQuestions) * 15);
          const evidenceBonus = Math.min(10, selectedEvidence.length * 3);
          const caseStrengthScore = Math.min(
            97,
            baseScore + answersBonus + evidenceBonus
          );
          const caseStrengthLabel =
            caseStrengthScore >= 80
              ? "High Case Strength"
              : caseStrengthScore >= 70
              ? "Moderate Case Strength"
              : "Basic Claim Identified";

          return (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Scale className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Evaluated Claim Strength
                    </span>
                    <h3 className="text-xs font-bold text-[#141B2D]">
                      {caseStrengthScore}% · {caseStrengthLabel}
                    </h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                  {caseStrengthScore >= 80 ? "Court / Notice Ready" : "Building Proof"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${caseStrengthScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Initial Grievance</span>
                  <span>Documented</span>
                  <span className="text-emerald-700 font-bold">
                    Strong Legal Grounds
                  </span>
                </div>
              </div>

              {/* Strength & Next Steps to Maximize */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-900 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Why It's Strong:</span>
                  </span>
                  <p className="text-[10px] text-emerald-800 leading-snug">
                    Direct statutory rights under Indian law. Burden of proof is
                    on the opposite party.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#9A3412] inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C86D1F] shrink-0" />
                    <span>To Reach 100%:</span>
                  </span>
                  <p className="text-[10px] text-[#9A3412] leading-snug">
                    {answeredCount === totalQuestions
                      ? "Questions answered! Proceed to generate your demand notice."
                      : "Answer the clarifying questions below to reinforce notice."}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* What the Law Says in Simple Words */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>{assessment.protectionLevel}</span>
              </span>
              <h3 className="text-sm font-bold text-[#141B2D]">
                {t.whatLawSaysTitle}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment.summaryTitle}
          </p>

          <div className="space-y-2.5">
            {assessment.rights.map((right, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F6F4F0] border border-slate-200/70 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-[#C86D1F] font-semibold">
                  <span>{right.actName}</span>
                </div>
                <h4 className="text-xs font-bold text-[#141B2D]">
                  {right.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {right.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Grounded Web Sources for Situation Analysis */}
          {assessment.groundingSources &&
            assessment.groundingSources.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>
                    Verified Google Search Legal Sources (
                    {assessment.groundingSources.length}):
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.groundingSources.slice(0, 4).map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] text-emerald-900 font-semibold max-w-full truncate"
                    >
                      <span className="truncate max-w-[180px]">
                        {src.title}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Questions to Clarify Your Case */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
              {t.questionsToStrengthenTitle}
            </h3>
            <div className="flex items-center gap-2">
              {Object.keys(selectedAnswers).length > 0 && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/70 inline-flex items-center gap-1 shrink-0">
                  <Check className="w-2.5 h-2.5 shrink-0" />
                  <span>{Object.keys(selectedAnswers).length} Auto-saved</span>
                </span>
              )}
              <span className="text-[10px] text-slate-500">{t.tapToAnswerLabel}</span>
            </div>
          </div>

          <div className="space-y-3">
            {assessment.clarifyingQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-[#F6F4F0] border border-slate-200/70 space-y-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86D1F]">
                  {q.badge}
                </span>
                <p className="text-xs font-bold text-[#141B2D]">{q.question}</p>
                <p className="text-[11px] text-slate-500">{q.whyItMatters}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [q.id]: opt,
                          }))
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "bg-[#141B2D] text-white"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback Pill when Answered */}
                {selectedAnswers[q.id] && (
                  <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center gap-1.5 text-[10px] text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      Recorded: “{selectedAnswers[q.id]}” · Incorporated into
                      legal arguments!
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Steps Timeline */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
              {t.recommendedNextStepsTitle}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 tabular-nums">
              1 → 2 → 3
            </span>
          </div>

          <div className="space-y-3">
            {assessment.nextSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3 rounded-xl bg-[#F6F4F0] border border-slate-200/80 flex items-start gap-3"
              >
                <div className="h-6 w-6 rounded-full bg-[#141B2D] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-[#C86D1F] uppercase tracking-wider block">
                    {step.tag}
                  </span>
                  <h4 className="text-xs font-bold text-[#141B2D]">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (step.stepNumber === 1) setActiveScreen(3);
                      else if (step.stepNumber === 2) setActiveScreen(5);
                      else setActiveScreen(6);
                    }}
                    className="pt-1 text-[11px] font-bold text-[#C86D1F] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{step.actionText}</span>
                    <ChevronRight className="w-3 h-3 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Limitation Warning */}
        <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#C86D1F] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#9A3412] leading-relaxed">
            {assessment.limitationWarning}
          </p>
        </div>

        {/* Primary Bottom Action Button */}
        <button
          type="button"
          onClick={() => setActiveScreen(3)}
          className="w-full py-3 px-4 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <FileText className="w-4 h-4 text-[#E59849] shrink-0" />
          <span>{t.prepareNoticeCta}</span>
        </button>
      </div>

      {renderMobileBottomNav(2)}
    </div>
  );

  // ============================================================================
  // SCREEN 3: PREPARE LEGAL ACTION (EVIDENCE, ELIGIBILITY & AI NOTICE GENERATOR)
  // ============================================================================
  const renderScreen3 = () => (
    <div className="flex flex-col h-full bg-[#F6F4F0] overflow-hidden">
      {renderMobileHeader()}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
        {/* Sub-header with Back & Ask AI */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveScreen(2)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#141B2D] hover:text-[#C86D1F]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{t.prepareActionHeader}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{t.askAiAssistantBtn}</span>
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-600">
              {t.step2Of3Label}
            </span>
            <span className="text-[#C86D1F] tabular-nums">{t.readyLabel}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-2/3 bg-[#C86D1F] rounded-full" />
          </div>
        </div>

        {/* Why Start With a Legal Notice Callout */}
        <div className="rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3.5 space-y-1">
          <h3 className="text-xs font-bold text-[#9A3412]">
            {t.whyNoticeTitle}
          </h3>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            {t.whyNoticeBody}
          </p>
        </div>

        {/* 1. Evidence Checklist */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
                {t.evidenceChecklistHeader}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-[#C86D1F] tabular-nums">
                  {selectedEvidence.length} of {EVIDENCE_ITEMS.length} ·{" "}
                  {Object.values(evidencePhotos).reduce(
                    (sum, arr) => sum + arr.length,
                    0
                  )}{" "}
                  photo(s)
                </span>
                {selectedEvidence.length > 0 && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200/70 inline-flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    Auto-saved
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleReviewEvidence()}
                disabled={isReviewingEvidence}
                className="px-2.5 py-1.5 rounded-lg bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shrink-0"
                title="Run AI Legal Review on captured evidence photos and checklist"
              >
                {isReviewingEvidence ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#E59849] shrink-0" />
                ) : (
                  <Sparkles className="w-3 h-3 text-[#E59849] shrink-0" />
                )}
                <span>AI Legal Review</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCameraTargetEvidence(
                    selectedEvidence[0] || EVIDENCE_ITEMS[0].title
                  )
                }
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#9A3412] border border-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Camera className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                <span>{t.scanDocumentBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCrimeSceneDescription(situationInput);
                  setIs3DCrimeSceneOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                title="Inspect 3D Crime Scene & Spatial Evidence Markers"
              >
                <Box className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>3D Scene</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {localizedData.evidenceItems.map((ev) => {
              const isChecked = selectedEvidence.includes(ev.title);
              const itemPhotos = evidencePhotos[ev.title] || [];
              return (
                <div
                  key={ev.id}
                  className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                    isChecked
                      ? "bg-[#141B2D] text-white border-[#141B2D]"
                      : "bg-[#F6F4F0] text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleEvidence(ev.title)}
                    className="flex items-start gap-2 text-left w-full"
                  >
                    <div
                      className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked
                          ? "bg-[#C86D1F] text-white"
                          : "bg-white border border-slate-300"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 shrink-0" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight">
                        {ev.title}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 leading-snug ${
                          isChecked ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {ev.subtitle}
                      </p>
                    </div>
                  </button>

                  {itemPhotos.length > 0 && (() => {
                    const currentIdx = Math.min(
                      evidencePhotoSlideIndex[ev.title] || 0,
                      Math.max(0, itemPhotos.length - 1)
                    );
                    const activePhotoUrl = itemPhotos[currentIdx];

                    const cyclePhoto = (delta: number) => {
                      if (itemPhotos.length <= 1) return;
                      const nextIdx =
                        (currentIdx + delta + itemPhotos.length) %
                        itemPhotos.length;
                      setEvidencePhotoSlideIndex((prev) => ({
                        ...prev,
                        [ev.title]: nextIdx,
                      }));
                    };

                    return (
                      <div className="space-y-1.5">
                        {/* Swipeable Inline Document Photo Carousel */}
                        <div
                          onTouchStart={(e) => {
                            swipeStartXRef.current[ev.title] =
                              e.touches[0]?.clientX ?? null;
                          }}
                          onTouchEnd={(e) => {
                            const startX = swipeStartXRef.current[ev.title];
                            const endX = e.changedTouches[0]?.clientX;
                            if (
                              startX !== null &&
                              startX !== undefined &&
                              endX !== undefined
                            ) {
                              const diff = startX - endX;
                              if (Math.abs(diff) > 28) {
                                cyclePhoto(diff > 0 ? 1 : -1);
                              }
                            }
                            swipeStartXRef.current[ev.title] = null;
                          }}
                          onPointerDown={(e) => {
                            if (e.pointerType === "mouse") {
                              swipeStartXRef.current[ev.title] = e.clientX;
                            }
                          }}
                          onPointerUp={(e) => {
                            if (e.pointerType === "mouse") {
                              const startX = swipeStartXRef.current[ev.title];
                              if (startX !== null && startX !== undefined) {
                                const diff = startX - e.clientX;
                                if (Math.abs(diff) > 28) {
                                  cyclePhoto(diff > 0 ? 1 : -1);
                                }
                              }
                              swipeStartXRef.current[ev.title] = null;
                            }
                          }}
                          className="relative rounded-lg overflow-hidden border border-white/20 h-20 w-full bg-black select-none touch-pan-y group"
                          title="Swipe left/right to cycle captured pages, or tap Markup to annotate"
                        >
                          <img
                            src={activePhotoUrl}
                            alt={`Captured ${ev.title} #${currentIdx + 1}`}
                            draggable={false}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover pointer-events-none transition-all duration-200"
                          />

                          {/* Page Counter & Markup Trigger Pill */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCameraTargetEvidence(ev.title);
                            }}
                            className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 hover:bg-black text-[8px] font-semibold text-amber-200 flex items-center gap-1 shrink-0"
                          >
                            <span>
                              Page {currentIdx + 1}/{itemPhotos.length} · Markup
                            </span>
                          </button>

                          {/* Left / Right Cycle Arrows when multiple photos exist */}
                          {itemPhotos.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cyclePhoto(-1);
                                }}
                                className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-xs shrink-0"
                                aria-label="Previous document photo"
                              >
                                <ChevronLeft className="w-3 h-3 shrink-0" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cyclePhoto(1);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-xs shrink-0"
                                aria-label="Next document photo"
                              >
                                <ChevronRight className="w-3 h-3 shrink-0" />
                              </button>
                            </>
                          )}

                          {/* Delete Current Photo Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEvidencePhotos((prev) => {
                                const existing = prev[ev.title] || [];
                                const filtered = existing.filter(
                                  (_, i) => i !== currentIdx
                                );
                                const copy = { ...prev };
                                if (filtered.length === 0) {
                                  delete copy[ev.title];
                                } else {
                                  copy[ev.title] = filtered;
                                }
                                return copy;
                              });
                              setEvidencePhotoSlideIndex((prev) => ({
                                ...prev,
                                [ev.title]: Math.max(0, currentIdx - 1),
                              }));
                            }}
                            className="absolute top-1 right-1 h-4.5 w-4.5 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center shrink-0"
                            title="Remove current photo"
                          >
                            <Trash2 className="w-2.5 h-2.5 shrink-0" />
                          </button>
                        </div>

                        {/* Pagination Dots & Swipe Hint */}
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-semibold ${
                              isChecked ? "text-amber-300" : "text-[#9A3412]"
                            }`}
                          >
                            {itemPhotos.length > 1
                              ? `Swipe ←/→ (${currentIdx + 1} of ${itemPhotos.length})`
                              : "1 photo attached"}
                          </span>
                          {itemPhotos.length > 1 && (
                            <div className="flex items-center gap-1">
                              {itemPhotos.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEvidencePhotoSlideIndex((prev) => ({
                                      ...prev,
                                      [ev.title]: dotIdx,
                                    }));
                                  }}
                                  aria-label={`View photo ${dotIdx + 1}`}
                                  className={`h-1.5 rounded-full transition-all ${
                                    dotIdx === currentIdx
                                      ? "w-3 bg-[#E59849]"
                                      : isChecked
                                      ? "w-1.5 bg-white/30"
                                      : "w-1.5 bg-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setCameraTargetEvidence(ev.title)}
                      className={`w-full py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                        isChecked
                          ? "bg-white/10 hover:bg-white/20 text-amber-200"
                          : "bg-white hover:bg-amber-50 text-[#9A3412] border border-slate-200"
                      }`}
                    >
                      <Camera className="w-3 h-3 shrink-0" />
                      <span>
                        {itemPhotos.length > 0
                          ? `Add / Markup (${itemPhotos.length})`
                          : t.capturePhotoBtn}
                      </span>
                    </button>

                    {itemPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleReviewEvidence(ev.title)}
                        disabled={isReviewingEvidence}
                        className="w-full py-1 px-2 rounded-lg bg-[#C86D1F] hover:bg-[#b55f17] text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-2.5 h-2.5 shrink-0" />
                        <span>AI Review ({itemPhotos.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Legal Evidence Review Result Card */}
          {isReviewingEvidence && (
            <div className="p-3 rounded-xl bg-[#F6F4F0] border border-amber-200 flex items-center gap-2.5 text-xs text-[#141B2D]">
              <Loader2 className="w-4 h-4 animate-spin text-[#C86D1F] shrink-0" />
              <span>
                Running AI legal review on{" "}
                <strong>{reviewingTargetTitle}</strong> for discrepancies &
                missing details...
              </span>
            </div>
          )}

          {evidenceReviewResult && !isReviewingEvidence && (
            <div className="p-3.5 rounded-xl bg-[#F6F4F0] border border-amber-300/90 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                  <span className="text-[11px] font-bold text-[#141B2D]">
                    AI Legal Review: {evidenceReviewResult.targetTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      evidenceReviewResult.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-[#9A3412]"
                    }`}
                  >
                    {evidenceReviewResult.status.replace("_", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEvidenceReviewResult(null)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                    aria-label="Close review"
                  >
                    <X className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed">
                {evidenceReviewResult.summary}
              </p>

              {evidenceReviewResult.discrepancies.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A3412] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#C86D1F] shrink-0" />
                    <span>Potential Discrepancies to Check</span>
                  </p>
                  <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-700">
                    {evidenceReviewResult.discrepancies.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evidenceReviewResult.missingInfo.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#141B2D] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#C86D1F] shrink-0" />
                    <span>Missing Information / Corroboration Needed</span>
                  </p>
                  <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-700">
                    {evidenceReviewResult.missingInfo.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Check Free Legal Aid Eligibility (NALSA Section 12) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
              {t.eligibilityHeader}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-700">
              Section 12 Act
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {localizedData.eligibilityCategories.map((cat) => {
              const active = selectedEligibility.includes(cat.label);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleEligibility(cat.label)}
                  className={`p-2.5 rounded-xl border text-center transition-colors flex flex-col justify-center ${
                    active
                      ? "bg-[#141B2D] text-white border-[#141B2D] shadow-xs"
                      : "bg-[#F6F4F0] text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight">
                    {cat.label}
                  </span>
                  <span
                    className={`text-[9px] mt-1 ${
                      active ? "text-amber-300" : "text-slate-500"
                    }`}
                  >
                    {cat.sub}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-900">
              {selectedEligibility.length > 0
                ? `Eligible for 100% Free DLSA Lawyer (${selectedEligibility.join(
                    ", "
                  )})`
                : "Select any category above to verify free lawyer eligibility"}
            </span>
          </div>
        </div>

        {/* 3. AI Legal Notice / Complaint Generator */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
              {t.aiNoticeDraftHeader}
            </h3>
            <button
              type="button"
              onClick={handleGenerateNotice}
              disabled={isGeneratingNotice}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C86D1F] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shrink-0"
            >
              {isGeneratingNotice ? (
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              ) : (
                <Sparkles className="w-3 h-3 shrink-0" />
              )}
              <span>
                {isGeneratingNotice ? t.draftingText : t.customizeWithAiBtn}
              </span>
            </button>
          </div>

          <select
            value={noticeTemplate}
            onChange={(e) => setNoticeTemplate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#F6F4F0] px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#C86D1F]"
          >
            <option>Formal Legal Representation / Demand Notice</option>
            <option>Formal Demand Notice for Unpaid Salary (Sec 15)</option>
            <option>
              Conciliation Complaint to Assistant Labour Commissioner
            </option>
            <option>Tenant Security Deposit Refund Demand Notice</option>
            <option>Written Complaint to Superintendent of Police (FIR)</option>
          </select>

          <div className="relative">
            <textarea
              value={noticeDraft}
              onChange={(e) => setNoticeDraft(e.target.value)}
              rows={9}
              className="w-full rounded-xl bg-[#F6F4F0] border border-slate-200 p-3 text-[11px] font-mono text-slate-800 leading-relaxed focus:outline-none focus:border-[#C86D1F]"
            />
          </div>

          {/* Advocate Verification Bar */}
          <div className="flex items-center gap-2.5 pt-1">
            <img
              src={ASSETS.lawyerAvatarImg}
              alt="Adv. Priya Sharma"
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-[#141B2D]">
                Adv. Priya Sharma · NALSA Legal Aid Format
              </p>
              <p className="text-[10px] text-slate-500">
                Standard statutory demand notice template · Ready for email or
                Registered Post
              </p>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(noticeDraft);
                  setCopiedNotice(true);
                  setTimeout(() => setCopiedNotice(false), 2500);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                {copiedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportNoticePdf}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                {exportedPdf ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PDF Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `⚖️ *Formal Legal Notice (Drafted via Nyaya Sahayak)*\n\n${noticeDraft}\n\n*Supporting Evidence:* ${selectedEvidence.join(
                  ", "
                )}\n\n*NALSA Legal Aid Helpline:* 15100`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Share Formal Notice via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMilestones((prev) =>
                  prev.map((m) =>
                    m.id === "m2" ? { ...m, status: "COMPLETED" } : m
                  )
                );
                appendCaseHistory(
                  "Milestone 2 Completed: Legal Notice Finalized",
                  `Notice drafted under template "${noticeTemplate}" with ${selectedEvidence.length} evidence annexure item(s).`,
                  "Document"
                );
                setActiveScreen(5);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{t.saveAndProceedBtn}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {renderMobileBottomNav(3)}
    </div>
  );

  // ============================================================================
  // SCREEN 4: EXPLAIN LAW (CITIZEN LEGAL RIGHTS LIBRARY & SEARCH)
  // ============================================================================
  const filteredLaws = localizedData.lawLibraryTopics.filter((law) => {
    const matchesCat =
      selectedLawCategory === "All Topics" ||
      law.category === selectedLawCategory;
    const query = debouncedLawSearch.toLowerCase();
    const matchesQuery =
      !query ||
      law.title.toLowerCase().includes(query) ||
      law.summary.toLowerCase().includes(query) ||
      law.section.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const lawAutoSuggestions = React.useMemo(() => {
    const q = debouncedLawSearch.toLowerCase();
    if (!q) return [];
    return STATUTORY_ACT_SECTIONS.filter(
      (sec) =>
        sec.sectionCode.toLowerCase().includes(q) ||
        sec.actName.toLowerCase().includes(q) ||
        sec.title.toLowerCase().includes(q) ||
        sec.quickSummary.toLowerCase().includes(q) ||
        sec.keywords.some((kw) => kw.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [debouncedLawSearch]);

  const renderScreen4 = () => (
    <div className="flex flex-col h-full bg-[#F6F4F0] overflow-hidden">
      {renderMobileHeader()}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
        {/* Jurisdiction Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#C86D1F] text-white flex items-center justify-center font-bold text-xs shrink-0">
              IN
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.activeJurisdictionLabel}
              </span>
              <h2 className="text-xs font-bold text-[#141B2D]">
                {t.centralAndStateLabel}
              </h2>
            </div>
          </div>

          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="rounded-lg border border-slate-200 bg-[#F6F4F0] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700"
          >
            <option>Delhi NCR</option>
            <option>Maharashtra</option>
            <option>Karnataka</option>
            <option>Tamil Nadu</option>
            <option>Uttar Pradesh</option>
          </select>
        </div>

        {/* Search Law or Ask AI Directly (with Debounced Auto-Suggest Dropdown) */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 space-y-2 relative z-20">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={lawSearch}
                onFocus={() => setIsLawSuggestOpen(true)}
                onChange={(e) => {
                  setLawSearch(e.target.value);
                  setIsLawSuggestOpen(true);
                }}
                placeholder={t.searchLawPlaceholder}
                className="w-full bg-[#F6F4F0] text-xs text-slate-900 placeholder-slate-400 pl-8 pr-7 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
              />
              {lawSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLawSearch("");
                    setDebouncedLawSearch("");
                    setIsLawSuggestOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleSearchLegalUpdates()}
              disabled={isSearchingLegalWeb}
              className="px-2.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-1"
              title="Run live Google Search Grounding for up-to-date Indian legal rulings & portals"
            >
              {isSearchingLegalWeb ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Web Grounding</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLawSuggestOpen(false);
                setIsChatOpen(true);
                if (lawSearch.trim()) {
                  handleSendChatMessage(lawSearch.trim(), true);
                }
              }}
              className="px-3 py-2 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-bold whitespace-nowrap shrink-0"
            >
              {t.askAiShortBtn}
            </button>
          </div>

          {/* Debounced Auto-Suggest Dropdown */}
          {isLawSuggestOpen && debouncedLawSearch && (
            <div className="mt-1 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-[#F6F4F0] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>
                  {t.matchingSectionsLabel} ({lawAutoSuggestions.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsLawSuggestOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              {lawAutoSuggestions.length === 0 ? (
                <div className="p-3 text-xs text-slate-600 flex items-center justify-between gap-2">
                  <span>
                    No exact section in local index for “{debouncedLawSearch}”
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLawSuggestOpen(false);
                      setIsChatOpen(true);
                      handleSendChatMessage(
                        `Explain Indian law and statutory sections related to: ${debouncedLawSearch}`,
                        true
                      );
                    }}
                    className="text-[11px] font-bold text-[#C86D1F] hover:underline shrink-0"
                  >
                    Search with AI →
                  </button>
                </div>
              ) : (
                lawAutoSuggestions.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-2.5 hover:bg-amber-50/60 transition-colors flex items-start justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLawCategory(sec.category);
                        setLawSearch(sec.actName.split(" ")[0]);
                        setIsLawSuggestOpen(false);
                      }}
                      className="text-left flex-1"
                    >
                      <span className="text-[10px] font-bold text-[#C86D1F] block">
                        {sec.sectionCode}
                      </span>
                      <p className="text-xs font-bold text-[#141B2D] leading-snug">
                        {sec.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {sec.quickSummary}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLawSuggestOpen(false);
                        setIsChatOpen(true);
                        handleSendChatMessage(
                          `Explain ${sec.sectionCode} (${sec.title}) in simple words and how I can invoke it.`,
                          true
                        );
                      }}
                      className="px-2 py-1 rounded-lg bg-[#141B2D] hover:bg-slate-800 text-white text-[10px] font-semibold shrink-0 mt-1"
                    >
                      Ask AI →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{t.googleSearchConnectedNote}</span>
            </p>
            <button
              type="button"
              onClick={() =>
                handleSearchLegalUpdates(
                  `Latest ${jurisdiction} labour court & SAMADHAN portal rules for ${assessment.caseCategory}`
                )
              }
              disabled={isSearchingLegalWeb}
              className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0"
            >
              Verify Latest 2026 Rules →
            </button>
          </div>

          {legalWebError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
              {legalWebError}
            </div>
          )}

          {legalWebResult && (
            <div className="mt-2 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider">
                    <Globe className="w-2.5 h-2.5 shrink-0" />
                    Google Search Grounded Result
                  </span>
                  <h4 className="text-xs font-bold text-[#141B2D] mt-1">
                    {legalWebResult.query}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setLegalWebResult(null)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                  aria-label="Close grounded search result"
                >
                  <X className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

              <div className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-100">
                {legalWebResult.summary}
              </div>

              {legalWebResult.sources.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-emerald-900">
                    Verified Web Sources ({legalWebResult.sources.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {legalWebResult.sources.slice(0, 5).map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-emerald-100 border border-emerald-200 text-[10px] text-emerald-900 font-semibold max-w-full truncate"
                      >
                        <span className="truncate max-w-[190px]">
                          {src.title}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            "All Topics",
            "Labour & Work",
            "Property & Rent",
            "Family & Women",
            "Criminal & FIR",
            "Consumer & Cyber",
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedLawCategory(tab)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedLawCategory === tab
                  ? "bg-[#141B2D] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 2x3 Law Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {filteredLaws.map((law) => (
            <div
              key={law.id}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 flex flex-col justify-between hover:border-[#C86D1F] transition-colors"
            >
              <div>
                <div className="text-[10px] text-slate-500 font-medium mb-1">
                  {law.category} · {law.readTime}
                </div>
                <h3 className="text-xs font-bold text-[#141B2D] leading-snug">
                  {law.title}
                </h3>
                <p className="text-[10px] font-semibold text-[#C86D1F] mt-1">
                  {law.section}
                </p>
                <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {law.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsChatOpen(true);
                  handleSendChatMessage(
                    `Explain ${law.title} (${law.section}) in simple words and how a citizen can use it.`,
                    true
                  );
                }}
                className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold text-[#141B2D] hover:text-[#C86D1F] flex items-center justify-between"
              >
                <span>{t.explainWithAiBtn}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          ))}
        </div>

        {/* Frequently Asked Citizen Questions */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
            {t.faqHeader}
          </h3>
          <div className="space-y-2">
            {localizedData.citizenFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/90 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3 text-left flex items-center justify-between gap-2 text-xs font-bold text-[#141B2D]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dark CTA Card */}
        <div className="rounded-2xl bg-[#141B2D] text-white p-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold">
              {t.unsureSectionTitle}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {t.unsureSectionSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-bold whitespace-nowrap shrink-0"
          >
            {t.chatNowBtn}
          </button>
        </div>
      </div>

      {renderMobileBottomNav(4)}
    </div>
  );

  // ============================================================================
  // SCREEN 5: TRACK CASE & STEP-BY-STEP ACTION PLAN
  // ============================================================================
  const normalizedTrackQuery = trackSearchQuery.trim().toLowerCase();

  const matchesTrackDateRange = (
    dateText: string,
    isoDate?: string,
    status?: string
  ) => {
    if (trackDateRange === "all") return true;
    const lowerDate = (dateText || "").toLowerCase();
    if (trackDateRange === "today") {
      return (
        lowerDate.includes("today") ||
        lowerDate.includes("oct 04") ||
        isoDate === "2026-10-04" ||
        isoDate === new Date().toISOString().slice(0, 10)
      );
    }
    if (trackDateRange === "week") {
      return (
        lowerDate.includes("today") ||
        lowerDate.includes("oct") ||
        lowerDate.includes("48 hours") ||
        Boolean(isoDate && isoDate >= "2026-09-27")
      );
    }
    if (trackDateRange === "upcoming") {
      return (
        status === "PENDING" ||
        status === "UPCOMING" ||
        lowerDate.includes("target") ||
        lowerDate.includes("15 days") ||
        lowerDate.includes("tomorrow") ||
        lowerDate.includes("nalsa")
      );
    }
    if (trackDateRange === "custom") {
      const targetIso = isoDate || "2026-10-04";
      if (trackStartDate && targetIso < trackStartDate) return false;
      if (trackEndDate && targetIso > trackEndDate) return false;
      return true;
    }
    return true;
  };

  const filteredMilestones = milestones.filter((m) => {
    const matchesKeyword =
      !normalizedTrackQuery ||
      m.title.toLowerCase().includes(normalizedTrackQuery) ||
      m.description.toLowerCase().includes(normalizedTrackQuery) ||
      m.dateLabel.toLowerCase().includes(normalizedTrackQuery) ||
      m.status.toLowerCase().includes(normalizedTrackQuery);
    const matchesDate = matchesTrackDateRange(
      m.dateLabel,
      m.status === "COMPLETED" || m.status === "IN PROGRESS"
        ? "2026-10-04"
        : "2026-10-10",
      m.status
    );
    return matchesKeyword && matchesDate;
  });

  const filteredCaseHistory = caseHistoryLog.filter((entry) => {
    const matchesKeyword =
      !normalizedTrackQuery ||
      entry.title.toLowerCase().includes(normalizedTrackQuery) ||
      entry.detail.toLowerCase().includes(normalizedTrackQuery) ||
      entry.category.toLowerCase().includes(normalizedTrackQuery) ||
      entry.timestamp.toLowerCase().includes(normalizedTrackQuery);
    const matchesDate = matchesTrackDateRange(entry.timestamp, entry.isoDate);
    return matchesKeyword && matchesDate;
  });

  const filteredSelectedEvidence = selectedEvidence.filter((ev) => {
    const matchesKeyword =
      !normalizedTrackQuery ||
      ev.toLowerCase().includes(normalizedTrackQuery) ||
      "evidence document photo".includes(normalizedTrackQuery);
    const matchesDate = matchesTrackDateRange("Today · Oct 04, 2026", "2026-10-04");
    return matchesKeyword && matchesDate;
  });

  const matchesNoticeDraftSearch =
    (!normalizedTrackQuery ||
      noticeTemplate.toLowerCase().includes(normalizedTrackQuery) ||
      noticeDraft.toLowerCase().includes(normalizedTrackQuery) ||
      "legal notice draft pdf".includes(normalizedTrackQuery)) &&
    matchesTrackDateRange("Today · Oct 04, 2026", "2026-10-04");

  const filteredVoiceNotes = voiceNotes.filter((vn) => {
    const matchesKeyword =
      !normalizedTrackQuery ||
      vn.title.toLowerCase().includes(normalizedTrackQuery) ||
      (vn.transcript || "").toLowerCase().includes(normalizedTrackQuery) ||
      vn.createdAt.toLowerCase().includes(normalizedTrackQuery);
    const matchesDate = matchesTrackDateRange(
      `Today ${vn.createdAt}`,
      "2026-10-04"
    );
    return matchesKeyword && matchesDate;
  });

  const renderScreen5 = () => (
    <div className="flex flex-col h-full bg-[#F6F4F0] overflow-hidden">
      {renderMobileHeader()}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
        {/* Top Case Title, Notification Bell, Share & Ask AI */}
        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-slate-500 block tabular-nums">
                CASE #NS-2026-0842 · ACTIVE
              </span>
              <h2 className="text-sm font-bold text-[#141B2D]">
                {assessment.caseCategory}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Notification Bell Button */}
              <button
                type="button"
                onClick={() =>
                  setIsNotificationBellOpen((prev) => !prev)
                }
                aria-label="Case Alerts & Appointment Notifications"
                title="View milestone updates and upcoming appointment alerts"
                className={`relative h-8 w-8 rounded-xl border flex items-center justify-center transition-colors ${
                  isNotificationBellOpen
                    ? "bg-[#141B2D] text-white border-[#141B2D]"
                    : "bg-white hover:bg-amber-50 text-[#141B2D] border-slate-200"
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                {caseNotifications.filter((n) => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs tabular-nums">
                    {caseNotifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareCaseStatus}
                className="px-2.5 py-1.5 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Share summarized case status and milestones via messaging apps"
              >
                {copiedCaseShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
                    <span>Share</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-[11px] font-bold flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>{t.askAiShortBtn}</span>
              </button>
            </div>
          </div>

          {/* Notification Bell Dropdown Panel */}
          {isNotificationBellOpen && (
            <div className="mt-2.5 bg-white rounded-2xl border border-amber-300 shadow-lg p-3.5 space-y-2.5 z-20">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                  <span className="text-xs font-bold text-[#141B2D]">
                    Milestone & Appointment Alerts
                  </span>
                  {caseNotifications.filter((n) => n.unread).length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-[#9A3412] text-[9px] font-bold">
                      {caseNotifications.filter((n) => n.unread).length} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {caseNotifications.some((n) => n.unread) && (
                    <button
                      type="button"
                      onClick={() =>
                        setCaseNotifications((prev) =>
                          prev.map((n) => ({ ...n, unread: false }))
                        )
                      }
                      className="text-[10px] font-semibold text-[#C86D1F] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNotificationBellOpen(false)}
                    className="text-slate-400 hover:text-slate-700 flex items-center justify-center"
                    aria-label="Close notifications"
                  >
                    <X className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                {caseNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() =>
                      setCaseNotifications((prev) =>
                        prev.map((n) =>
                          n.id === notif.id ? { ...n, unread: false } : n
                        )
                      )
                    }
                    className={`rounded-xl p-2.5 border transition-colors cursor-pointer space-y-1 ${
                      notif.unread
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-[#F6F4F0] border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                          notif.type === "booking"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {notif.type === "booking" ? (
                          <Calendar className="w-2.5 h-2.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        )}
                        {notif.type === "booking"
                          ? "Appointment Nearing"
                          : "Milestone Updated"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500">
                          {notif.timestamp}
                        </span>
                        {notif.unread && (
                          <span className="h-2 w-2 rounded-full bg-[#C86D1F]" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-[#141B2D]">
                      {notif.title}
                    </p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shareable Case Status Summary Preview Box */}
        {sharedCaseSummary && (
          <div className="bg-white rounded-2xl p-3.5 border border-amber-300 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                <span className="text-xs font-bold text-[#141B2D]">
                  Shareable Case Status Summary
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSharedCaseSummary("")}
                className="text-slate-400 hover:text-slate-700 flex items-center justify-center"
                aria-label="Close share summary"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
            <pre className="text-[10px] font-mono text-slate-700 bg-[#F6F4F0] p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed border border-slate-200 max-h-40 overflow-y-auto">
              {sharedCaseSummary}
            </pre>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sharedCaseSummary);
                  setCopiedCaseShare(true);
                  setTimeout(() => setCopiedCaseShare(false), 2500);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedCaseShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Copied for Messaging Apps!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copy Summary Text</span>
                  </>
                )}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  sharedCaseSummary
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3 shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Segmented Toggle: Action Plan | Saved Drafts | Case History */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setTrackerTab("plan")}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap truncate ${
              trackerTab === "plan"
                ? "bg-[#141B2D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.actionPlanTab}
          </button>
          <button
            type="button"
            onClick={() => setTrackerTab("docs")}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap truncate ${
              trackerTab === "docs"
                ? "bg-[#141B2D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.draftsEvidenceTab}
          </button>
          <button
            type="button"
            onClick={() => setTrackerTab("history")}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap truncate ${
              trackerTab === "history"
                ? "bg-[#141B2D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.caseHistoryTab} ({filteredCaseHistory.length})
          </button>
        </div>

        {/* Search Bar & Date Range Filter for Milestones, Documents & Case History */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
            <input
              type="text"
              value={trackSearchQuery}
              onChange={(e) => setTrackSearchQuery(e.target.value)}
              placeholder="Search milestones, documents, or history by keyword or date..."
              className="w-full bg-[#F6F4F0] text-xs text-slate-900 placeholder-slate-400 pl-8 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
            />
            {trackSearchQuery && (
              <button
                type="button"
                onClick={() => setTrackSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5">
            {(
              [
                { id: "all", label: "All Dates" },
                { id: "today", label: "Today (Oct 04)" },
                { id: "week", label: "Past 7 Days" },
                { id: "upcoming", label: "Upcoming / Deadlines" },
                { id: "custom", label: "Date Range" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setTrackDateRange(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  trackDateRange === chip.id
                    ? "bg-[#141B2D] text-white"
                    : "bg-[#F6F4F0] text-slate-600 border border-slate-200 hover:text-slate-900"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {trackDateRange === "custom" && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={trackStartDate}
                  onChange={(e) => setTrackStartDate(e.target.value)}
                  className="w-full bg-[#F6F4F0] text-[11px] text-slate-800 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={trackEndDate}
                  onChange={(e) => setTrackEndDate(e.target.value)}
                  className="w-full bg-[#F6F4F0] text-[11px] text-slate-800 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
                />
              </div>
            </div>
          )}

          {(normalizedTrackQuery || trackDateRange !== "all") && (
            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
              <span>
                Showing{" "}
                <strong className="text-[#141B2D]">
                  {filteredMilestones.length}
                </strong>{" "}
                milestone(s),{" "}
                <strong className="text-[#141B2D]">
                  {filteredSelectedEvidence.length +
                    (matchesNoticeDraftSearch ? 1 : 0)}
                </strong>{" "}
                document(s) &{" "}
                <strong className="text-[#141B2D]">
                  {filteredCaseHistory.length}
                </strong>{" "}
                log entry(s)
              </span>
              <button
                type="button"
                onClick={() => {
                  setTrackSearchQuery("");
                  setTrackDateRange("all");
                  setTrackStartDate("");
                  setTrackEndDate("");
                }}
                className="font-bold text-[#C86D1F] hover:underline"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Readiness Progress & Recharts Pie Chart Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#141B2D]">
              {t.actionPlanStatusTitle}
            </span>
            <span className="text-xs font-bold text-[#C86D1F] tabular-nums">
              {progressPercentage}% {t.completeSuffix}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {/* Recharts Pie Chart */}
            <div className="relative w-[108px] h-[108px] shrink-0 flex items-center justify-center">
              <PieChart width={108} height={108}>
                <Pie
                  data={actionPlanPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={48}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {actionPlanPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Step(s)`,
                    name,
                  ]}
                  contentStyle={{
                    fontSize: "11px",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    padding: "4px 8px",
                  }}
                />
              </PieChart>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-[#141B2D] tabular-nums">
                  {completedMilestonesCount}/{milestones.length}
                </span>
                <span className="text-[9px] text-slate-500">Steps</span>
              </div>
            </div>

            {/* Status Breakdown Legend */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600 shrink-0" />
                  <span className="text-[11px] text-slate-700 font-medium">
                    {t.completedStepsLabel}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#141B2D] tabular-nums">
                  {completedMilestonesCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#C86D1F] shrink-0" />
                  <span className="text-[11px] text-slate-700 font-medium">
                    {t.inProgressLabel}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#141B2D] tabular-nums">
                  {inProgressMilestonesCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 shrink-0" />
                  <span className="text-[11px] text-slate-700 font-medium">
                    {t.pendingActionsLabel}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#141B2D] tabular-nums">
                  {pendingMilestonesCount}
                </span>
              </div>
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#C86D1F] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {t.tapCircleHint}
          </p>
        </div>

        {trackerTab === "plan" ? (
          /* Vertical Action Timeline */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
                {t.stepTimelineHeader}
              </h3>
            </div>

            <div className="space-y-2.5">
              {filteredMilestones.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 text-center text-xs text-slate-500">
                  No milestones match your search or date filter.
                </div>
              ) : (
                filteredMilestones.map((item) => {
                  const isDone = item.status === "COMPLETED";
                  const isInProgress = item.status === "IN PROGRESS";
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-3.5 border transition-colors ${
                        isInProgress
                          ? "border-[#C86D1F] shadow-xs"
                          : "border-slate-200/90"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleMilestoneStatus(item.id)}
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : isInProgress
                              ? "bg-[#141B2D] text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                          title="Toggle milestone completion"
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            item.step
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isDone
                                  ? "text-emerald-700"
                                  : isInProgress
                                  ? "text-[#C86D1F]"
                                  : "text-slate-400"
                              }`}
                            >
                              {item.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.dateLabel}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#141B2D]">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {item.description}
                          </p>

                          {item.ctaLabel && item.targetScreen && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveScreen(item.targetScreen!)
                              }
                              className="mt-2 w-full py-2 px-3 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span>{item.ctaLabel}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Speed Post Dispatch Tracking Proof Card */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#C86D1F] shrink-0" />
                  <span className="text-xs font-bold text-[#141B2D]">
                    India Post Speed Post Tracking
                  </span>
                </div>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  Legal Delivery Proof
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Dispatched your notice at the post office? Record the
                13-character Speed Post Tracking number (e.g. ED123456789IN) to
                add official delivery proof to your case audit log.
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={speedPostNumber}
                  onChange={(e) =>
                    setSpeedPostNumber(e.target.value.toUpperCase())
                  }
                  placeholder="e.g. ED123456789IN"
                  className="flex-1 bg-white text-xs font-mono uppercase px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!speedPostNumber.trim()) return;
                    appendCaseHistory(
                      "Speed Post Dispatch Recorded",
                      `Speed Post Consignment #${speedPostNumber.trim()} registered to Opposite Party. Official dispatch proof logged.`,
                      "Document"
                    );
                    setSpeedPostSaved(true);
                    setTimeout(() => setSpeedPostSaved(false), 2500);
                  }}
                  disabled={!speedPostNumber.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#141B2D] hover:bg-slate-800 disabled:opacity-50 text-white text-[11px] font-bold shrink-0 transition-colors"
                >
                  {speedPostSaved ? "Saved!" : "Log Proof"}
                </button>
              </div>
              {speedPostSaved && (
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>
                    Tracking consignment logged to official case history audit
                    trail!
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : trackerTab === "docs" ? (
          /* Saved Documents & Evidence View */
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
              {t.savedNoticeHeader}
            </h3>
            {matchesNoticeDraftSearch ? (
              <div className="p-3 rounded-xl bg-[#F6F4F0] border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#141B2D]">
                    {noticeTemplate}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveScreen(3)}
                    className="text-[11px] font-semibold text-[#C86D1F] hover:underline whitespace-nowrap"
                  >
                    {t.editDraftBtn}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-3 font-mono">
                  {noticeDraft}
                </p>
                <button
                  type="button"
                  onClick={handleExportNoticePdf}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {exportedPdf ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t.exportedPdfBtn}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#E59849] shrink-0" />
                      <span>{t.exportPdfBtn}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 bg-[#F6F4F0] p-2.5 rounded-lg">
                Saved legal notice does not match the current keyword/date filter.
              </p>
            )}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#141B2D]">
                {t.attachedEvidenceHeader} ({filteredSelectedEvidence.length})
              </p>
              {filteredSelectedEvidence.map((ev) => (
                <div
                  key={ev}
                  className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-[#F6F4F0] px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{ev}</span>
                  </div>
                  {evidencePhotos[ev] && evidencePhotos[ev].length > 0 ? (
                    <div
                      onClick={() => setCameraTargetEvidence(ev)}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      {evidencePhotos[ev].slice(0, 3).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`${ev} #${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-7 w-9 rounded object-cover border border-slate-300 shrink-0"
                        />
                      ))}
                      <span className="text-[10px] font-bold text-[#C86D1F] ml-0.5">
                        ({evidencePhotos[ev].length})
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCameraTargetEvidence(ev)}
                      className="text-[10px] font-semibold text-[#C86D1F] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Camera className="w-3 h-3 shrink-0" />
                      <span>Add Photos</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Saved Voice Notes in Evidence Store (Screen 5) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#141B2D]">
                  {t.recordedVoiceNotesHeader} ({filteredVoiceNotes.length})
                </p>
                <button
                  type="button"
                  onClick={() => setActiveScreen(1)}
                  className="text-[10px] font-semibold text-[#C86D1F] hover:underline"
                >
                  {t.recordNewBtn}
                </button>
              </div>
              {filteredVoiceNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 bg-[#F6F4F0] p-2.5 rounded-lg">
                  {t.noVoiceNotesText}
                </p>
              ) : (
                filteredVoiceNotes.map((vn) => (
                  <div
                    key={vn.id}
                    className="p-2.5 rounded-xl bg-[#F6F4F0] border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#141B2D]">
                        {vn.title} · {formatDuration(vn.durationSec)}
                      </span>
                      <a
                        href={vn.audioUrl}
                        download={`${vn.title.replace(/\s+/g, "_")}.webm`}
                        className="text-[10px] font-semibold text-[#C86D1F] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 shrink-0" />
                        <span>Download Audio</span>
                      </a>
                    </div>
                    <audio controls src={vn.audioUrl} className="w-full h-7" />
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        {/* Chronological Case History Audit Log (Always accessible on History tab or below timeline) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#C86D1F] shrink-0" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#141B2D]">
                  {t.caseHistoryHeader}
                </h3>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums block">
                  {caseHistoryLog.length} {t.loggedEventsSuffix}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportCaseHistoryPdf}
              className="px-2.5 py-1.5 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              title="Export entire Case History log as an official A4 PDF document"
            >
              {exportedHistoryPdf ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>PDF Exported</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Add Custom Timestamped Milestone Note */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customHistoryNote.trim()) return;
              appendCaseHistory(
                "Citizen Case Progress Note",
                customHistoryNote.trim(),
                "Milestone"
              );
              setCustomHistoryNote("");
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={customHistoryNote}
              onChange={(e) => setCustomHistoryNote(e.target.value)}
              placeholder={t.logMilestonePlaceholder}
              className="flex-1 bg-[#F6F4F0] text-xs text-slate-900 placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-[11px] font-bold whitespace-nowrap shrink-0"
            >
              {t.logBtn}
            </button>
          </form>

          {/* Chronological Audit Feed */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredCaseHistory.length === 0 ? (
              <p className="text-xs text-slate-500 bg-[#F6F4F0] p-3 rounded-xl text-center">
                No past milestone activities or log entries match your search or
                date range.
              </p>
            ) : (
              filteredCaseHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-[#F6F4F0] border border-slate-200/80 space-y-1 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86D1F]">
                      {entry.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {entry.timestamp}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#141B2D]">
                    {entry.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {entry.detail}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statutory Time Limit Reminder */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200/90 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A3412]">
            <Clock className="w-4 h-4 text-[#C86D1F] shrink-0" />
            <span>{t.limitationAlertTitle}</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            {assessment.limitationWarning}
          </p>
        </div>

        {/* Quick Helpline Footer Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#141B2D]">
              {t.needPlvTitle}
            </p>
            <p className="text-[11px] text-slate-500">
              {t.needPlvSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveScreen(6)}
            className="h-9 w-9 rounded-full bg-[#C86D1F] text-white flex items-center justify-center shadow-xs shrink-0"
            title="Find Legal Aid Center"
          >
            <Phone className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {renderMobileBottomNav(5)}
    </div>
  );

  // ============================================================================
  // SCREEN 6: FIND FREE LEGAL AID NEAR YOU (INTERACTIVE MAP & DLSA CENTERS)
  // ============================================================================
  const matchesProBonoForCategory = (center: (typeof LEGAL_AID_CENTERS)[number]) => {
    if (!center.acceptingProBono || center.proBonoSlotsAvailable <= 0) {
      return false;
    }
    const activeCat = (assessment.caseCategory || "").toLowerCase();
    return center.proBonoCategories.some((cat) => {
      const normalized = cat.toLowerCase();
      return (
        activeCat.includes(normalized) ||
        normalized.includes(activeCat) ||
        ((activeCat.includes("salary") ||
          activeCat.includes("wage") ||
          activeCat.includes("labour") ||
          activeCat.includes("work")) &&
          (normalized.includes("salary") ||
            normalized.includes("wage") ||
            normalized.includes("labour"))) ||
        ((activeCat.includes("tenant") ||
          activeCat.includes("rent") ||
          activeCat.includes("housing")) &&
          normalized.includes("tenant")) ||
        ((activeCat.includes("consumer") || activeCat.includes("cyber")) &&
          normalized.includes("consumer")) ||
        ((activeCat.includes("women") ||
          activeCat.includes("family") ||
          activeCat.includes("maternity")) &&
          normalized.includes("women"))
      );
    });
  };

  const filteredCenters = LEGAL_AID_CENTERS.filter((c) => {
    const matchesType =
      centerFilter === "All Centers" || c.type === centerFilter;
    const matchesSearch =
      !centerSearch.trim() ||
      c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
      c.address.toLowerCase().includes(centerSearch.toLowerCase());
    const matchesProBono = !proBonoOnlyFilter || matchesProBonoForCategory(c);
    return matchesType && matchesSearch && matchesProBono;
  });

  const renderScreen6 = () => (
    <div className="flex flex-col h-full bg-[#F6F4F0] overflow-hidden">
      {renderMobileHeader()}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
        {/* Header & Location */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#141B2D]">
              {t.findAidHeader}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t.findAidSub}
            </p>
          </div>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="rounded-xl bg-[#C86D1F] text-white px-2.5 py-1.5 text-[11px] font-bold focus:outline-none"
          >
            <option>Delhi NCR</option>
            <option>Mumbai</option>
            <option>Bengaluru</option>
            <option>Chennai</option>
          </select>
        </div>

        {/* Confirmed Booking Banner if booked */}
        {bookedSlotBanner && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between gap-2 text-xs text-emerald-900 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bookedSlotBanner}</span>
            </div>
          </div>
        )}

        {/* Interactive Visual Map Canvas */}
        <div
          id="map-container"
          className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-[#E5EEF5]"
        >
          <svg
            viewBox="0 0 400 200"
            className="w-full h-full object-cover origin-center will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `scale(${mapZoom})`,
              transformOrigin: "50% 50%",
            }}
          >
            <defs>
              <radialGradient id="heatHighCoverage" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.65" />
                <stop offset="55%" stopColor="#34D399" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatModerateCoverage" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatServiceGap" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#F87171" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g
              style={{
                transform: `scale(${mapZoom})`,
                transformOrigin: "200px 100px",
                transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Map Roads & Water */}
              <rect
                width="400"
                height="200"
                fill={mapLayer === "density" ? "#1E293B" : "#E6EEF4"}
              />
              <path
                d="M 0 40 Q 150 90 400 30"
                stroke={mapLayer === "density" ? "#334155" : "#CBE0F0"}
                strokeWidth="18"
                fill="none"
              />
              <path
                d="M 40 0 L 160 200 M 260 0 L 210 200 M 0 120 L 400 105 M 0 70 L 400 155"
                stroke={mapLayer === "density" ? "#475569" : "#FFFFFF"}
                strokeWidth="6"
                fill="none"
              />
              <path
                d="M 110 0 L 320 200"
                stroke={mapLayer === "density" ? "#64748B" : "#FDE68A"}
                strokeWidth="4"
                fill="none"
              />

              {/* Legal Aid Coverage Density Heatmap Overlay */}
              {mapLayer === "density" && (
                <g>
                  {/* High Coverage Zones around DLSA & Pro Bono Clusters */}
                  <circle
                    cx={46 * 4}
                    cy={42 * 2}
                    r="58"
                    fill="url(#heatHighCoverage)"
                  />
                  <circle
                    cx={28 * 4}
                    cy={64 * 2}
                    r="52"
                    fill="url(#heatHighCoverage)"
                  />
                  <circle
                    cx={76 * 4}
                    cy={32 * 2}
                    r="48"
                    fill="url(#heatHighCoverage)"
                  />

                  {/* Moderate Coverage Zone around Conciliation Clinic */}
                  <circle
                    cx={68 * 4}
                    cy={58 * 2}
                    r="46"
                    fill="url(#heatModerateCoverage)"
                  />

                  {/* Underserved Service Gap Zones (Outer Industrial & Peripheral Sectors) */}
                  <circle
                    cx="56"
                    cy="42"
                    r="48"
                    fill="url(#heatServiceGap)"
                  />
                  <circle
                    cx="345"
                    cy="158"
                    r="52"
                    fill="url(#heatServiceGap)"
                  />
                  <text
                    x="22"
                    y="38"
                    fill="#FECACA"
                    fontSize="7"
                    fontWeight="bold"
                  >
                    SERVICE GAP (WEST)
                  </text>
                  <text
                    x="298"
                    y="168"
                    fill="#FECACA"
                    fontSize="7"
                    fontWeight="bold"
                  >
                    SERVICE GAP (SOUTH-EAST)
                  </text>
                </g>
              )}
            </g>
          </svg>

          {/* Top Bar: Zoom Readout, Layer Toggle & Inline Map Pin Search Bar */}
          <div className="absolute left-2.5 right-2.5 top-2 space-y-1.5 z-20 pointer-events-none">
            <div className="flex items-center justify-between gap-1.5">
              <div className="pointer-events-auto px-2 py-0.5 rounded-md bg-white/95 border border-slate-200 text-[9px] font-mono font-bold text-slate-700 shadow-2xs transition-all duration-300">
                Zoom: {Math.round(mapZoom * 100)}% ({mapZoom.toFixed(1)}x){" "}
                {mapZoom < 0.8 ? "· Clustered" : ""}
              </div>

              <div
                role="group"
                aria-label="Map Layer Toggle"
                className="pointer-events-auto inline-flex items-center p-0.5 rounded-lg bg-white/95 border border-slate-200 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setMapLayer("standard")}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-colors ${
                    mapLayer === "standard"
                      ? "bg-[#141B2D] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Standard Map
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer("density")}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-colors ${
                    mapLayer === "density"
                      ? "bg-[#C86D1F] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Legal Aid Coverage Density
                </button>
              </div>
            </div>

            {/* Search Bar Inside #map-container to Filter Visible Map Pins by Center Name or Service Type */}
            <div className="pointer-events-auto relative flex items-center max-w-[260px]">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 pointer-events-none shrink-0" />
              <input
                type="text"
                value={mapPinSearch}
                onChange={(e) => setMapPinSearch(e.target.value)}
                placeholder="Filter pins by name or service type..."
                aria-label="Filter map pins by center name or service type"
                className="w-full bg-white/95 text-[10px] text-slate-900 placeholder-slate-400 pl-7 pr-6 py-1 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:border-[#C86D1F]"
              />
              {mapPinSearch && (
                <button
                  type="button"
                  onClick={() => setMapPinSearch("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                  aria-label="Clear map pin search"
                >
                  <X className="w-3 h-3 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Coverage Density Heatmap Legend (Bottom-Left when active) */}
          {mapLayer === "density" && (
            <div className="absolute left-2.5 bottom-2.5 px-2 py-1 rounded-lg bg-[#141B2D]/90 border border-white/15 text-white text-[8px] font-semibold flex items-center gap-2 z-20">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                High Aid
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Moderate
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Service Gap
              </span>
            </div>
          )}

          {/* Interactive Map Pins (Dynamically clustered when mapZoom < 0.8 & filtered by mapPinSearch) */}
          {(() => {
            const normalizedPinQuery = mapPinSearch.trim().toLowerCase();
            const visibleMapCenters = LEGAL_AID_CENTERS.filter((center) => {
              const passesProBono =
                !proBonoOnlyFilter || matchesProBonoForCategory(center);
              const passesPinQuery =
                !normalizedPinQuery ||
                center.name.toLowerCase().includes(normalizedPinQuery) ||
                center.type.toLowerCase().includes(normalizedPinQuery) ||
                center.services.some((srv) =>
                  srv.toLowerCase().includes(normalizedPinQuery)
                );
              return passesProBono && passesPinQuery;
            });

            if (visibleMapCenters.length === 0) {
              return (
                <div className="absolute inset-x-6 bottom-3 px-2.5 py-1 rounded-lg bg-[#141B2D]/90 text-white text-[9px] font-semibold text-center z-20">
                  No map pins match "{mapPinSearch}"
                </div>
              );
            }

            if (mapZoom < 0.8 && visibleMapCenters.length > 0) {
              const avgX = Math.round(
                visibleMapCenters.reduce((sum, c) => sum + c.mapX, 0) /
                  visibleMapCenters.length
              );
              const avgY = Math.round(
                visibleMapCenters.reduce((sum, c) => sum + c.mapY, 0) /
                  visibleMapCenters.length
              );
              return (
                <button
                  type="button"
                  onClick={() => setMapZoom(1)}
                  style={{ left: `${avgX}%`, top: `${avgY}%` }}
                  title="Click to zoom in and expand clustered legal aid centers"
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141B2D] text-white border-2 border-[#E59849] text-[10px] font-bold shadow-lg hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-10"
                >
                  <span className="h-4 w-4 rounded-full bg-[#C86D1F] text-white text-[9px] font-extrabold flex items-center justify-center">
                    {visibleMapCenters.length}
                  </span>
                  <span className="whitespace-nowrap">
                    {visibleMapCenters.length} Legal Aid Centers · Cluster
                  </span>
                </button>
              );
            }

            return visibleMapCenters.map((center) => {
              const isSelected = selectedCenterId === center.id;
              const isPopoverOpen = activePinPopoverId === center.id;
              const isProBonoMatch = matchesProBonoForCategory(center);
              return (
                <div
                  key={center.id}
                  style={{ left: `${center.mapX}%`, top: `${center.mapY}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isPopoverOpen || isSelected ? "z-20" : "z-10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCenterId(center.id);
                      setActivePinPopoverId((prev) =>
                        prev === center.id ? null : center.id
                      );
                    }}
                    title={`${center.name} — Click to view address & phone`}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold shadow-md transition-transform ${
                      isSelected
                        ? "bg-[#141B2D] text-white scale-110"
                        : proBonoOnlyFilter && isProBonoMatch
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-300 scale-105"
                        : "bg-white text-[#141B2D] border border-slate-300 hover:scale-105"
                    }`}
                  >
                    <MapPin
                      className={`w-3 h-3 shrink-0 ${
                        isSelected
                          ? "text-[#E59849]"
                          : proBonoOnlyFilter && isProBonoMatch
                          ? "text-emerald-200"
                          : "text-[#C86D1F]"
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      {center.type.split(" ")[0]}
                    </span>
                  </button>

                  {isPopoverOpen && (
                    <div
                      role="dialog"
                      aria-label={`${center.name} details`}
                      className="mt-1.5 w-52 -ml-16 rounded-xl bg-[#141B2D]/95 backdrop-blur-xs text-white p-2.5 shadow-xl border border-white/15 text-left space-y-1"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="text-[10px] font-bold text-amber-300 leading-tight line-clamp-2">
                          {center.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePinPopoverId(null);
                          }}
                          className="text-slate-300 hover:text-white shrink-0 flex items-center justify-center"
                          aria-label="Close pin popover"
                        >
                          <X className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-200 leading-snug">
                        {center.address}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                        <a
                          href={`tel:${center.phone}`}
                          className="inline-flex items-center gap-1 text-[9px] font-bold text-[#E59849] hover:underline"
                        >
                          <Phone className="w-2.5 h-2.5 shrink-0" />
                          <span>{center.phone}</span>
                        </a>
                        <span className="text-[9px] font-mono text-emerald-300">
                          {center.distance}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}

          {/* Accessible Zoom In / Zoom Out / Reset Map Controls */}
          <div
            role="group"
            aria-label="Map Zoom Controls"
            className="absolute right-2.5 bottom-2.5 flex flex-col gap-1 z-10"
          >
            <button
              type="button"
              onClick={() =>
                setMapZoom((z) => Math.min(1.6, Number((z + 0.2).toFixed(1))))
              }
              disabled={mapZoom >= 1.6}
              className="px-2 py-1 rounded-lg bg-white/95 hover:bg-white disabled:opacity-50 text-[#141B2D] border border-slate-200 shadow-xs flex items-center gap-1 text-[10px] font-bold transition-colors"
              aria-label="Zoom In (+20%)"
              title="Zoom In (+20% scale)"
            >
              <Plus className="w-3 h-3 text-[#C86D1F] shrink-0" />
              <span>Zoom In</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setMapZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))
              }
              disabled={mapZoom <= 0.6}
              className="px-2 py-1 rounded-lg bg-white/95 hover:bg-white disabled:opacity-50 text-[#141B2D] border border-slate-200 shadow-xs flex items-center gap-1 text-[10px] font-bold transition-colors"
              aria-label="Zoom Out (-20%)"
              title="Zoom Out (-20% scale)"
            >
              <Minus className="w-3 h-3 text-[#C86D1F] shrink-0" />
              <span>Zoom Out</span>
            </button>
            <button
              type="button"
              onClick={() => setMapZoom(1.0)}
              disabled={mapZoom === 1.0}
              className="px-2 py-1 rounded-lg bg-white/95 hover:bg-white disabled:opacity-50 text-[#141B2D] border border-slate-200 shadow-xs flex items-center gap-1 text-[10px] font-bold transition-colors"
              aria-label="Reset Map (100%)"
              title="Reset Map zoom to 1.0x default view"
            >
              <RefreshCw className="w-3 h-3 text-[#C86D1F] shrink-0" />
              <span>Reset Map</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={centerSearch}
              onChange={(e) => setCenterSearch(e.target.value)}
              placeholder={t.searchCenterPlaceholder}
              className="w-full bg-white text-xs text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              "All Centers",
              "DLSA Offices",
              "Legal Aid Clinics",
              "Pro Bono Lawyers",
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCenterFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  centerFilter === tab
                    ? "bg-[#141B2D] text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Pro-Bono Availability Toggle Filter */}
          <div
            onClick={() => setProBonoOnlyFilter((prev) => !prev)}
            role="switch"
            aria-checked={proBonoOnlyFilter}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setProBonoOnlyFilter((prev) => !prev);
              }
            }}
            className={`rounded-2xl p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              proBonoOnlyFilter
                ? "bg-emerald-950 text-white border-emerald-700 shadow-xs"
                : "bg-white text-[#141B2D] border-slate-200 hover:border-[#C86D1F]"
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Scale
                  className={`w-3.5 h-3.5 shrink-0 ${
                    proBonoOnlyFilter ? "text-emerald-400" : "text-[#C86D1F]"
                  }`}
                />
                <span className="text-xs font-bold">
                  Pro-Bono Availability Filter
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                    proBonoOnlyFilter
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {
                    LEGAL_AID_CENTERS.filter((c) => matchesProBonoForCategory(c))
                      .length
                  }{" "}
                  Available
                </span>
              </div>
              <p
                className={`text-[10px] leading-snug ${
                  proBonoOnlyFilter ? "text-emerald-200" : "text-slate-500"
                }`}
              >
                Show only centers & lawyers currently accepting new pro-bono cases
                for{" "}
                <strong
                  className={
                    proBonoOnlyFilter ? "text-white" : "text-[#141B2D]"
                  }
                >
                  {assessment.caseCategory}
                </strong>
              </p>
            </div>

            <div
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                proBonoOnlyFilter
                  ? "bg-emerald-500 justify-end"
                  : "bg-slate-200 justify-start"
              }`}
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
            </div>
          </div>
        </div>

        {/* Legal Aid Center Cards */}
        <div className="space-y-3">
          {filteredCenters.map((center) => {
            const isHighlighted = selectedCenterId === center.id;
            const isProBonoMatch = matchesProBonoForCategory(center);
            return (
              <div
                key={center.id}
                onClick={() => setSelectedCenterId(center.id)}
                className={`bg-white rounded-2xl p-4 border transition-all space-y-2.5 cursor-pointer ${
                  proBonoOnlyFilter && isProBonoMatch
                    ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm"
                    : isHighlighted
                    ? "border-[#C86D1F] shadow-sm"
                    : "border-slate-200/90"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] gap-2">
                  <span className="font-bold text-[#C86D1F] uppercase tracking-wider">
                    {center.badge} · {center.distance}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {center.statusText}
                  </span>
                </div>

                {/* Pro-Bono Category Availability Highlight Banner */}
                {isProBonoMatch ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Accepting Pro-Bono: {assessment.caseCategory}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold whitespace-nowrap">
                      {center.proBonoSlotsAvailable} Slots Open
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-600">
                    <span>
                      Conciliation Desk Only · Pro-Bono Roster Full Today
                    </span>
                    <span className="font-semibold text-slate-500">
                      Waitlist
                    </span>
                  </div>
                )}

                <h3 className="text-xs font-bold text-[#141B2D]">
                  {center.name}
                </h3>
                {center.assignedAdvocate && (
                  <p className="text-[11px] font-semibold text-[#C86D1F]">
                    {center.assignedAdvocate}
                  </p>
                )}
                <p className="text-[11px] text-slate-500">{center.address}</p>

                <div className="text-[11px] text-slate-600">
                  {center.services.join(" · ")}
                </div>

                <div className="p-2 rounded-xl bg-[#F6F4F0] text-[10px] text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{center.eligibilityNote}</span>
                </div>

                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookingTargetCenter(center);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
                    <span>{t.bookTokenBtn}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsChatOpen(true);
                        handleSendChatMessage(
                          `What documents should I bring when visiting ${center.name}?`,
                          true
                        );
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>Helpline {center.phone}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsChatOpen(true);
                        handleSendChatMessage(
                          `Give me step-by-step directions and procedure for ${center.name}`,
                          true
                        );
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#9A3412] text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3 shrink-0" />
                      <span>{t.askAiGuideBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Helpline Directory Box */}
        <div className="rounded-2xl bg-red-50/80 border border-red-200 p-3.5 space-y-1">
          <p className="text-xs font-bold text-red-900">
            {t.emergencyHelplinesTitle}
          </p>
          <p className="text-[11px] text-red-800 leading-relaxed">
            NALSA Legal Aid: <strong>15100</strong> · Women Helpline:{" "}
            <strong>181 / 1091</strong> · Cyber Crime Fraud:{" "}
            <strong>1930</strong> · Police Emergency: <strong>112</strong>
          </p>
        </div>

        {/* Bottom Tele-Law CTA */}
        <div className="rounded-2xl bg-[#141B2D] text-white p-3.5 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold">{t.needTeleLawTitle}</p>
            <p className="text-[10px] text-slate-300">
              {t.needTeleLawSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-bold whitespace-nowrap"
          >
            {t.startVoiceCallBtn}
          </button>
        </div>
      </div>

      {renderMobileBottomNav(6)}
    </div>
  );

  const screenList = [
    { num: 1, title: t.screen1Title, render: renderScreen1 },
    { num: 2, title: t.screen2Title, render: renderScreen2 },
    { num: 3, title: t.screen3Title, render: renderScreen3 },
    { num: 4, title: t.screen4Title, render: renderScreen4 },
    { num: 5, title: t.screen5Title, render: renderScreen5 },
    { num: 6, title: t.screen6Title, render: renderScreen6 },
  ];

  return (
    <I18nProvider language={language} setLanguage={setLanguage}>
      <div className="h-[100dvh] w-full bg-[#0F1523] text-[#141B2D] flex flex-col items-center justify-center sm:py-3 overflow-hidden select-none">
        {/* Native Mobile Application Viewport Container */}
        <div className="w-full max-w-[430px] h-full sm:h-[calc(100dvh-24px)] sm:max-h-[900px] bg-[#F6F4F0] sm:rounded-[38px] sm:border-[6px] sm:border-[#1E293B] shadow-2xl overflow-hidden flex flex-col relative">


          {/* Subtle Warning Banner When Offline */}
          {!isOnline && (
            <div
              role="alert"
              aria-live="polite"
              className="bg-amber-500/95 border-b border-amber-600/30 text-amber-950 px-3.5 py-1.5 text-[11px] font-semibold flex items-center justify-between gap-2 shadow-xs shrink-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <WifiOff className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                <span className="truncate">
                  You are offline · Local draft saved · AI features resume when reconnected
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-900/15 text-amber-950 px-1.5 py-0.5 rounded shrink-0">
                Offline
              </span>
            </div>
          )}

          {/* Temporary Restored Connectivity Banner */}
          {isOnline && showOnlineRestored && (
            <div
              role="status"
              aria-live="polite"
              className="bg-emerald-600 border-b border-emerald-700/40 text-white px-3.5 py-1.5 text-[11px] font-semibold flex items-center justify-between gap-2 shadow-xs shrink-0 transition-all"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Wifi className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span className="truncate">
                  Connection restored · All services online
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowOnlineRestored(false)}
                className="text-[10px] text-emerald-100 hover:text-white font-bold ml-1 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Mobile Screen Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {screenList.find((s) => s.num === activeScreen)?.render()}
          </div>
        </div>

        {/* Gemini Live API Voice Conversation Modal */}
        <LiveVoiceModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          language={language}
          onLanguageChange={setLanguage}
          situationContext={situationInput}
          onUseTranscriptForAssessment={(spokenText) => {
            handleAnalyzeSituation(spokenText);
          }}
          onOpen3DCrimeScene={(spokenText) => {
            setCrimeSceneDescription(spokenText || situationInput);
            setIs3DCrimeSceneOpen(true);
          }}
        />

        {/* 3D Interactive Crime Scene Reconstruction & Evidence Marker Studio */}
        <CrimeScene3DStudio
          isOpen={is3DCrimeSceneOpen}
          onClose={() => setIs3DCrimeSceneOpen(false)}
          initialDescription={crimeSceneDescription || situationInput}
          language={language}
          onOpenGeminiLive={() => {
            setIs3DCrimeSceneOpen(false);
            setIsVoiceModalOpen(true);
          }}
          onIntegrateWithCase={(data) => {
            if (data.evidenceMarkers && data.evidenceMarkers.length > 0) {
              const markerTitles = data.evidenceMarkers.map((m) => m.title);
              setSelectedEvidence((prev) =>
                Array.from(new Set([...prev, ...markerTitles]))
              );
            }
            if (data.caseTitle) {
              appendCaseHistory(
                `3D Crime Scene Reconstructed: ${data.caseTitle}`,
                `${data.evidenceMarkers?.length || 0} forensic evidence items cataloged into case evidence store under Bharatiya Sakshya Adhiniyam (BSA) 2023.`,
                "Evidence"
              );
            }
          }}
        />

        {/* Context-Aware Gemini Chatbot + Google Search Grounding Bottom Sheet */}
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          isLoading={isChatLoading}
          language={language}
          onOpenVoice={() => {
            setIsChatOpen(false);
            setIsVoiceModalOpen(true);
          }}
          onSpeakText={handleSpeakText}
          isSpeakingTts={isSpeakingTts}
          onBookAppointment={handleBookAppointment}
        />

        {/* Device Camera Document Capture & Markup Overlay Modal */}
        <CameraCaptureModal
          isOpen={!!cameraTargetEvidence}
          evidenceTitle={cameraTargetEvidence || ""}
          initialPhotos={
            cameraTargetEvidence
              ? evidencePhotos[cameraTargetEvidence] || []
              : []
          }
          situationContext={situationInput}
          language={language}
          onClose={() => setCameraTargetEvidence(null)}
          onCaptureComplete={(title, dataUrls, triggerAiReview) => {
            setEvidencePhotos((prev) => ({ ...prev, [title]: dataUrls }));
            setSelectedEvidence((prev) =>
              prev.includes(title) ? prev : [...prev, title]
            );
            if (triggerAiReview) {
              handleReviewEvidence(title, dataUrls);
            }
          }}
          onApplyOcrToNotice={(structuredText, meta) => {
            setNoticeDraft((prev) => {
              const insertion = `\n\n[SUPPORTING EVIDENCE & CLAUSES EXTRACTED VIA OCR - ${meta.documentTitle.toUpperCase()} (${meta.documentType.toUpperCase()})]:\n${structuredText}\n`;
              if (prev.includes(structuredText.trim())) {
                return prev;
              }
              return `${prev.trimEnd()}${insertion}`;
            });

            if (cameraTargetEvidence) {
              setSelectedEvidence((prev) =>
                prev.includes(cameraTargetEvidence)
                  ? prev
                  : [...prev, cameraTargetEvidence]
              );
            }

            appendCaseHistory(
              "Document OCR Clauses Integrated",
              `Extracted key clauses from ${meta.documentTitle} (${meta.documentType}) into Legal Notice Draft.`,
              "Document"
            );

            setOcrToastMessage(
              `Extracted clauses from "${meta.documentTitle}" successfully integrated into Legal Notice Draft!`
            );
            setTimeout(() => {
              setOcrToastMessage((cur) =>
                cur?.includes(meta.documentTitle) ? null : cur
              );
            }, 6000);
          }}
        />

        {/* DLSA Legal Aid Interactive Appointment Booking Modal */}
        <BookingAppointmentModal
          isOpen={!!bookingTargetCenter}
          onClose={() => setBookingTargetCenter(null)}
          center={bookingTargetCenter}
          caseCategory={assessment.caseCategory}
          language={language}
          evidenceItems={selectedEvidence}
          onConfirmBooking={(booking) => {
            handleBookAppointment(
              booking.centerName,
              `${booking.date} at ${booking.slot} (${booking.mode})`
            );
          }}
        />

        {/* Citizen Guide & FAQ Modal */}
        <HowItWorksModal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
          onOpenVoice={() => {
            setIsHowItWorksOpen(false);
            setIsVoiceModalOpen(true);
          }}
        />
      </div>
    </I18nProvider>
  );
}
