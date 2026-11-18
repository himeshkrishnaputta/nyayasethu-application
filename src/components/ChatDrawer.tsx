import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Send,
  Globe,
  Mic,
  Volume2,
  ExternalLink,
  CalendarCheck,
  Scale,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export interface ChatSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: ChatSource[];
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, useSearchGrounding: boolean) => Promise<void>;
  isLoading: boolean;
  language: string;
  onOpenVoice: () => void;
  onSpeakText: (text: string) => void;
  isSpeakingTts: boolean;
  onBookAppointment: (centerName: string, slot: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  language,
  onOpenVoice,
  onSpeakText,
  isSpeakingTts,
  onBookAppointment,
}) => {
  const [input, setInput] = useState("");
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [selectedCenter, setSelectedCenter] = useState(
    "DLSA Central Courts (Patiala House)"
  );
  const [selectedSlot, setSelectedSlot] = useState("Tomorrow, 11:00 AM");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await onSendMessage(text, useSearchGrounding);
  };

  const quickPrompts = [
    "How do I file an unpaid salary complaint on SAMADHAN portal?",
    "What is the latest Supreme Court rule on withholding relieving letters?",
    "Help me book a free DLSA Legal Aid appointment",
    "Can police refuse to register a Zero FIR under BNSS 2023?",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#F6F4F0] h-[90dvh] sm:h-[86dvh] rounded-t-3xl shadow-2xl flex flex-col border-t border-white/20 overflow-hidden transition-transform duration-200"
      >
        {/* Mobile Bottom Sheet Grab Handle */}
        <div className="bg-[#141B2D] pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Top Bar */}
        <div className="bg-[#141B2D] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#C86D1F] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-white shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Nyaya Sahayak AI Legal Chat
              </h3>
              <p className="text-[11px] text-slate-300">
                Context-Aware · Google Search Grounded · {language}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenVoice}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[#D92D20] hover:bg-red-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
              title="Switch to Gemini Live Voice"
            >
              <Mic className="w-3.5 h-3.5 shrink-0" />
              <span>Voice</span>
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all shrink-0"
              aria-label="Close Chatbot"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Google Search Grounding & Multi-Step Booking Bar */}
        <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setUseSearchGrounding((v) => !v)}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              useSearchGrounding
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>
              Google Search Grounding: {useSearchGrounding ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBookingStep((s) => (s === 0 ? 1 : 0))}
            className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-[#B45309] border border-amber-200 font-medium flex items-center gap-1 transition-colors shrink-0"
          >
            <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Quick DLSA Booking</span>
          </button>
        </div>

        {/* Optional Multi-step Booking Drawer inside Chat */}
        {bookingStep > 0 && (
          <div className="bg-amber-50/90 border-b border-amber-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#9A3412] uppercase tracking-wider">
                Multi-Step Free Legal Aid Booking
              </span>
              <button
                onClick={() => setBookingStep(0)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-[11px] font-medium text-slate-700">
                1. Select Nearest Legal Aid Authority
              </label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs text-slate-900"
              >
                <option>DLSA Central Courts (Patiala House)</option>
                <option>Office of Deputy Labour Commissioner</option>
                <option>Nyaya Bandhu Tele-Law Video Clinic</option>
              </select>

              <label className="text-[11px] font-medium text-slate-700 mt-1">
                2. Preferred Consultation Slot
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Tomorrow, 11:00 AM",
                  "Tomorrow, 3:30 PM",
                  "Mon, 10:30 AM (Video)",
                  "Walk-in Token #14",
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                      selectedSlot === slot
                        ? "bg-[#141B2D] text-white border-[#141B2D]"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  onBookAppointment(selectedCenter, selectedSlot);
                  setBookingStep(0);
                }}
                className="mt-2 w-full py-2 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Confirm Free Legal Aid Slot
              </button>
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "bg-[#141B2D] text-white rounded-br-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[10px] font-semibold opacity-70">
                    {m.role === "user" ? "You" : "Nyaya Sahayak · Legal AI"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-60">{m.timestamp}</span>
                    {m.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => onSpeakText(m.text)}
                        className="text-slate-500 hover:text-[#C86D1F] transition-colors flex items-center justify-center"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-line">{m.text}</div>

                {/* Real-Time Google Search Grounding Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                      Verified Google Search Legal Sources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.slice(0, 4).map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium max-w-full truncate"
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
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-2xl px-4 py-3 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-[#C86D1F] shrink-0" />
              <span>
                Researching Indian laws & Google Search grounding...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 bg-white/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(qp, useSearchGrounding)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-[#9A3412] text-slate-700 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a legal question, cite a section, or book aid..."
            className="flex-1 bg-[#F6F4F0] text-slate-900 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 rounded-xl bg-[#141B2D] hover:bg-slate-800 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4 shrink-0" />
          </button>
        </form>
      </div>
    </div>
  );
};
