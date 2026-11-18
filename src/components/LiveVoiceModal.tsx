import { API_WS_URL } from "../api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  PhoneOff,
  AlertCircle,
  Send,
  Globe,
  Compass,
  Box,
} from "lucide-react";
import { ALL_SUPPORTED_LANGUAGES } from "../i18n/translations";
import { useSpokenLanguageSync } from "../hooks/useSpokenLanguageSync";

const SUPPORTED_LANGUAGES = ALL_SUPPORTED_LANGUAGES;

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange?: (newLanguage: string) => void;
  situationContext: string;
  onUseTranscriptForAssessment: (transcriptText: string) => void;
  onOpen3DCrimeScene?: (spokenDescription: string) => void;
}

interface TranscriptTurn {
  id: string;
  speaker: "user" | "assistant";
  text: string;
  language?: string;
}

const LIVE_VOICE_UI_COPY: Record<
  string,
  {
    headerTitle: string;
    headerSub: string;
    connectingStatus: string;
    mutedStatus: string;
    listeningStatus: string;
    speakingStatus: string;
    errorStatus: string;
    instructionSub: string;
    samplePrompt1: string;
    samplePrompt2: string;
    inputPlaceholder: string;
    endCallBtn: string;
    analyzeBtn: string;
    youLabel: string;
    aiLabel: string;
    activeLangBadge: string;
  }
