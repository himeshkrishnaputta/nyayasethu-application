import { apiFetch } from "../api";
import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Check,
  Upload,
  AlertCircle,
  Highlighter,
  PenTool,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  FileSearch,
  Copy,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Scale,
} from "lucide-react";

export interface OcrResult {
  documentType: string;
  title: string;
  summary: string;
  extractedText: string;
  keyClauses: string[];
  structuredNoticeExcerpt: string;
  parties?: {
    firstParty?: string;
    secondParty?: string;
    dates?: string[];
    amounts?: string[];
  };
}

interface CameraCaptureModalProps {
  isOpen: boolean;
  evidenceTitle: string;
  initialPhotos?: string[];
  situationContext?: string;
  language?: string;
  onClose: () => void;
  onCaptureComplete: (
    evidenceTitle: string,
    imageDataUrls: string[],
    triggerAiReview?: boolean
  ) => void;
  onApplyOcrToNotice?: (
    structuredText: string,
    metadata: {
      documentTitle: string;
      documentType: string;
      clauses: string[];
      excerpt: string;
    }
  ) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  evidenceTitle,
  initialPhotos = [],
  situationContext = "",
  language = "English",
  onClose,
  onCaptureComplete,
  onApplyOcrToNotice,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [markupTool, setMarkupTool] = useState<"highlight" | "pen">("highlight");

