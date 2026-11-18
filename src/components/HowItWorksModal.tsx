import React from "react";
import {
  X,
  HelpCircle,
  ShieldCheck,
  Scale,
  FileText,
  Mic,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoice: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenVoice,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: "1",
      title: "Tell Us What Happened (Voice or Text)",
      desc: "Speak naturally in your mother tongue (33 Indian languages supported) or type. No legal jargon required—just explain your problem in everyday words.",
      icon: Mic,
      color: "bg-red-50 text-[#D92D20]",
    },
    {
      num: "2",
      title: "AI Finds Your Rights & Case Strength",
      desc: "Nyaya Sahayak instantly cross-references Indian Central & State laws (BNSS, Payment of Wages, Model Tenancy, Consumer Act) and rates your case strength.",
      icon: Sparkles,
      color: "bg-amber-50 text-[#C86D1F]",
    },
    {
      num: "3",
      title: "Generate a Formal Legal Notice in 1-Click",
      desc: "Prepare a formal statutory demand notice citing proper legal sections. 70% of wage and tenant deposit disputes are resolved here without going to court.",
      icon: FileText,
      color: "bg-blue-50 text-blue-700",
    },
    {
      num: "4",
      title: "Get 100% Free Government Lawyer (NALSA)",
      desc: "Eligible citizens (women, workers, low income, senior citizens) qualify for a free government advocate under Section 12 of the Legal Services Authorities Act.",
      icon: Scale,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const faqs = [
    {
      q: "Is this service really free?",
      a: "Yes, 100% free. Legal aid is a constitutional right in India under Article 39A and the Legal Services Authorities Act, 1987.",
    },
    {
      q: "Can I talk in Hindi, Bengali, Tamil, etc.?",
      a: "Yes! Nyaya Sahayak supports 33 Indian languages with Gemini Live voice recognition and automatic language translation.",
    },
    {
      q: "What should I do first?",
      a: "Tap the red microphone button on the home screen or type your problem in 2 sentences. You'll see your legal rights immediately.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-[#F6F4F0] rounded-t-3xl border-t border-slate-300 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#141B2D] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <HelpCircle className="w-4 h-4 text-[#E59849] shrink-0" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#141B2D]">
                How Nyaya Sahayak Helps You
              </h3>
              <p className="text-[10px] text-slate-500">
                Simple, Fast, & 100% Free Legal Aid
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-800">
          {/* 4 Simple Steps */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              4 Steps from Problem to Resolution
            </p>
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-start gap-3"
                >
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${st.color}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h4 className="text-xs font-bold text-[#141B2D]">
                      {st.num}. {st.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Citizen FAQs */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Common Citizen Questions
            </p>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1"
                >
                  <p className="text-xs font-bold text-[#141B2D] flex items-center gap-1.5">
                    <span className="text-[#C86D1F]">Q:</span> {faq.q}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency helpline reminder */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-900 leading-relaxed">
              <strong>Need urgent emergency help?</strong> Dial NALSA National
              Legal Aid: <strong>15100</strong> or Police Emergency:{" "}
              <strong>112</strong> (Toll-Free, 24/7).
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVoice();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#D92D20] hover:bg-red-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span>Talk with Live Voice Advisor Now</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
            >
              Got It, Continue to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