> = {
  English: {
    headerTitle: "Nyaya Sahayak Live Voice",
    headerSub: "Gemini Live API · Real-Time Multilingual Legal Aid",
    connectingStatus: "Connecting in English...",
    mutedStatus: "Microphone Muted — Tap to Unmute",
    listeningStatus: "Listening in English... Speak freely",
    speakingStatus: "Nyaya Sahayak is speaking in English...",
    errorStatus: "Voice Stream Alert",
    instructionSub:
      "Describe what happened with your employer, landlord, police station, or family dispute. You can interrupt at any time.",
    samplePrompt1: "My company has not paid my salary for 3 months",
    samplePrompt2: "My landlord is refusing to return my security deposit",
    inputPlaceholder: "Or type in English to speak in this live session...",
    endCallBtn: "End Voice Call",
    analyzeBtn: "Analyze Spoken Case →",
    youLabel: "You (Citizen)",
    aiLabel: "Nyaya Sahayak AI",
    activeLangBadge: "Speaking & Listening in English",
  },
  "हिन्दी (Hindi)": {
    headerTitle: "न्याय सहायक लाइव वॉइस (हिन्दी)",
    headerSub: "जेमिनी लाइव एपीआई · रीयल-टाइम कानूनी सहायता",
    connectingStatus: "हिन्दी वॉइस सेशन से जुड़ रहा है...",
    mutedStatus: "माइक्रोफ़ोन म्यूट है — अनम्यूट करने के लिए टैप करें",
    listeningStatus: "हिन्दी में सुन रहा है... बेझिझक अपनी बात कहें",
    speakingStatus: "न्याय सहायक हिन्दी में बोल रहा है...",
    errorStatus: "वॉइस स्ट्रीम चेतावनी",
    instructionSub:
      "नियोक्ता, मकान मालिक, पुलिस थाने या पारिवारिक विवाद के बारे में बताएं। आप कभी भी बीच में बोल सकते हैं।",
    samplePrompt1: "मेरी कंपनी 3 महीने से सैलरी नहीं दे रही है",
    samplePrompt2: "मेरा मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा है",
    inputPlaceholder: "या इस लाइव सेशन में हिन्दी में टाइप करके पूछें...",
    endCallBtn: "कॉल समाप्त करें",
    analyzeBtn: "बोले गए मामले का विश्लेषण करें →",
    youLabel: "आप (नागरिक)",
    aiLabel: "न्याय सहायक AI",
    activeLangBadge: "हिन्दी में संवाद सक्रिय",
  },
  "मराठी (Marathi)": {
    headerTitle: "न्याय सहायक लाईव्ह व्हॉइस (मराठी)",
    headerSub: "जेमिनी लाईव्ह एपीआय · रिअल-टाइम कायदेशीर मदत",
    connectingStatus: "मराठी व्हॉइस सेशनशी जोडले जात आहे...",
    mutedStatus: "मायक्रोफोन म्यूट आहे — अनम्यूट करण्यासाठी टॅप करा",
    listeningStatus: "मराठीत ऐकत आहे... तुमची समस्या मोकळेपणाने सांगा",
    speakingStatus: "न्याय सहायक मराठीत बोलत आहे...",
    errorStatus: "व्हॉइस स्ट्रीम सूचना",
    instructionSub:
      "तुमची कंपनी, घरमालक, पोलीस स्टेशन किंवा कौटुंबिक वादाबद्दल सांगा. तुम्ही कधीही प्रश्न विचारू शकता.",
    samplePrompt1: "माझी कंपनी ३ महिन्यांपासून माझा पगार देत नाहीये",
    samplePrompt2: "घरमालक माझी डिपॉझिट रक्कम परत करत नाहीये",
    inputPlaceholder: "किंवा या लाईव्ह सेशनमध्ये मराठीत टाइप करा...",
    endCallBtn: "कॉल संपवा",
    analyzeBtn: "सांगितलेल्या प्रकरणाचे विश्लेषण करा →",
    youLabel: "तुम्ही (नागरिक)",
    aiLabel: "न्याय सहायक AI",
    activeLangBadge: "मराठीत संवाद सक्रिय",
  },
  "தமிழ் (Tamil)": {
    headerTitle: "நியாய சஹாயக் நேரலை குரல் (தமிழ்)",
    headerSub: "ஜெமினி நேரலை API · உடனடி சட்ட உதவி",
    connectingStatus: "தமிழ் குரல் அமர்வுடன் இணைகிறது...",
    mutedStatus: "மைக்ரோஃபோன் முடக்கப்பட்டுள்ளது — பேச தட்டவும்",
    listeningStatus: "தமிழில் கேட்கிறது... உங்கள் பிரச்சினையை கூறுங்கள்",
    speakingStatus: "நியாய சஹாயக் தமிழில் பேசுகிறது...",
    errorStatus: "குரல் இணைப்பு எச்சரிக்கை",
    instructionSub:
      "நிறுவனம், வீட்டு உரிமையாளர், காவல் நிலையம் அல்லது குடும்பப் பிரச்சினை குறித்து தமிழில் பேசுங்கள்.",
    samplePrompt1: "என் நிறுவனம் 3 மாதங்களாக சம்பளம் தரவில்லை",
    samplePrompt2: "வீட்டு உரிமையாளர் முன்பணத்தைத் திருப்பித் தர மறுக்கிறார்",
    inputPlaceholder: "அல்லது தமிழில் தட்டச்சு செய்து கேளுங்கள்...",
    endCallBtn: "அழைப்பை முடி",
    analyzeBtn: "பேசிய வழக்கை ஆய்வு செய் →",
    youLabel: "நீங்கள் (குடிமகன்)",
    aiLabel: "நியாய சஹாயக் AI",
    activeLangBadge: "தமிழில் உரையாடல் செயலில் உள்ளது",
  },
  "తెలుగు (Telugu)": {
    headerTitle: "న్యాయ సహాయక్ లైవ్ వాయిస్ (తెలుగు)",
    headerSub: "జెమిని లైవ్ API · రియల్-టైమ్ న్యాయ సహాయం",
    connectingStatus: "తెలుగు వాయిస్ సెషన్‌కు కనెక్ట్ అవుతోంది...",
    mutedStatus: "మైక్రోఫోన్ మ్యూట్ చేయబడింది — అన్‌మ్యూట్ చేయడానికి నొక్కండి",
    listeningStatus: "తెలుగులో వింటోంది... మీ సమస్యను స్వేచ్ఛగా చెప్పండి",
    speakingStatus: "న్యాయ సహాయక్ తెలుగులో మాట్లాడుతోంది...",
    errorStatus: "వాయిస్ స్ట్రీమ్ హెచ్చరిక",
    instructionSub:
      "మీ కంపెనీ, ఇంటి యజమాని, పోలీస్ స్టేషన్ లేదా కుటుంబ వివాదం గురించి తెలుగులో వివరించండి.",
    samplePrompt1: "మా కంపెనీ గత 3 నెలలుగా జీతం ఇవ్వడం లేదు",
    samplePrompt2: "ఇంటి యజమాని అడ్వాన్స్ డబ్బులు తిరిగి ఇవ్వడం లేదు",
    inputPlaceholder: "లేదా ఈ లైవ్ సెషన్‌లో తెలుగులో టైప్ చేయండి...",
    endCallBtn: "కాల్ ముగించు",
    analyzeBtn: "చెప్పిన కేసును విశ్లేషించండి →",
    youLabel: "మీరు (పౌరుడు)",
    aiLabel: "న్యాయ సహాయక్ AI",
    activeLangBadge: "తెలుగులో సంభాషణ యాక్టివ్‌గా ఉంది",
  },
};

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  situationContext,
  onUseTranscriptForAssessment,
  onOpen3DCrimeScene,
}) => {
  const [status, setStatus] = useState<
    "connecting" | "listening" | "speaking" | "error" | "closed"
  >("connecting");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [quickText, setQuickText] = useState("");
  const [detectedCrimeScenePrompt, setDetectedCrimeScenePrompt] = useState<string>("");
  const {
    languageRef,
    autoDetectedNotice: autoDetectedLangNotice,
    setAutoDetectedNotice: setAutoDetectedLangNotice,
    syncConfirmedLanguage,
    inspectTranscriptChunk,
    resetTranscriptBuffer,
  } = useSpokenLanguageSync({
    language,
    onLanguageChange,
  });

  const baseCopy = LIVE_VOICE_UI_COPY[language] || LIVE_VOICE_UI_COPY.English;
  const copy =
    language in LIVE_VOICE_UI_COPY
      ? baseCopy
      : {
          ...baseCopy,
          headerTitle: `Nyaya Sahayak Live (${language})`,
          connectingStatus: `Connecting in ${language}...`,
          listeningStatus: `Listening in ${language} (Auto-Detect ON)...`,
          speakingStatus: `Nyaya Sahayak is speaking in ${language}...`,
          inputPlaceholder: `Or type in ${language} to speak in this live session...`,
          activeLangBadge: `Auto-Detect Active · ${language}`,
        };

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMicMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playPcm24kChunk = (base64Pcm: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;

    const binaryString = atob(base64Pcm);
    const byteLength = binaryString.length;
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now + 0.02;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    activeSourcesRef.current.push(source);

    setStatus("speaking");
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(
        (s) => s !== source
      );
      if (activeSourcesRef.current.length === 0) {
        setStatus("listening");
      }
    };
  };

  const stopAllPlayback = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {}
    }
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  };

  const cleanupSession = () => {
    stopAllPlayback();
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
      return;
    }

    let cancelled = false;
    setStatus("connecting");
    setErrorMsg("");

    const startLiveSession = async () => {
      try {
        const wsUrl = `${API_WS_URL}/api/live?lang=${encodeURIComponent(
          language
        )}&context=${encodeURIComponent(situationContext.slice(0, 350))}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const outCtx = new AudioContext({ sampleRate: 24000 });
        outputAudioCtxRef.current = outCtx;
        nextStartTimeRef.current = outCtx.currentTime;

        ws.onmessage = (event) => {
          if (cancelled) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "ready") {
              setStatus("listening");
            } else if (msg.type === "detected_language" && msg.language) {
              syncConfirmedLanguage(
                msg.language,
                "Auto-detected spoken language"
              );
            } else if (msg.type === "audio" && msg.audio) {
              playPcm24kChunk(msg.audio);
            } else if (msg.type === "input_transcript" && msg.text) {
              const effectiveLang = inspectTranscriptChunk(msg.text, true);
              setTurns((prev) => {
                const last = prev[prev.length - 1];
                if (
                  last &&
                  last.speaker === "user" &&
                  last.language === effectiveLang
                ) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: `${last.text} ${msg.text}`.trim() },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `u-${Date.now()}`,
                    speaker: "user",
                    text: msg.text,
                    language: effectiveLang,
                  },
                ];
              });
            } else if (msg.type === "output_transcript" && msg.text) {
              const effectiveLang = inspectTranscriptChunk(msg.text, false);
              setTurns((prev) => {
                const last = prev[prev.length - 1];
                if (
                  last &&
                  last.speaker === "assistant" &&
                  last.language === effectiveLang
                ) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: `${last.text} ${msg.text}`.trim() },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `a-${Date.now()}`,
                    speaker: "assistant",
                    text: msg.text,
                    language: effectiveLang,
                  },
                ];
              });
            } else if (msg.type === "turn_complete") {
              resetTranscriptBuffer();
            } else if (msg.type === "interrupted") {
              stopAllPlayback();
              setStatus("listening");
            } else if (msg.type === "recreate_crime_scene" && msg.description) {
              setDetectedCrimeScenePrompt(msg.description);
            } else if (msg.type === "error") {
              setErrorMsg(msg.message || "Voice connection error.");
              setStatus("error");
            }
          } catch (err) {
            console.error("Error parsing Live WS message:", err);
          }
        };

        ws.onerror = () => {
          if (!cancelled) {
            setErrorMsg(
              "Could not connect to Gemini Live voice stream. You can still send a prompt below."
            );
            setStatus("error");
          }
        };

        // Start microphone capture at 16kHz
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const inCtx = new AudioContext({ sampleRate: 16000 });
        inputAudioCtxRef.current = inCtx;
        const source = inCtx.createMediaStreamSource(stream);
        const processor = inCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (
            isMicMutedRef.current ||
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN
          ) {
            return;
          }
          const channelData = e.inputBuffer.getChannelData(0);
          const base64Audio = floatTo16BitPCMBase64(channelData);
          wsRef.current.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inCtx.destination);
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(
            err?.message ||
              "Microphone permission wasn't granted. You can type or tap a sample phrase below to talk with the Live voice session."
          );
          setStatus("listening");
        }
      }
    };

    startLiveSession();

    return () => {
      cancelled = true;
      cleanupSession();
    };
  }, [isOpen]);


  const handleManualLanguageSelect = (newLang: string) => {
    languageRef.current = newLang;
    setAutoDetectedLangNotice(`Switched to ${newLang}`);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          text: `Please switch and speak in ${newLang} now. Greet me briefly in ${newLang}.`,
        })
      );
    }
  };

  const sendPromptText = (rawText: string) => {
    const textToSend = rawText.trim();
    if (!textToSend) return;
    setTurns((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, speaker: "user", text: textToSend, language },
    ]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          text: `[Respond in ${language}] ${textToSend}`,
        })
      );
    }
  };

  const handleSendTextToLive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    sendPromptText(quickText);
    setQuickText("");
  };

  const userSpokenSummary = turns
    .filter((t) => t.speaker === "user")
    .map((t) => t.text)
    .join(" ");

  const hasCrimeSceneContent = useMemo(() => {
    if (detectedCrimeScenePrompt) return true;
    const combined = `${userSpokenSummary} ${situationContext}`.toLowerCase();
    return /accident|crash|collision|hit|car|bike|truck|vehicle|burglary|break|theft|stole|robbery|assault|murder|crime|scene|window|door|atm|fraud|police|witness|evidence|weapon|knife|gun|skid|चोरी|दुर्घटना|गाड़ी|हादसा|विपत्|திருட்டு|దొంగ/i.test(
      combined
    );
  }, [detectedCrimeScenePrompt, userSpokenSummary, situationContext]);

  if (!isOpen) return null;

  const handleLaunch3DCrimeScene = (explicitPrompt?: string) => {
    const desc =
      explicitPrompt ||
      detectedCrimeScenePrompt ||
      userSpokenSummary ||
      situationContext ||
      turns.map((t) => `${t.speaker}: ${t.text}`).join(". ");
    onOpen3DCrimeScene?.(desc);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-[#141B2D] text-white shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Mobile Sheet Grab Handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header with Active Language State & Switcher */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight truncate">
                {copy.headerTitle}
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                {copy.headerSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onLanguageChange && (
              <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-xl px-2 py-1">
                <Globe className="w-3 h-3 text-[#E59849] shrink-0" />
                <select
                  value={language}
                  onChange={(e) => handleManualLanguageSelect(e.target.value)}
                  aria-label="Switch Live Voice Language"
                  className="bg-transparent text-[11px] font-semibold text-white focus:outline-none cursor-pointer max-w-[140px]"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang}
                      value={lang}
                      className="bg-[#141B2D] text-white"
                    >
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close Live Voice"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Visualizer & Status */}
        <div className="px-6 py-5 flex flex-col items-center text-center bg-gradient-to-b from-[#1C253E] to-[#141B2D]">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
              <Globe className="w-3 h-3 shrink-0" />
              <span>{copy.activeLangBadge}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[9px] font-semibold">
              33 Indian Languages Auto-Detect
            </span>
          </div>
          {autoDetectedLangNotice && (
            <p className="mb-2 text-[10px] font-bold text-amber-300">
              {autoDetectedLangNotice}
            </p>
          )}

          <div className="relative flex items-center justify-center mb-4">
            <div
              className={`absolute h-28 w-28 rounded-full transition-transform duration-300 ${
                status === "speaking"
                  ? "bg-[#C86D1F]/30 scale-125 animate-ping"
                  : status === "listening" && !isMicMuted
                  ? "bg-[#D92D20]/25 scale-110 animate-pulse"
                  : "bg-white/5 scale-100"
              }`}
            />
            <button
              onClick={() => setIsMicMuted((m) => !m)}
              className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95 ${
                isMicMuted
                  ? "bg-slate-700 text-slate-300"
                  : status === "speaking"
                  ? "bg-[#C86D1F] text-white"
                  : "bg-[#D92D20] text-white"
              }`}
            >
              {isMicMuted ? (
                <MicOff className="w-8 h-8 shrink-0" />
              ) : status === "speaking" ? (
                <Volume2 className="w-8 h-8 animate-bounce shrink-0" />
              ) : (
                <Mic className="w-8 h-8 shrink-0" />
              )}
            </button>
          </div>

          <p className="text-sm font-semibold">
            {status === "connecting" && copy.connectingStatus}
            {status === "listening" &&
              (isMicMuted ? copy.mutedStatus : copy.listeningStatus)}
            {status === "speaking" && copy.speakingStatus}
            {status === "error" && copy.errorStatus}
          </p>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            {copy.instructionSub}
          </p>

          {errorMsg && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Live Transcript Feed */}
        <div className="px-5 py-3 max-h-52 overflow-y-auto space-y-2.5 bg-[#0F1523]/80 border-t border-white/10">
          {turns.length === 0 ? (
            <div className="space-y-2 py-2">
              <p className="text-[11px] text-slate-400 text-center">
                Tap a phrase or speak aloud in{" "}
                <strong className="text-amber-300">{language}</strong>:
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => sendPromptText(copy.samplePrompt1)}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-200 transition-colors"
                >
                  “{copy.samplePrompt1}”
                </button>
                <button
                  type="button"
                  onClick={() => sendPromptText(copy.samplePrompt2)}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-200 transition-colors"
                >
                  “{copy.samplePrompt2}”
                </button>
              </div>
            </div>
          ) : (
            turns.map((t) => (
              <div
                key={t.id}
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  t.speaker === "user"
                    ? "bg-white/10 text-white ml-6"
                    : "bg-[#C86D1F]/20 border border-[#C86D1F]/30 text-amber-100 mr-6"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                    {t.speaker === "user" ? copy.youLabel : copy.aiLabel}
                  </span>
                  {t.language && (
                    <span className="text-[9px] text-amber-300/80 font-mono">
                      {t.language.split(" ")[0]}
                    </span>
                  )}
                </div>
                {t.text}
              </div>
            ))
          )}
        </div>

        {/* Crime Scene Auto-Detection & 1-Tap Recreate Callout */}
        {(hasCrimeSceneContent || turns.length > 0) && onOpen3DCrimeScene && (
          <div className="mx-4 my-2 p-2.5 rounded-2xl bg-indigo-950/90 border border-indigo-400/50 flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Box className="w-4 h-4 text-indigo-200 animate-pulse shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-100 truncate">
                  3D Crime Scene Reconstruction
                </p>
                <p className="text-[10px] text-indigo-300 truncate">
                  Recreate incident from your Gemini Live voice
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleLaunch3DCrimeScene()}
              className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-[11px] font-bold whitespace-nowrap shadow-md flex items-center gap-1 shrink-0"
            >
              <span>Recreate in 3D</span>
              <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
            </button>
          </div>
        )}

        {/* Optional text prompt inside Live session */}
        <form
          onSubmit={handleSendTextToLive}
          className="px-4 py-2.5 bg-[#141B2D] border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder={copy.inputPlaceholder}
            className="flex-1 bg-white/10 text-white placeholder-slate-400 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C86D1F]"
          />
          <button
            type="submit"
            className="h-8 w-8 rounded-lg bg-[#C86D1F] hover:bg-[#b55f17] flex items-center justify-center text-white shrink-0"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
          </button>
        </form>

        {/* Bottom Controls */}
        <div className="p-4 bg-[#0F1523] border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <PhoneOff className="w-4 h-4 shrink-0" />
            {copy.endCallBtn}
          </button>

          {onOpen3DCrimeScene && (
            <button
              onClick={() => handleLaunch3DCrimeScene()}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95 text-xs ${
                hasCrimeSceneContent
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                  : "bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200"
              }`}
              title="Reconstruct 3D Crime Scene from Spoken Description"
            >
              <Box className="w-4 h-4 text-indigo-200 animate-pulse shrink-0" />
              <span>Recreate 3D Scene</span>
            </button>
          )}

          {userSpokenSummary && (
            <button
              onClick={() => {
                onUseTranscriptForAssessment(userSpokenSummary);
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              {copy.analyzeBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