  // OCR state
  const [activeTab, setActiveTab] = useState<"photo" | "ocr">("photo");
  const [isExtractingOcr, setIsExtractingOcr] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrError, setOcrError] = useState<string>("");
  const [editableNoticeExcerpt, setEditableNoticeExcerpt] = useState<string>("");
  const [copiedExcerpt, setCopiedExcerpt] = useState<boolean>(false);
  const [copiedRawText, setCopiedRawText] = useState<boolean>(false);
  const [appliedToNoticeSuccess, setAppliedToNoticeSuccess] = useState<boolean>(false);
  const [showRawText, setShowRawText] = useState<boolean>(false);

  const capturedPreview =
    activePhotoIndex !== null && photos[activePhotoIndex]
      ? photos[activePhotoIndex]
      : null;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: "environment" | "user") => {
    stopCamera();
    setCameraError("");
    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError(
        err?.message ||
          "Could not access device camera. You can also upload or capture photos using the Files button below."
      );
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhotos([]);
      setActivePhotoIndex(null);
      setCameraError("");
      setOcrResult(null);
      setOcrError("");
      setActiveTab("photo");
      setAppliedToNoticeSuccess(false);
      return;
    }

    if (initialPhotos && initialPhotos.length > 0) {
      stopCamera();
      setPhotos(initialPhotos);
      setActivePhotoIndex(initialPhotos.length - 1);
    } else {
      setPhotos([]);
      setActivePhotoIndex(null);
      startCamera(facingMode);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, evidenceTitle]);

  useEffect(() => {
    if (isOpen && activePhotoIndex === null) {
      startCamera(facingMode);
    }
  }, [facingMode]);

  const syncOverlayCanvasSize = () => {
    const overlay = overlayCanvasRef.current;
    const img = previewImgRef.current;
    if (!overlay || !img) return;
    overlay.width = img.naturalWidth || 800;
    overlay.height = img.naturalHeight || 600;
  };

  const clearMarkupOverlay = () => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  const getCanvasCoords = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return null;
    const rect = overlay.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const scaleX = overlay.width / rect.width;
    const scaleY = overlay.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const overlay = overlayCanvasRef.current;
    const coords = getCanvasCoords(e);
    if (!overlay || !coords) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (markupTool === "highlight") {
      ctx.strokeStyle = "rgba(250, 204, 21, 0.42)";
      ctx.lineWidth = Math.max(18, overlay.width * 0.032);
    } else {
      ctx.strokeStyle = "rgba(220, 38, 38, 0.92)";
      ctx.lineWidth = Math.max(4, overlay.width * 0.006);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const overlay = overlayCanvasRef.current;
    const coords = getCanvasCoords(e);
    if (!overlay || !coords) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  if (!isOpen) return null;

  const commitActiveMarkupToPhotos = (): string[] => {
    if (activePhotoIndex === null || !photos[activePhotoIndex]) return photos;
    const img = previewImgRef.current;
    const overlay = overlayCanvasRef.current;
    const canvas = canvasRef.current;
    if (!img || !overlay || !canvas) return photos;

    const width = img.naturalWidth || 800;
    const height = img.naturalHeight || 600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return photos;

    ctx.drawImage(img, 0, 0, width, height);
    ctx.drawImage(overlay, 0, 0, width, height);
    const mergedUrl = canvas.toDataURL("image/jpeg", 0.88);
    const updated = [...photos];
    updated[activePhotoIndex] = mergedUrl;
    clearMarkupOverlay();
    setPhotos(updated);
    return updated;
  };

  const handleSnapPhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 800;
    const height = video.videoHeight || 600;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const nextPhotos = [...photos, dataUrl];
    setPhotos(nextPhotos);
    setActivePhotoIndex(nextPhotos.length - 1);
    stopCamera();
  };

  const handleAddAnotherPhoto = () => {
    commitActiveMarkupToPhotos();
    setActivePhotoIndex(null);
    setActiveTab("photo");
    startCamera(facingMode);
  };

  const handleDeletePhotoAt = (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx);
    setPhotos(updated);
    clearMarkupOverlay();
    if (updated.length === 0) {
      setActivePhotoIndex(null);
      setOcrResult(null);
      startCamera(facingMode);
    } else {
      setActivePhotoIndex(Math.min(idx, updated.length - 1));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotos((prev) => {
            const updated = [...prev, reader.result as string];
            setActivePhotoIndex(updated.length - 1);
            return updated;
          });
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // OCR Execution Handler
  const handleRunOcr = async () => {
    const currentPhotos = commitActiveMarkupToPhotos();
    if (currentPhotos.length === 0) return;

    setIsExtractingOcr(true);
    setOcrError("");
    setActiveTab("ocr");

    try {
      const res = await apifetch("/api/ocr-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoDataUrls: currentPhotos,
          photoDataUrl: currentPhotos[activePhotoIndex ?? 0] || currentPhotos[0],
          evidenceTitle,
          situation: situationContext,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`OCR service returned status ${res.status}`);
      }

      const data: OcrResult = await res.json();
      setOcrResult(data);
      setEditableNoticeExcerpt(data.structuredNoticeExcerpt || "");
    } catch (err: any) {
      console.error("OCR extraction failed:", err);
      setOcrError(err?.message || "Failed to extract text from document photos.");
    } finally {
      setIsExtractingOcr(false);
    }
  };

  const handleApplyToLegalNotice = () => {
    if (!ocrResult || !editableNoticeExcerpt.trim()) return;
    if (onApplyOcrToNotice) {
      onApplyOcrToNotice(editableNoticeExcerpt.trim(), {
        documentTitle: evidenceTitle,
        documentType: ocrResult.documentType,
        clauses: ocrResult.keyClauses,
        excerpt: editableNoticeExcerpt.trim(),
      });
    }
    setAppliedToNoticeSuccess(true);
    setTimeout(() => setAppliedToNoticeSuccess(false), 3000);
  };

  const handleSaveAll = (triggerAiReview = false) => {
    const finalPhotos = commitActiveMarkupToPhotos();
    if (finalPhotos.length === 0) return;
    onCaptureComplete(evidenceTitle, finalPhotos, triggerAiReview);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs sm:p-4 select-none"
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

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-[#C86D1F] flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 text-white shrink-0" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold tracking-tight truncate">
                {photos.length > 0
                  ? `Evidence Scanner (${photos.length} Page${
                      photos.length === 1 ? "" : "s"
                    })`
                  : "Capture Document Evidence"}
              </h3>
              <p className="text-[11px] text-amber-300 truncate">
                {evidenceTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {photos.length > 0 && (
              <button
                type="button"
                onClick={handleRunOcr}
                disabled={isExtractingOcr}
                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs ${
                  activeTab === "ocr" && ocrResult
                    ? "bg-amber-500 text-slate-900 border border-amber-300"
                    : "bg-[#C86D1F] hover:bg-[#b55f17] text-white"
                }`}
                title="Extract document text and clauses using AI OCR"
              >
                {isExtractingOcr ? (
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                ) : (
                  <FileSearch className="w-3 h-3 shrink-0" />
                )}
                <span>{isExtractingOcr ? "Scanning..." : "AI OCR"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close Camera"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs when photos exist */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 bg-[#0F1523] border-b border-white/10 p-1 text-[11px] font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("photo")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "photo"
                  ? "bg-[#1E293B] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>Photo & Markup</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("ocr");
                if (!ocrResult && !isExtractingOcr) {
                  handleRunOcr();
                }
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors relative ${
                activeTab === "ocr"
                  ? "bg-[#1E293B] text-amber-300 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Extracted OCR Clauses</span>
              {ocrResult && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-0.5" />
              )}
            </button>
          </div>
        )}

        {/* TAB 1: PHOTO & MARKUP VIEWER */}
        {activeTab === "photo" && (
          <>
            {/* Markup Toolbar when viewing a captured document page */}
            {capturedPreview && (
              <div className="px-4 py-2 bg-[#1B243B] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMarkupTool("highlight")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      markupTool === "highlight"
                        ? "bg-amber-400 text-[#141B2D]"
                        : "bg-white/10 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    <Highlighter className="w-3 h-3 shrink-0" />
                    <span>Highlight</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkupTool("pen")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      markupTool === "pen"
                        ? "bg-red-600 text-white"
                        : "bg-white/10 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    <PenTool className="w-3 h-3 shrink-0" />
                    <span>Red Pen</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={clearMarkupOverlay}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] text-slate-200 font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3 shrink-0" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Viewfinder or Captured Image + Interactive Canvas Overlay */}
            <div className="relative bg-black aspect-4/3 w-full flex items-center justify-center overflow-hidden shrink-0">
              {capturedPreview ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={previewImgRef}
                    src={capturedPreview}
                    alt={`Captured ${evidenceTitle} page ${(activePhotoIndex ?? 0) + 1}`}
                    referrerPolicy="no-referrer"
                    onLoad={syncOverlayCanvasSize}
                    className="w-full h-full object-contain select-none pointer-events-none"
                  />
                  {/* Interactive Canvas Markup Overlay */}
                  <canvas
                    ref={overlayCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
                  />
                  <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/65 text-[10px] text-amber-200 font-medium whitespace-nowrap">
                    Page {(activePhotoIndex ?? 0) + 1} of {photos.length} · Draw to highlight clauses before OCR
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Document Alignment Frame Overlay */}
                  <div className="pointer-events-none absolute inset-5 border-2 border-dashed border-amber-400/70 rounded-2xl flex items-end justify-center pb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-[10px] text-amber-200 font-medium">
                      Position document page #{photos.length + 1} inside frame
                    </span>
                  </div>
                </>
              )}

              {isStarting && !capturedPreview && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-slate-300">
                  Starting camera...
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Multi-Photo Thumbnail Strip */}
            {photos.length > 0 && (
              <div className="px-4 py-2 bg-[#161F33] border-t border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
                {photos.map((url, idx) => {
                  const isSelected = activePhotoIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        commitActiveMarkupToPhotos();
                        stopCamera();
                        setActivePhotoIndex(idx);
                      }}
                      className={`relative h-12 w-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#E59849] scale-105"
                          : "border-white/20 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Page ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 left-1 px-1 rounded bg-black/75 text-[8px] font-bold text-white">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhotoAt(idx);
                        }}
                        className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center shrink-0"
                        title="Delete Page"
                      >
                        <Trash2 className="w-2.5 h-2.5 shrink-0" />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddAnotherPhoto}
                  className={`h-12 px-2.5 rounded-lg border border-dashed flex flex-col items-center justify-center shrink-0 text-[10px] font-semibold transition-colors ${
                    activePhotoIndex === null
                      ? "border-[#E59849] bg-amber-500/20 text-amber-200"
                      : "border-white/30 hover:border-amber-300 text-slate-300"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Add Page</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB 2: EXTRACTED OCR CLAUSES & NOTICE INTEGRATION */}
        {activeTab === "ocr" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#0F1523]/95">
            {isExtractingOcr ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/20 animate-ping absolute" />
                  <div className="h-14 w-14 rounded-2xl bg-[#C86D1F] flex items-center justify-center text-white relative z-10 shadow-lg">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    AI Multimodal Document OCR
                  </h4>
                  <p className="text-[11px] text-slate-300 max-w-xs">
                    Transcribing document text, identifying contractual clauses, and structuring draft notice language...
                  </p>
                </div>
              </div>
            ) : ocrError ? (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 space-y-2">
                <div className="flex items-center gap-1.5 text-red-300 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>OCR Extraction Notice</span>
                </div>
                <p className="text-[11px] text-red-200">{ocrError}</p>
                <button
                  type="button"
                  onClick={handleRunOcr}
                  className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-[11px] font-bold"
                >
                  Retry OCR Scan
                </button>
              </div>
            ) : ocrResult ? (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* Document Type & Evidentiary Significance Card */}
                <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-white/15 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                      {ocrResult.documentType}
                    </span>
                    <span className="text-[9px] text-amber-300 font-mono">
                      Verified Legal Evidence
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    {ocrResult.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {ocrResult.summary}
                  </p>
                </div>

                {/* Key Legal Clauses List */}
                {ocrResult.keyClauses && ocrResult.keyClauses.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Scale className="w-3 h-3 shrink-0" />
                      <span>Extracted Contractual Clauses & Stipulations:</span>
                    </p>
                    <div className="space-y-1.5">
                      {ocrResult.keyClauses.map((clause, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-200 leading-snug">
                            {clause}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Notice Draft Excerpt Card */}
                <div className="p-3.5 rounded-2xl bg-[#1B243B] border border-amber-400/40 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Structured Excerpt for Legal Notice Draft</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(editableNoticeExcerpt);
                        setCopiedExcerpt(true);
                        setTimeout(() => setCopiedExcerpt(false), 2000);
                      }}
                      className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3 shrink-0" />
                      <span>{copiedExcerpt ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editableNoticeExcerpt}
                    onChange={(e) => setEditableNoticeExcerpt(e.target.value)}
                    className="w-full bg-[#0F1523] text-amber-100 font-mono text-[11px] p-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-[#C86D1F] leading-relaxed resize-none"
                    placeholder="Extracted clauses formulated for legal notice..."
                  />

                  {/* Primary 1-Click Action: Insert into Legal Notice Draft */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleApplyToLegalNotice}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      {appliedToNoticeSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-white shrink-0" />
                          <span>✓ Inserted into Legal Notice Draft!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
                          <span>Insert into Legal Notice Draft</span>
                        </>
                      )}
                    </button>
                    {appliedToNoticeSuccess && (
                      <p className="text-[10px] text-emerald-300 text-center font-semibold mt-1 animate-in fade-in">
                        Document clauses seamlessly integrated into Screen 3 Notice Generator!
                      </p>
                    )}
                  </div>
                </div>

                {/* Collapsible Full Verbatim Extracted Text */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                  <button
                    type="button"
                    onClick={() => setShowRawText((prev) => !prev)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-300 hover:text-white"
                  >
                    <span>Full Verbatim OCR Transcript</span>
                    {showRawText ? (
                      <ChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                  {showRawText && (
                    <div className="p-3 border-t border-white/10 bg-[#0A0E1A] space-y-2">
                      <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                        {ocrResult.extractedText}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(ocrResult.extractedText);
                          setCopiedRawText(true);
                          setTimeout(() => setCopiedRawText(false), 2000);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3 shrink-0" />
                        <span>{copiedRawText ? "Copied Transcript!" : "Copy Full Transcript"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <FileSearch className="w-10 h-10 text-amber-400/60" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    No OCR Scan Generated Yet
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Tap the button below to transcribe this document photo and formulate structured clauses for your legal notice draft.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunOcr}
                  className="px-4 py-2 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <FileSearch className="w-4 h-4 shrink-0" />
                  <span>Run AI OCR Extraction</span>
                </button>
              </div>
            )}
          </div>
        )}

        {cameraError && !capturedPreview && activeTab === "photo" && (
          <div className="px-4 py-2.5 bg-amber-500/20 border-t border-amber-400/30 text-amber-200 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Controls Footer */}
        <div className="p-3.5 bg-[#0F1523] border-t border-white/10 space-y-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!capturedPreview ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFacingMode((m) =>
                      m === "environment" ? "user" : "environment"
                    )
                  }
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Switch Front/Rear Camera"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Flip</span>
                </button>

                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  disabled={!!cameraError}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>Capture Photo #{photos.length + 1}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Upload One or Multiple Photos from Device"
                >
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span>Files</span>
                </button>
              </div>

              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(photos.length - 1)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Done Capturing ({photos.length} Saved)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAnotherPhoto}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Add Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAll(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-colors"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Save {photos.length} Photo(s)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRunOcr}
                  disabled={isExtractingOcr}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  {isExtractingOcr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <FileSearch className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{isExtractingOcr ? "Scanning..." : "AI OCR Extract"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAll(true)}
                  className="py-2.5 px-3 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>AI Legal Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
