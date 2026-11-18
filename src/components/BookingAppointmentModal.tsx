import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Download,
  Share2,
  ShieldCheck,
  Phone,
  FileText,
  User,
} from "lucide-react";
import jsPDF from "jspdf";

export interface BookingDetails {
  centerName: string;
  centerAddress: string;
  phone: string;
  date: string;
  slot: string;
  mode: "In-Person" | "Tele-Law Phone" | "Video Conference";
  language: string;
  token: string;
  caseCategory: string;
}

interface BookingAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: {
    name: string;
    address: string;
    phone: string;
    distance?: string;
  } | null;
  caseCategory: string;
  language: string;
  evidenceItems: string[];
  onConfirmBooking: (booking: BookingDetails) => void;
}

export const BookingAppointmentModal: React.FC<BookingAppointmentModalProps> = ({
  isOpen,
  onClose,
  center,
  caseCategory,
  language,
  evidenceItems,
  onConfirmBooking,
}) => {
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [selectedDate, setSelectedDate] = useState("Tomorrow, Oct 05, 2026");
  const [selectedSlot, setSelectedSlot] = useState("11:00 AM - 12:00 PM");
  const [selectedMode, setSelectedMode] = useState<
    "In-Person" | "Tele-Law Phone" | "Video Conference"
  >("In-Person");
  const [bookedDetails, setBookedDetails] = useState<BookingDetails | null>(
    null
  );
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [isCopiedShare, setIsCopiedShare] = useState(false);

  if (!isOpen || !center) return null;

  const dateOptions = [
    { label: "Tomorrow", date: "Tomorrow, Oct 05, 2026" },
    { label: "Monday", date: "Monday, Oct 07, 2026" },
    { label: "Wednesday", date: "Wednesday, Oct 09, 2026" },
  ];

  const slotOptions = [
    { id: "s1", time: "10:00 AM - 11:00 AM", tag: "Morning" },
    { id: "s2", time: "11:30 AM - 12:30 PM", tag: "Peak Slot" },
    { id: "s3", time: "02:30 PM - 03:30 PM", tag: "Afternoon" },
    { id: "s4", time: "04:30 PM - 05:30 PM", tag: "Evening" },
  ];

  const handleBook = () => {
    const token = `DLSA-${Math.floor(1000 + Math.random() * 9000)}`;
    const details: BookingDetails = {
      centerName: center.name,
      centerAddress: center.address,
      phone: center.phone,
      date: selectedDate,
      slot: selectedSlot,
      mode: selectedMode,
      language,
      token,
      caseCategory,
    };
    setBookedDetails(details);
    setStep("confirmed");
    onConfirmBooking(details);
  };

  const handleDownloadPdf = () => {
    if (!bookedDetails) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 20;
    let cursorY = 25;

    // Header Banner
    doc.setFillColor(20, 27, 45);
    doc.rect(margin, cursorY, 170, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "NATIONAL LEGAL SERVICES AUTHORITY (NALSA)",
      margin + 8,
      cursorY + 10
    );
    doc.setFontSize(10);
    doc.setTextColor(229, 152, 73);
    doc.text(
      "FREE LEGAL AID APPOINTMENT PASS & CITIZEN TOKEN",
      margin + 8,
      cursorY + 18
    );

    cursorY += 34;

    // Token Badge
    doc.setFillColor(246, 244, 240);
    doc.rect(margin, cursorY, 170, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(200, 109, 31);
    doc.text(`PRIORITY TOKEN: #${bookedDetails.token}`, margin + 8, cursorY + 8);
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Status: CONFIRMED · Guaranteed Free Legal Counsel under Section 12, LSA Act 1987`,
      margin + 8,
      cursorY + 15
    );

    cursorY += 28;

    // Appointment Info Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 27, 45);
    doc.text("APPOINTMENT SPECIFICATIONS", margin, cursorY);
    cursorY += 6;

    const items = [
      ["Authority / Center:", bookedDetails.centerName],
      ["Address:", bookedDetails.centerAddress],
      ["Contact Phone:", `${bookedDetails.phone} (NALSA Toll-Free: 15100)`],
      ["Scheduled Date:", bookedDetails.date],
      ["Time Slot:", bookedDetails.slot],
      ["Consultation Mode:", bookedDetails.mode],
      ["Subject / Category:", bookedDetails.caseCategory],
      ["Citizen Language:", bookedDetails.language],
    ];

    doc.setFontSize(9.5);
    items.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text(label, margin, cursorY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const splitVal = doc.splitTextToSize(val, 115);
      doc.text(splitVal, margin + 45, cursorY);
      cursorY += splitVal.length > 1 ? 9 : 6.5;
    });

    cursorY += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, cursorY, margin + 170, cursorY);
    cursorY += 8;

    // Instructions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 27, 45);
    doc.text("INSTRUCTIONS FOR YOUR VISIT", margin, cursorY);
    cursorY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const instructions = [
      "1. Arrive 15 minutes before your scheduled slot with this printed pass or digital screen.",
      "2. Bring a valid Government Photo ID (Aadhaar, Voter ID, PAN, or Ration Card).",
      `3. Carry physical copies of all dispute documents (${
        evidenceItems.length > 0 ? evidenceItems.join(", ") : "contracts, bank statements, notices"
      }).`,
      "4. You do NOT need to pay any consultation, fee, or drafting charges. All services are 100% free.",
      "5. For assistance or rescheduling, dial NALSA helpline 15100 or call the center directly.",
    ];
    instructions.forEach((inst) => {
      doc.text(inst, margin, cursorY);
      cursorY += 5;
    });

    // Footer
    cursorY = 275;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Nyaya Sahayak Citizen Legal Aid Assistant · Official Citizen Legal Document",
      margin,
      cursorY
    );

    doc.save(`DLSA_Appointment_Pass_${bookedDetails.token}.pdf`);
  };

  const handleShareWhatsApp = () => {
    if (!bookedDetails) return;
    const msg = `🏛️ *DLSA Free Legal Aid Appointment Pass*
Priority Token: #${bookedDetails.token}
Center: ${bookedDetails.centerName}
Address: ${bookedDetails.centerAddress}
Date & Time: ${bookedDetails.date} at ${bookedDetails.slot}
Mode: ${bookedDetails.mode}
Category: ${bookedDetails.caseCategory}
Helpline: 15100 (Toll-Free)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-[#F6F4F0] rounded-t-3xl border-t border-slate-300 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#C86D1F] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#141B2D]">
                {step === "form"
                  ? "Book Free Legal Aid Slot"
                  : "Appointment Confirmed"}
              </h3>
              <p className="text-[10px] text-slate-500">
                100% Free Counsel · Section 12 NALSA
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

        {/* Body Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-800">
          {step === "form" ? (
            <>
              {/* Selected Center Info Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-[#C86D1F] uppercase tracking-wider">
                    Assigned Legal Aid Center
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Zero Fees Guaranteed
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#141B2D] leading-snug">
                  {center.name}
                </h4>
                <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{center.address}</span>
                </p>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <a
                    href={`tel:${center.phone}`}
                    className="inline-flex items-center gap-1 font-bold text-[#C86D1F] hover:underline"
                  >
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{center.phone}</span>
                  </a>
                  <span className="text-slate-500 text-[10px]">
                    Case: {caseCategory}
                  </span>
                </div>
              </div>

              {/* Consultation Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      mode: "In-Person" as const,
                      desc: "At Court Clinic",
                    },
                    {
                      mode: "Tele-Law Phone" as const,
                      desc: "Advocate Calls You",
                    },
                    {
                      mode: "Video Conference" as const,
                      desc: "Online Video",
                    },
                  ].map((m) => {
                    const isSelected = selectedMode === m.mode;
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() => setSelectedMode(m.mode)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-[#141B2D] text-white border-[#141B2D] shadow-xs"
                            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-[11px] font-bold leading-tight">
                          {m.mode}
                        </p>
                        <p
                          className={`text-[9px] mt-0.5 ${
                            isSelected ? "text-amber-300" : "text-slate-500"
                          }`}
                        >
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Choose Preferred Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {dateOptions.map((d) => {
                    const isSelected = selectedDate === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDate(d.date)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-[#C86D1F] text-white border-[#C86D1F] shadow-xs"
                            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-[11px] font-bold leading-tight">
                          {d.label}
                        </p>
                        <p
                          className={`text-[9px] mt-0.5 ${
                            isSelected ? "text-white/80" : "text-slate-500"
                          }`}
                        >
                          {d.date.split(",")[1]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Choose Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {slotOptions.map((s) => {
                    const isSelected = selectedSlot === s.time;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSlot(s.time)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#141B2D] text-white border-[#141B2D]"
                            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <p className="text-[11px] font-bold">{s.time}</p>
                          <p
                            className={`text-[9px] ${
                              isSelected ? "text-amber-300" : "text-slate-500"
                            }`}
                          >
                            {s.tag}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Citizen Contact */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Citizen Contact (Optional for SMS / Call Alert)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="bg-[#F6F4F0] text-xs text-slate-900 placeholder-slate-400 p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
                  />
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="Mobile Number (Optional)"
                    className="bg-[#F6F4F0] text-xs text-slate-900 placeholder-slate-400 p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C86D1F]"
                  />
                </div>
              </div>

              {/* Citizen Guarantee Banner */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C86D1F] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#9A3412] leading-relaxed">
                  <strong>NALSA Guarantee:</strong> You will not be charged any
                  fee by the assigned lawyer or center staff. This service is
                  funded by the Government of India under the Legal Services
                  Authorities Act, 1987.
                </p>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleBook}
                className="w-full py-3 px-4 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Confirm Free Appointment Slot</span>
              </button>
            </>
          ) : (
            /* Confirmed Step: Digital DLSA Priority Pass */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Priority Pass Confirmed
                      </h4>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Token #{bookedDetails?.token}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    NALSA 15100
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Center:</span>
                    <strong className="text-slate-900 text-right max-w-[200px] truncate">
                      {bookedDetails?.centerName}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Scheduled Time:</span>
                    <strong className="text-[#C86D1F]">
                      {bookedDetails?.date} · {bookedDetails?.slot}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Mode:</span>
                    <strong className="text-slate-900">
                      {bookedDetails?.mode}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Language:</span>
                    <strong className="text-slate-900">
                      {bookedDetails?.language}
                    </strong>
                  </div>
                </div>

                {/* What to carry checklist */}
                <div className="p-3 rounded-xl bg-[#F6F4F0] border border-slate-200/80 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#141B2D] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#C86D1F] shrink-0" />
                    <span>Documents to Carry:</span>
                  </p>
                  <ul className="text-[11px] text-slate-700 space-y-1 pl-4 list-disc">
                    <li>Valid Government Photo ID (Aadhaar / Voter ID)</li>
                    <li>
                      Physical copies of case documents (
                      {evidenceItems.slice(0, 2).join(", ") ||
                        "bank statement, notices"}
                      )
                    </li>
                    <li>This token pass (digital on phone or printed)</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="py-2.5 px-3 rounded-xl bg-[#141B2D] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#E59849] shrink-0" />
                  <span>Download Pass (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Share via WhatsApp</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
              >
                Close & Return to App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
