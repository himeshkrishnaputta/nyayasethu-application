import React, { createContext, useContext } from "react";

export type SupportedLanguage = string;

export const ALL_SUPPORTED_LANGUAGES: string[] = [
  "English",
  "हिन्दी (Hindi)",
  "বাংলা (Bengali)",
  "తెలుగు (Telugu)",
  "मराठी (Marathi)",
  "தமிழ் (Tamil)",
  "ગુજરાતી (Gujarati)",
  "اردو (Urdu)",
  "ಕನ್ನಡ (Kannada)",
  "ଓଡ଼ିଆ (Odia)",
  "മലയാളം (Malayalam)",
  "ਪੰਜਾਬੀ (Punjabi)",
  "অসমীয়া (Assamese)",
  "मैथिली (Maithili)",
  "संस्कृतम् (Sanskrit)",
  "کٲشُر / कश्मीरी (Kashmiri)",
  "नेपाली (Nepali)",
  "कोंकणी (Konkani)",
  "सिन्धी / سنڌي (Sindhi)",
  "डोगरी (Dogri)",
  "মৈতৈলোন্ (Manipuri (Meitei))",
  "बर' (Bodo)",
  "ᱥᱟᱱᱛᱟᱲᱤ (Santali)",
  "भोजपुरी (Bhojpuri)",
  "राजस्थानी (Rajasthani)",
  "हरियाणवी (Haryanvi)",
  "छत्तीसगढ़ी (Chhattisgarhi)",
  "ತುಳು (Tulu)",
  "गढ़वाली (Garhwali)",
  "कुमाऊँनी (Kumaoni)",
  "Mizo ṭawng (Mizo)",
  "Ka Ktien Khasi (Khasi)",
  "A·chik (Garo)",
];

export function detectLanguageFromTranscript(
  text: string,
  currentLanguage: string
): string | null {
  if (!text || text.trim().length < 2) return null;
  const sample = text.trim();

  // 1. Check explicit language tag or language name in brackets e.g. [LANG: Bengali] or [Hindi]
  for (const lang of ALL_SUPPORTED_LANGUAGES) {
    const englishNameMatch = lang.match(/\(([^)]+)\)/);
    const englishName = englishNameMatch ? englishNameMatch[1] : lang;
    const escaped = englishName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tagRegex = new RegExp(
      `(?:\\[LANG:\\s*${escaped}\\]|\\bspokenLanguage:\\s*${escaped}\\b)`,
      "i"
    );
    if (tagRegex.test(sample)) {
      return lang;
    }
  }

  // 2. Script-based & lexical automatic detection across all 33 languages
  if (/[\u1C50-\u1C7F]/.test(sample)) return "ᱥᱟᱱᱛᱟᱲᱤ (Santali)";
  if (/[\uABC0-\uABFF]/.test(sample)) return "মৈতৈলোন্ (Manipuri (Meitei))";
  if (/[\u0C00-\u0C7F]/.test(sample)) return "తెలుగు (Telugu)";
  if (/[\u0B80-\u0BFF]/.test(sample)) return "தமிழ் (Tamil)";
  if (/[\u0A80-\u0AFF]/.test(sample)) return "ગુજરાતી (Gujarati)";
  if (/[\u0B00-\u0B7F]/.test(sample)) return "ଓଡ଼ିଆ (Odia)";
  if (/[\u0D00-\u0D7F]/.test(sample)) return "മലയാളം (Malayalam)";
  if (/[\u0A00-\u0A7F]/.test(sample)) return "ਪੰਜਾਬੀ (Punjabi)";
  if (/[\u0C80-\u0CFF]/.test(sample)) {
    if (/\b(ಇಂಚ|ಉಂಡು|ಪನ್ಲೆ|ತುಳು)\b/.test(sample) || currentLanguage === "ತುಳು (Tulu)") {
      return "ತುಳು (Tulu)";
    }
    return "ಕನ್ನಡ (Kannada)";
  }
  if (/[\u0600-\u06FF]/.test(sample)) {
    if (/[\u0672\u0673\u06C0\u06C4]/.test(sample) || currentLanguage.includes("Kashmiri")) {
      return "کٲشُر / कश्मीरी (Kashmiri)";
    }
    if (/[\u067B\u067D\u0680\u0684\u0687]/.test(sample) || currentLanguage.includes("Sindhi")) {
      return "सिन्धी / سنڌي (Sindhi)";
    }
    return "اردو (Urdu)";
  }
  if (/[\u0980-\u09FF]/.test(sample)) {
    // Assamese specific characters ৰ (\u09F0), ৱ (\u09F1)
    if (/[\u09F0\u09F1]/.test(sample)) {
      return "অসমীয়া (Assamese)";
    }
    if (/ঐহাক|নুংঙাইজরি|মৈতৈ/.test(sample) || currentLanguage.includes("Manipuri")) {
      return "মৈতৈলোন্ (Manipuri (Meitei))";
    }
    return "বাংলা (Bengali)";
  }
  if (/[\u0900-\u097F]/.test(sample)) {
    // Always check distinctive dialect markers first so users can switch between Devanagari languages!
    if (/ळ/.test(sample) || /\b(आहे|माझी|तुमची|कायदा|मला|नाहीये|सांगा)\b/.test(sample)) {
      return "मराठी (Marathi)";
    }
    if (/\b(छै|अछि|केना|अहाँ|हमर)\b/.test(sample)) return "मैथिली (Maithili)";
    if (/\b(रउआ|हमार|भइल|बाटे|कईसन|नइखे|बताईं)\b/.test(sample)) {
      return "भोजपुरी (Bhojpuri)";
    }
    if (/\b(म्हारो|थारो|घणो|कठे|सा|कोनी)\b/.test(sample)) {
      return "राजस्थानी (Rajasthani)";
    }
    if (/\b(मन्ने|तन्ने|सै|कोन्या|के|खातर)\b/.test(sample)) {
      return "हरियाणवी (Haryanvi)";
    }
    if (/\b(मोर|तोर|हवय|संगवारी|काबर|बतावव)\b/.test(sample)) {
      return "छत्तीसगढ़ी (Chhattisgarhi)";
    }
    if (/\b(छन|ग्यो|हमारु|कख|त्वे)\b/.test(sample)) return "गढ़वाली (Garhwali)";
    if (/\b(छू|म्यर|त्यर|कतुक)\b/.test(sample)) return "कुमाऊँनी (Kumaoni)";
    if (/\b(छ|पर्छ|मेरो|तपाईं|हजुर|गर्नुहोस्)\b/.test(sample)) {
      return "नेपाली (Nepali)";
    }
    if (/\b(भवतः|अस्ति|किम्|कथम्|सहायताम्)\b/.test(sample)) {
      return "संस्कृतम् (Sanskrit)";
    }
    if (/\b(हांव|तुका|माका|आसा|कोंकणी)\b/.test(sample)) return "कोंकणी (Konkani)";
    if (/\b(असें|तुसें|डोगरी|कुत्थै)\b/.test(sample)) return "डोगरी (Dogri)";
    if (/\b(आं|नों|दं|मावनाय)\b/.test(sample)) return "बर' (Bodo)";

    const devanagariLanguages = [
      "हिन्दी (Hindi)",
      "मराठी (Marathi)",
      "मैथिली (Maithili)",
      "संस्कृतम् (Sanskrit)",
      "नेपाली (Nepali)",
      "कोंकणी (Konkani)",
      "डोगरी (Dogri)",
      "बर' (Bodo)",
      "भोजपुरी (Bhojpuri)",
      "राजस्थानी (Rajasthani)",
      "हरियाणवी (Haryanvi)",
      "छत्तीसगढ़ी (Chhattisgarhi)",
      "गढ़वाली (Garhwali)",
      "कुमाऊँनी (Kumaoni)",
      "कٲشُر / कश्मीरी (Kashmiri)",
      "सिन्धी / سنڌي (Sindhi)",
    ];
    if (devanagariLanguages.includes(currentLanguage)) {
      return currentLanguage;
    }
    return "हिन्दी (Hindi)";
  }
  if (/^[A-Za-z0-9\s.,?!'"·₹-]+$/.test(sample) && sample.length > 6) {
    if (/\b(ka|ki|nga|jong|u|ka ktien|jing|aiñ)\b/i.test(sample)) {
      return "Ka Ktien Khasi (Khasi)";
    }
    if (/\b(chibai|kan|ṭawng|zirtir|dan|puihna)\b/i.test(sample)) {
      return "Mizo ṭawng (Mizo)";
    }
    if (/\b(ang|na·a|dongja|dakchakani|niam)\b/i.test(sample)) {
      return "A·chik (Garo)";
    }
    // If user speaks clear English words while another non-Latin language is selected, switch to English
    if (
      /\b(the|my|is|not|have|help|what|how|can|employer|landlord|police|lawyer|legal|rights|salary)\b/i.test(
        sample
      )
    ) {
      return "English";
    }
  }
  return null;
}

export interface UITranslations {
  // Header & Navigation
  appTitle: string;
  appSubtitle: string;
  navHome: string;
  navExplainLaw: string;
  navTrackCase: string;
  navFindAid: string;
  screen1Title: string;
  screen2Title: string;
  screen3Title: string;
  screen4Title: string;
  screen5Title: string;
  screen6Title: string;
  all6ScreensView: string;
  focusedView: string;
  liveVoiceBtn: string;
  aiLegalChatBtn: string;
  interactiveJourneyKicker: string;
  switchOrInspectHeading: string;
  open6ScreenCanvas: string;

  // Screen 1: Describe Situation
  nalsaBannerTitle: string;
  nalsaBannerSub: string;
  getAidBtn: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  tapToSpeakTitle: string;
  tapToSpeakSub: string;
  typeProblemPlaceholder: string;
  recordVoiceNoteTitle: string;
  recordingVoiceNoteTitle: string;
  recordVoiceNoteSub: string;
  recordingInBackgroundSub: string;
  recordNoteBtn: string;
  stopAndSaveBtn: string;
  commonSituationsHeader: string;
  confidentialityBold: string;
  confidentialityText: string;
  understandRightsHeader: string;
  viewAllBtn: string;
  catPropertyTitle: string;
  catPropertyDesc: string;
  catLabourTitle: string;
  catLabourDesc: string;
  catFamilyTitle: string;
  catFamilyDesc: string;
  catConsumerTitle: string;
  catConsumerDesc: string;
  popularBadge: string;
  citizenGuidesHeader: string;
  seeMoreBtn: string;
  readGuideBtn: string;
  tryCaseBtn: string;
  needGuidanceTitle: string;
  needGuidanceSub: string;
  openChatBtn: string;

  // Screen 2: AI Legal Assessment
  aiAssessmentKicker: string;
  listenBtn: string;
  stopBtn: string;
  yourSituationLabel: string;
  editBtn: string;
  addByVoiceBtn: string;
  askFollowUpBtn: string;
  analyzingStatutesText: string;
  whatLawSaysTitle: string;
  questionsToStrengthenTitle: string;
  tapToAnswerLabel: string;
  recommendedNextStepsTitle: string;
  prepareNoticeCta: string;

  // Screen 3: Prepare Legal Action
  prepareActionHeader: string;
  askAiAssistantBtn: string;
  step2Of3Label: string;
  readyLabel: string;
  whyNoticeTitle: string;
  whyNoticeBody: string;
  evidenceChecklistHeader: string;
  scanDocumentBtn: string;
  capturePhotoBtn: string;
  retakePhotoBtn: string;
  eligibilityHeader: string;
  aiNoticeDraftHeader: string;
  customizeWithAiBtn: string;
  draftingText: string;
  copyNoticeBtn: string;
  copiedNoticeBtn: string;
  saveAndProceedBtn: string;

  // Screen 4: Explain Law
  activeJurisdictionLabel: string;
  centralAndStateLabel: string;
  searchLawPlaceholder: string;
  askAiShortBtn: string;
  googleSearchConnectedNote: string;
  matchingSectionsLabel: string;
  explainWithAiBtn: string;
  faqHeader: string;
  unsureSectionTitle: string;
  unsureSectionSub: string;
  chatNowBtn: string;

  // Screen 5: Track Case & Action Plan
  actionPlanTab: string;
  draftsEvidenceTab: string;
  caseHistoryTab: string;
  actionPlanStatusTitle: string;
  completeSuffix: string;
  completedStepsLabel: string;
  inProgressLabel: string;
  pendingActionsLabel: string;
  tapCircleHint: string;
  stepTimelineHeader: string;
  savedNoticeHeader: string;
  editDraftBtn: string;
  exportPdfBtn: string;
  exportedPdfBtn: string;
  attachedEvidenceHeader: string;
  recordedVoiceNotesHeader: string;
  recordNewBtn: string;
  noVoiceNotesText: string;
  caseHistoryHeader: string;
  loggedEventsSuffix: string;
  logMilestonePlaceholder: string;
  logBtn: string;
  limitationAlertTitle: string;
  needPlvTitle: string;
  needPlvSub: string;

  // Screen 6: Find Free Legal Aid
  findAidHeader: string;
  findAidSub: string;
  searchCenterPlaceholder: string;
  bookTokenBtn: string;
  askAiGuideBtn: string;
  emergencyHelplinesTitle: string;
  needTeleLawTitle: string;
  needTeleLawSub: string;
  startVoiceCallBtn: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, UITranslations> = {
  English: {
    appTitle: "NYAYA SAHAYAK",
    appSubtitle: "Citizen Legal Aid",
    navHome: "Home",
    navExplainLaw: "Explain Law",
    navTrackCase: "Track Case",
    navFindAid: "Find Aid",
    screen1Title: "1. Describe Situation",
    screen2Title: "2. AI Legal Assessment",
    screen3Title: "3. Notice & Eligibility",
    screen4Title: "4. Explain Law",
    screen5Title: "5. Track Action Plan",
    screen6Title: "6. Nearby Legal Aid",
    all6ScreensView: "All 6 Screens View",
    focusedView: "Focused View",
    liveVoiceBtn: "Live Voice",
    aiLegalChatBtn: "AI Legal Chat",
    interactiveJourneyKicker: "Interactive 6-Screen Citizen Journey",
    switchOrInspectHeading: "Switch Screens or Inspect All 6 Side-by-Side",
    open6ScreenCanvas: "Open 6-Screen Canvas",

    nalsaBannerTitle: "Free Legal Aid Under NALSA",
    nalsaBannerSub: "24×7 Toll-Free National Helpline 15100",
    getAidBtn: "Get Aid →",
    heroKicker: "AI Legal Guidance in Your Language",
    heroTitle: "How may I help you today?",
    heroSubtitle:
      "Describe your legal situation in simple words—by voice or text in any of 33 Indian languages—to understand your rights and next steps.",
    tapToSpeakTitle: "Tap to speak with Gemini Live Voice",
    tapToSpeakSub: "Supports Hindi, English, Marathi, Tamil & Telugu",
    typeProblemPlaceholder: "Or type your problem here...",
    recordVoiceNoteTitle: "Record Voice Note for Evidence Store",
    recordingVoiceNoteTitle: "Recording Voice Note",
    recordVoiceNoteSub: "Save verbal statement to Evidence Store",
    recordingInBackgroundSub: "Recording in background · Tap Stop to save file",
    recordNoteBtn: "Record Note",
    stopAndSaveBtn: "Stop & Save",
    commonSituationsHeader: "Common Citizen Situations (Tap to Analyze)",
    confidentialityBold: "100% Confidential & Free Information:",
    confidentialityText:
      "Provides verified Indian legal rights & procedures. Not a substitute for a courtroom advocate.",
    understandRightsHeader: "Understand Your Rights",
    viewAllBtn: "View All →",
    catPropertyTitle: "Property & Tenancy",
    catPropertyDesc: "Deposit refund, illegal eviction, rent laws",
    catLabourTitle: "Labour & Wages",
    catLabourDesc: "Unpaid salary, PF, wrongful dismissal",
    catFamilyTitle: "Family & Women",
    catFamilyDesc: "Domestic violence, maintenance, residence",
    catConsumerTitle: "Consumer & Cyber",
    catConsumerDesc: "UPI fraud, defective goods, e-Daakhil",
    popularBadge: "POPULAR",
    citizenGuidesHeader: "Citizen Guides & Case Stories",
    seeMoreBtn: "See More →",
    readGuideBtn: "Read Guide →",
    tryCaseBtn: "Try This Case →",
    needGuidanceTitle: "Need Interactive AI Guidance?",
    needGuidanceSub: "Chat with Google Search-grounded Legal AI",
    openChatBtn: "Open Chat",

    aiAssessmentKicker: "AI Legal Assessment",
    listenBtn: "Listen",
    stopBtn: "Stop",
    yourSituationLabel: "Your Described Situation",
    editBtn: "Edit",
    addByVoiceBtn: "Add by Voice",
    askFollowUpBtn: "Ask Follow-up",
    analyzingStatutesText: "Analyzing Indian Statutes & Relevant Sections...",
    whatLawSaysTitle: "What the Law Says in Simple Words",
    questionsToStrengthenTitle: "Questions to Strengthen Your Case",
    tapToAnswerLabel: "Tap to answer",
    recommendedNextStepsTitle: "Recommended Next Steps",
    prepareNoticeCta: "Prepare My Legal Notice & Action Plan →",

    prepareActionHeader: "Prepare Legal Action",
    askAiAssistantBtn: "Ask AI Assistant",
    step2Of3Label: "Step 2 of 3 · Evidence & Legal Notice",
    readyLabel: "66% Ready",
    whyNoticeTitle: "Why start with a Formal Written Demand Notice?",
    whyNoticeBody:
      "In over 68% of unpaid wage and rent deposit disputes, sending a structured written demand citing exact statutory penalties resolves the matter within 15 days without going to court.",
    evidenceChecklistHeader: "1. Evidence Checklist",
    scanDocumentBtn: "Scan Document",
    capturePhotoBtn: "Capture Photo",
    retakePhotoBtn: "Retake Photo",
    eligibilityHeader: "2. Free Legal Aid Eligibility (NALSA)",
    aiNoticeDraftHeader: "3. AI Legal Notice Draft",
    customizeWithAiBtn: "Customize with AI",
    draftingText: "Drafting...",
    copyNoticeBtn: "Copy / Download Legal Notice Draft",
    copiedNoticeBtn: "Copied Notice to Clipboard!",
    saveAndProceedBtn: "Save & Proceed to Action Plan Tracker →",

    activeJurisdictionLabel: "Active Jurisdiction",
    centralAndStateLabel: "India · Central & State Statutes",
    searchLawPlaceholder: "Search Act, Section (e.g. Sec 15, FIR, Deposit)...",
    askAiShortBtn: "Ask AI",
    googleSearchConnectedNote:
      "Connected to real-time Google Search for BNS 2023 & Supreme Court updates",
    matchingSectionsLabel: "Matching Statutory Sections",
    explainWithAiBtn: "Explain with AI",
    faqHeader: "Frequently Asked Citizen Questions",
    unsureSectionTitle: "Unsure which section applies to you?",
    unsureSectionSub: "Ask our Google Search-grounded Legal AI Chatbot",
    chatNowBtn: "Chat Now",

    actionPlanTab: "Action Plan (5)",
    draftsEvidenceTab: "Drafts & Evidence",
    caseHistoryTab: "Case History",
    actionPlanStatusTitle: "Legal Action Plan Status",
    completeSuffix: "Complete",
    completedStepsLabel: "Completed Steps",
    inProgressLabel: "In Progress",
    pendingActionsLabel: "Pending Legal Actions",
    tapCircleHint: "Tap any step circle below to update chart & audit log",
    stepTimelineHeader: "Your Step-by-Step Timeline",
    savedNoticeHeader: "Saved Legal Notice & Checklist",
    editDraftBtn: "Edit Draft →",
    exportPdfBtn: "Export Legal Notice as PDF",
    exportedPdfBtn: "Exported Legal Notice PDF!",
    attachedEvidenceHeader: "Attached Evidence Items",
    recordedVoiceNotesHeader: "Recorded Voice Notes",
    recordNewBtn: "+ Record New",
    noVoiceNotesText:
      "No voice notes recorded yet. Record your verbal explanation on Screen 1 to store it here as audio evidence.",
    caseHistoryHeader: "Case History Audit Trail",
    loggedEventsSuffix: "Logged Events",
    logMilestonePlaceholder:
      "Log a milestone note (e.g. Sent notice via speed post)...",
    logBtn: "+ Log",
    limitationAlertTitle: "Statutory Limitation Alert",
    needPlvTitle: "Need a Paralegal Volunteer to review?",
    needPlvSub: "Free DLSA Helpdesk · Mon–Sat, 10 AM – 5 PM",

    findAidHeader: "Find Free Legal Aid Near You",
    findAidSub: "Verified NALSA, DLSA & Labour Conciliation Offices",
    searchCenterPlaceholder: "Search by court name, area, or PIN code...",
    bookTokenBtn: "Book Free Legal Aid Token →",
    askAiGuideBtn: "Ask AI Guide",
    emergencyHelplinesTitle: "24×7 Statutory Emergency Helplines",
    needTeleLawTitle: "Need Tele-Law Video Advice?",
    needTeleLawSub: "Speak with a panel lawyer or AI Voice now",
    startVoiceCallBtn: "Start Voice Call",
  },

  "हिन्दी (Hindi)": {
    appTitle: "न्याय सहायक",
    appSubtitle: "नागरिक विधिक सहायता",
    navHome: "मुखपृष्ठ",
    navExplainLaw: "कानून समझें",
    navTrackCase: "केस ट्रैक करें",
    navFindAid: "कानूनी सहायता",
    screen1Title: "1. अपनी समस्या बताएं",
    screen2Title: "2. AI कानूनी मूल्यांकन",
    screen3Title: "3. नोटिस और पात्रता",
    screen4Title: "4. कानून पुस्तकालय",
    screen5Title: "5. कार्य योजना ट्रैकर",
    screen6Title: "6. नजदीकी विधिक सेवा",
    all6ScreensView: "सभी 6 स्क्रीन देखें",
    focusedView: "एकल स्क्रीन दृश्य",
    liveVoiceBtn: "लाइव वॉइस",
    aiLegalChatBtn: "AI कानूनी चैट",
    interactiveJourneyKicker: "इंटरैक्टिव 6-स्क्रीन नागरिक यात्रा",
    switchOrInspectHeading: "स्क्रीन बदलें या सभी 6 स्क्रीन एक साथ देखें",
    open6ScreenCanvas: "6-स्क्रीन कैनवास खोलें",

    nalsaBannerTitle: "नालसा (NALSA) के तहत निःशुल्क कानूनी सहायता",
    nalsaBannerSub: "24×7 टोल-फ्री राष्ट्रीय हेल्पलाइन 15100",
    getAidBtn: "सहायता लें →",
    heroKicker: "आपकी अपनी भाषा में AI कानूनी मार्गदर्शन",
    heroTitle: "आसान शब्दों में अपनी समस्या बताएं",
    heroSubtitle:
      "अपने कानूनी अधिकारों और अगले कदमों को समझने के लिए हिंदी, अंग्रेजी या क्षेत्रीय भाषाओं में बोलें या लिखें।",
    tapToSpeakTitle: "Gemini लाइव वॉइस में बोलने के लिए टैप करें",
    tapToSpeakSub: "हिंदी, अंग्रेजी, मराठी, तमिल और तेलुगु समर्थित",
    typeProblemPlaceholder: "या अपनी समस्या यहाँ टाइप करें...",
    recordVoiceNoteTitle: "साक्ष्य स्टोर के लिए वॉइस नोट रिकॉर्ड करें",
    recordingVoiceNoteTitle: "वॉइस नोट रिकॉर्ड हो रहा है",
    recordVoiceNoteSub: "अपना मौखिक बयान सुरक्षित करें",
    recordingInBackgroundSub:
      "बैकग्राउंड में रिकॉर्डिंग जारी · सहेजने के लिए रोकें",
    recordNoteBtn: "वॉइस नोट",
    stopAndSaveBtn: "रोकें व सहेजें",
    commonSituationsHeader: "आम नागरिक समस्याएं (विश्लेषण के लिए टैप करें)",
    confidentialityBold: "100% गोपनीय और निःशुल्क जानकारी:",
    confidentialityText:
      "सत्यापित भारतीय कानूनी अधिकार और प्रक्रियाएं प्रदान करता है। यह कोर्ट वकील का विकल्प नहीं है।",
    understandRightsHeader: "अपने अधिकार जानें",
    viewAllBtn: "सभी देखें →",
    catPropertyTitle: "संपत्ति और किरायेदारी",
    catPropertyDesc: "सिक्योरिटी डिपॉजिट, अवैध बेदखली, किराया कानून",
    catLabourTitle: "श्रम और वेतन",
    catLabourDesc: "रुका हुआ वेतन, पीएफ, गलत बर्खास्तगी",
    catFamilyTitle: "परिवार और महिला अधिकार",
    catFamilyDesc: "घरेलू हिंसा, भरण-पोषण, निवास अधिकार",
    catConsumerTitle: "उपभोक्ता और साइबर",
    catConsumerDesc: "UPI धोखाधड़ी, खराब सामान, ई-दाखिल",
    popularBadge: "लोकप्रिय",
    citizenGuidesHeader: "नागरिक गाइड और न्याय की कहानियां",
    seeMoreBtn: "और देखें →",
    readGuideBtn: "गाइड पढ़ें →",
    tryCaseBtn: "यह केस देखें →",
    needGuidanceTitle: "इंटरैक्टिव AI मार्गदर्शन चाहिए?",
    needGuidanceSub: "Google Search से जुड़े लीगल AI से चैट करें",
    openChatBtn: "चैट खोलें",

    aiAssessmentKicker: "AI कानूनी मूल्यांकन",
    listenBtn: "सुनें",
    stopBtn: "रोकें",
    yourSituationLabel: "आपकी बताई गई समस्या",
    editBtn: "बदलें",
    addByVoiceBtn: "बोलकर जोड़ें",
    askFollowUpBtn: "सवाल पूछें",
    analyzingStatutesText: "भारतीय कानूनों और धाराओं का विश्लेषण हो रहा है...",
    whatLawSaysTitle: "सरल शब्दों में कानून क्या कहता है",
    questionsToStrengthenTitle: "आपके केस को मजबूत करने के लिए प्रश्न",
    tapToAnswerLabel: "उत्तर चुनें",
    recommendedNextStepsTitle: "सुझाए गए अगले कदम",
    prepareNoticeCta: "मेरा कानूनी नोटिस और कार्य योजना बनाएं →",

    prepareActionHeader: "कानूनी कार्रवाई की तैयारी",
    askAiAssistantBtn: "AI सहायक से पूछें",
    step2Of3Label: "चरण 2 / 3 · साक्ष्य और कानूनी नोटिस",
    readyLabel: "66% तैयार",
    whyNoticeTitle: "लिखित मांग नोटिस (Demand Notice) से शुरुआत क्यों करें?",
    whyNoticeBody:
      "68% से अधिक वेतन और किराया विवादों में, सही कानूनी धाराओं का हवाला देते हुए लिखित नोटिस भेजने से 15 दिनों में बिना कोर्ट गए समाधान हो जाता है।",
    evidenceChecklistHeader: "1. साक्ष्य (Evidence) चेकलिस्ट",
    scanDocumentBtn: "दस्तावेज़ स्कैन करें",
    capturePhotoBtn: "फोटो लें",
    retakePhotoBtn: "दोबारा फोटो लें",
    eligibilityHeader: "2. निःशुल्क विधिक सहायता पात्रता (NALSA)",
    aiNoticeDraftHeader: "3. AI कानूनी नोटिस ड्राफ्ट",
    customizeWithAiBtn: "AI से तैयार करें",
    draftingText: "लिखा जा रहा है...",
    copyNoticeBtn: "कानूनी नोटिस कॉपी / डाउनलोड करें",
    copiedNoticeBtn: "नोटिस कॉपी हो गया!",
    saveAndProceedBtn: "सहेजें और कार्य योजना ट्रैकर पर जाएं →",

    activeJurisdictionLabel: "सक्रिय न्यायक्षेत्र",
    centralAndStateLabel: "भारत · केंद्रीय और राज्य कानून",
    searchLawPlaceholder: "अधिनियम या धारा खोजें (जैसे Sec 15, FIR)...",
    askAiShortBtn: "AI से पूछें",
    googleSearchConnectedNote:
      "BNS 2023 और सुप्रीम कोर्ट अपडेट के लिए Google Search से जुड़ा",
    matchingSectionsLabel: "संबंधित कानूनी धाराएं",
    explainWithAiBtn: "AI से समझें",
    faqHeader: "अक्सर पूछे जाने वाले नागरिक प्रश्न",
    unsureSectionTitle: "असमंजस में हैं कि कौन सी धारा लागू होती है?",
    unsureSectionSub: "हमारे लीगल AI चैटबॉट से अभी पूछें",
    chatNowBtn: "चैट करें",

    actionPlanTab: "कार्य योजना (5)",
    draftsEvidenceTab: "ड्राफ्ट व साक्ष्य",
    caseHistoryTab: "केस इतिहास",
    actionPlanStatusTitle: "कानूनी कार्य योजना की स्थिति",
    completeSuffix: "पूर्ण",
    completedStepsLabel: "पूर्ण चरण",
    inProgressLabel: "प्रगति पर",
    pendingActionsLabel: "शेष कानूनी कदम",
    tapCircleHint: "चार्ट और इतिहास अपडेट करने के लिए किसी भी चरण पर टैप करें",
    stepTimelineHeader: "आपकी चरणबद्ध समयरेखा",
    savedNoticeHeader: "सहेजा गया कानूनी नोटिस और चेकलिस्ट",
    editDraftBtn: "ड्राफ्ट बदलें →",
    exportPdfBtn: "कानूनी नोटिस PDF में डाउनलोड करें",
    exportedPdfBtn: "PDF डाउनलोड हो गया!",
    attachedEvidenceHeader: "संलग्न साक्ष्य दस्तावेज़",
    recordedVoiceNotesHeader: "रिकॉर्ड किए गए वॉइस नोट्स",
    recordNewBtn: "+ नया रिकॉर्ड करें",
    noVoiceNotesText:
      "अभी कोई वॉइस नोट रिकॉर्ड नहीं है। स्क्रीन 1 पर जाकर अपनी आवाज में बयान रिकॉर्ड करें।",
    caseHistoryHeader: "केस इतिहास लॉग (Audit Trail)",
    loggedEventsSuffix: "दर्ज घटनाएं",
    logMilestonePlaceholder: "नया नोट जोड़ें (जैसे: स्पीड पोस्ट से नोटिस भेजा)...",
    logBtn: "+ जोड़ें",
    limitationAlertTitle: "कानूनी समय-सीमा चेतावनी",
    needPlvTitle: "पैरालीगल वॉलंटियर (PLV) से जांच करानी है?",
    needPlvSub: "निःशुल्क DLSA हेल्पडेस्क · सोम–शनि, सुबह 10 – शाम 5",

    findAidHeader: "अपने पास निःशुल्क कानूनी सहायता खोजें",
    findAidSub: "सत्यापित NALSA, DLSA और श्रम समझौता कार्यालय",
    searchCenterPlaceholder: "कोर्ट का नाम, क्षेत्र या पिन कोड खोजें...",
    bookTokenBtn: "निःशुल्क विधिक सहायता टोकन बुक करें →",
    askAiGuideBtn: "AI गाइड",
    emergencyHelplinesTitle: "24×7 आपातकालीन सरकारी हेल्पलाइन",
    needTeleLawTitle: "टेली-लॉ (Tele-Law) वीडियो सलाह चाहिए?",
    needTeleLawSub: "पैनल वकील या AI वॉइस से अभी बात करें",
    startVoiceCallBtn: "वॉइस कॉल शुरू करें",
  },

  "मराठी (Marathi)": {
    appTitle: "न्याय सहाय्यक",
    appSubtitle: "नागरिक कायदेशीर मदत",
    navHome: "मुख्यपृष्ठ",
    navExplainLaw: "कायदा समजून घ्या",
    navTrackCase: "केस ट्रॅक करा",
    navFindAid: "मदत केंद्र",
    screen1Title: "1. तुमची समस्या सांगा",
    screen2Title: "2. AI कायदेशीर विश्लेषण",
    screen3Title: "3. नोटीस आणि पात्रता",
    screen4Title: "4. कायदा माहिती",
    screen5Title: "5. कृती आराखडा",
    screen6Title: "6. जवळचे मदत केंद्र",
    all6ScreensView: "सर्व 6 स्क्रीन पहा",
    focusedView: "फोकस व्ह्यू",
    liveVoiceBtn: "लाईव्ह व्हॉइस",
    aiLegalChatBtn: "AI कायदेशीर चॅट",
    interactiveJourneyKicker: "इंटरॅक्टिव्ह 6-स्क्रीन नागरिक प्रवास",
    switchOrInspectHeading: "स्क्रीन बदला किंवा सर्व 6 स्क्रीन एकत्र पहा",
    open6ScreenCanvas: "6-स्क्रीन कॅनव्हास उघडा",

    nalsaBannerTitle: "NALSA अंतर्गत मोफत कायदेशीर मदत",
    nalsaBannerSub: "24×7 टोल-फ्री राष्ट्रीय हेल्पलाईन 15100",
    getAidBtn: "मदत घ्या →",
    heroKicker: "तुमच्या भाषेत AI कायदेशीर मार्गदर्शन",
    heroTitle: "सोप्या शब्दांत तुमची परिस्थिती सांगा",
    heroSubtitle:
      "तुमचे कायदेशीर हक्क आणि पुढील पावले समजून घेण्यासाठी मराठी, हिंदी किंवा इंग्रजीत बोला किंवा टाईप करा.",
    tapToSpeakTitle: "Gemini लाईव्ह व्हॉइसमध्ये बोलण्यासाठी टॅप करा",
    tapToSpeakSub: "मराठी, हिंदी, इंग्रजी, तमिळ आणि तेलुगू समर्थित",
    typeProblemPlaceholder: "किंवा तुमची समस्या येथे टाईप करा...",
    recordVoiceNoteTitle: "पुराव्यासाठी व्हॉइस नोट रेकॉर्ड करा",
    recordingVoiceNoteTitle: "व्हॉइस नोट रेकॉर्ड होत आहे",
    recordVoiceNoteSub: "तोंडी जबाब पुराव्यामध्ये जतन करा",
    recordingInBackgroundSub: "बॅकग्राउंडमध्ये रेकॉर्डिंग सुरू · जतन करण्यासाठी थांबवा",
    recordNoteBtn: "रेकॉर्ड करा",
    stopAndSaveBtn: "थांबवा व जतन करा",
    commonSituationsHeader: "सामान्य नागरिकांच्या समस्या (तपासण्यासाठी टॅप करा)",
    confidentialityBold: "100% गोपनीय आणि मोफत माहिती:",
    confidentialityText:
      "भारतीय कायदेशीर हक्क आणि प्रक्रियांची माहिती देते. हा कोर्टातील वकिलाचा पर्याय नाही.",
    understandRightsHeader: "तुमचे हक्क जाणून घ्या",
    viewAllBtn: "सर्व पहा →",
    catPropertyTitle: "मालमत्ता आणि भाडेकरार",
    catPropertyDesc: "डिपॉझिट परतावा, बेकायदेशीर निष्कासन, भाडे कायदा",
    catLabourTitle: "कामगार आणि वेतन",
    catLabourDesc: "थकीत पगार, पीएफ, चुकीची बडतर्फी",
    catFamilyTitle: "कुटुंब आणि महिला हक्क",
    catFamilyDesc: "कौटुंबिक हिंसाचार, पोटगी, राहण्याचा हक्क",
    catConsumerTitle: "ग्राहक आणि सायबर",
    catConsumerDesc: "UPI फसवणूक, सदोष वस्तू, ई-दाखिल",
    popularBadge: "लोकप्रिय",
    citizenGuidesHeader: "नागरिक मार्गदर्शक आणि यशोगाथा",
    seeMoreBtn: "अधिक पहा →",
    readGuideBtn: "मार्गदर्शक वाचा →",
    tryCaseBtn: "ही केस पहा →",
    needGuidanceTitle: "इंटरॅक्टिव्ह AI मार्गदर्शन हवे आहे?",
    needGuidanceSub: "Google Search जोडलेल्या लीगल AI शी बोला",
    openChatBtn: "चॅट उघडा",

    aiAssessmentKicker: "AI कायदेशीर मूल्यांकन",
    listenBtn: "ऐका",
    stopBtn: "थांबवा",
    yourSituationLabel: "तुम्ही सांगितलेली परिस्थिती",
    editBtn: "बदला",
    addByVoiceBtn: "आवाजाने जोडा",
    askFollowUpBtn: "पुढील प्रश्न विचारा",
    analyzingStatutesText: "भारतीय कायदे आणि कलमांचे विश्लेषण सुरू आहे...",
    whatLawSaysTitle: "सोप्या भाषेत कायदा काय सांगतो",
    questionsToStrengthenTitle: "तुमची केस मजबूत करण्यासाठी प्रश्न",
    tapToAnswerLabel: "पर्याय निवडा",
    recommendedNextStepsTitle: "शिफारस केलेली पुढील पावले",
    prepareNoticeCta: "माझी कायदेशीर नोटीस आणि कृती आराखडा तयार करा →",

    prepareActionHeader: "कायदेशीर कार्यवाहीची तयारी",
    askAiAssistantBtn: "AI सहाय्यकाला विचारा",
    step2Of3Label: "टप्पा 2 / 3 · पुरावे आणि कायदेशीर नोटीस",
    readyLabel: "66% पूर्ण",
    whyNoticeTitle: "लेखी मागणी नोटीसने (Demand Notice) सुरुवात का करावी?",
    whyNoticeBody:
      "68% पेक्षा जास्त पगार आणि भाडे वादांमध्ये, योग्य कलमांचा उल्लेख करून लेखी नोटीस पाठवल्यास कोर्टात न जाता 15 दिवसांत तोडगा निघतो.",
    evidenceChecklistHeader: "1. पुरावे (Evidence) यादी",
    scanDocumentBtn: "कागदपत्र स्कॅन करा",
    capturePhotoBtn: "फोटो काढा",
    retakePhotoBtn: "पुन्हा फोटो काढा",
    eligibilityHeader: "2. मोफत कायदेशीर मदत पात्रता (NALSA)",
    aiNoticeDraftHeader: "3. AI कायदेशीर नोटीस मसुदा",
    customizeWithAiBtn: "AI ने तयार करा",
    draftingText: "तयार होत आहे...",
    copyNoticeBtn: "कायदेशीर नोटीस कॉपी / डाउनलोड करा",
    copiedNoticeBtn: "नोटीस कॉपी झाली!",
    saveAndProceedBtn: "जतन करा आणि कृती आराखड्यावर जा →",

    activeJurisdictionLabel: "सक्रिय कार्यक्षेत्र",
    centralAndStateLabel: "भारत · केंद्र आणि राज्य कायदे",
    searchLawPlaceholder: "कायदा किंवा कलम शोधा (उदा. Sec 15, FIR)...",
    askAiShortBtn: "AI ला विचारा",
    googleSearchConnectedNote:
      "BNS 2023 आणि सुप्रीम कोर्ट अपडेट्ससाठी Google Search शी जोडलेले",
    matchingSectionsLabel: "संबंधित कायदेशीर कलमे",
    explainWithAiBtn: "AI कडून समजून घ्या",
    faqHeader: "नागरिकांचे नेहमीचे प्रश्न (FAQ)",
    unsureSectionTitle: "कोणते कलम लागू होते याबद्दल शंका आहे?",
    unsureSectionSub: "आमच्या लीगल AI चॅटबॉटला विचारा",
    chatNowBtn: "चॅट करा",

    actionPlanTab: "कृती आराखडा (5)",
    draftsEvidenceTab: "मसुदा व पुरावे",
    caseHistoryTab: "केस इतिहास",
    actionPlanStatusTitle: "कायदेशीर कृती आराखडा स्थिती",
    completeSuffix: "पूर्ण",
    completedStepsLabel: "पूर्ण झालेले टप्पे",
    inProgressLabel: "सुरू असलेले",
    pendingActionsLabel: "प्रलंबित कृती",
    tapCircleHint: "चार्ट अपडेट करण्यासाठी खालील कोणत्याही टप्प्यावर टॅप करा",
    stepTimelineHeader: "तुमची टप्प्याटप्प्याने वेळरेषा",
    savedNoticeHeader: "जतन केलेली कायदेशीर नोटीस आणि यादी",
    editDraftBtn: "मसुदा बदला →",
    exportPdfBtn: "कायदेशीर नोटीस PDF मध्ये डाउनलोड करा",
    exportedPdfBtn: "PDF डाउनलोड झाली!",
    attachedEvidenceHeader: "जोडलेले पुरावे",
    recordedVoiceNotesHeader: "रेकॉर्ड केलेल्या व्हॉइस नोट्स",
    recordNewBtn: "+ नवीन रेकॉर्ड करा",
    noVoiceNotesText:
      "अद्याप कोणतीही व्हॉइस नोट रेकॉर्ड केलेली नाही. स्क्रीन 1 वर जाऊन रेकॉर्ड करा.",
    caseHistoryHeader: "केस इतिहास नोंदवही (Audit Trail)",
    loggedEventsSuffix: "नोंदवलेले टप्पे",
    logMilestonePlaceholder: "नवीन नोंद जोडा (उदा. स्पीड पोस्टने नोटीस पाठवली)...",
    logBtn: "+ नोंदवा",
    limitationAlertTitle: "कायदेशीर मुदत इशारा",
    needPlvTitle: "पॅरालीगल स्वयंसेवकाकडून तपासून हवे आहे?",
    needPlvSub: "मोफत DLSA हेल्पडेस्क · सोम–शनि, स. 10 ते सायं. 5",

    findAidHeader: "तुमच्या जवळ मोफत कायदेशीर मदत शोधा",
    findAidSub: "अधिकृत NALSA, DLSA आणि कामगार कार्यालय",
    searchCenterPlaceholder: "कोर्टाचे नाव, परिसर किंवा पिन कोड शोधा...",
    bookTokenBtn: "मोफत कायदेशीर मदत टोकन बुक करा →",
    askAiGuideBtn: "AI मार्गदर्शक",
    emergencyHelplinesTitle: "24×7 आपत्कालीन सरकारी हेल्पलाईन",
    needTeleLawTitle: "टेली-लॉ (Tele-Law) व्हिडिओ सल्ला हवा आहे?",
    needTeleLawSub: "वकील किंवा AI व्हॉइसशी आत्ताच बोला",
    startVoiceCallBtn: "व्हॉइस कॉल सुरू करा",
  },

  "தமிழ் (Tamil)": {
    appTitle: "நியாய சஹாயக்",
    appSubtitle: "குடிமக்கள் சட்ட உதவி",
    navHome: "முகப்பு",
    navExplainLaw: "சட்ட விளக்கம்",
    navTrackCase: "வழக்கு நிலை",
    navFindAid: "சட்ட உதவி",
    screen1Title: "1. பிரச்சனையை விவரிக்கவும்",
    screen2Title: "2. AI சட்ட மதிப்பீடு",
    screen3Title: "3. நோட்டீஸ் & தகுதி",
    screen4Title: "4. சட்ட நூலகம்",
    screen5Title: "5. செயல் திட்டம்",
    screen6Title: "6. அருகிலுள்ள சட்ட உதவி",
    all6ScreensView: "6 திரைகளையும் காண்க",
    focusedView: "ஒற்றைத் திரை",
    liveVoiceBtn: "நேரடி குரல்",
    aiLegalChatBtn: "AI சட்ட அரட்டை",
    interactiveJourneyKicker: "6-திரை குடிமக்கள் சட்டப் பயணம்",
    switchOrInspectHeading: "திரைகளை மாற்றவும் அல்லது 6 திரைகளையும் காண்க",
    open6ScreenCanvas: "6-திரை பார்வையைத் திற",

    nalsaBannerTitle: "NALSA-ன் கீழ் இலவச சட்ட உதவி",
    nalsaBannerSub: "24×7 கட்டணமில்லா தேசிய உதவி எண் 15100",
    getAidBtn: "உதவி பெறுக →",
    heroKicker: "உங்கள் மொழியில் AI சட்ட வழிகாட்டுதல்",
    heroTitle: "உங்கள் சூழ்நிலையை எளிய வார்த்தைகளில் விவரிக்கவும்",
    heroSubtitle:
      "உங்கள் சட்ட உரிமைகள் மற்றும் அடுத்த படிகளை அறிய தமிழ், ஆங்கிலம் அல்லது இந்தியில் பேசவும் அல்லது தட்டச்சு செய்யவும்.",
    tapToSpeakTitle: "Gemini Live குரலில் பேச இங்கே தட்டவும்",
    tapToSpeakSub: "தமிழ், ஆங்கிலம், இந்தி, மராத்தி & தெலுங்கு",
    typeProblemPlaceholder: "அல்லது உங்கள் பிரச்சனையை இங்கே உள்ளிடவும்...",
    recordVoiceNoteTitle: "ஆதாரத்திற்காக குரல் குறிப்பைப் பதிவு செய்க",
    recordingVoiceNoteTitle: "குரல் குறிப்பு பதிவாகிறது",
    recordVoiceNoteSub: "உங்கள் வாக்குமூலத்தை சேமிக்கவும்",
    recordingInBackgroundSub:
      "பின்னணியில் பதிவாகிறது · சேமிக்க நிறுத்து என்பதைத் தட்டவும்",
    recordNoteBtn: "பதிவு செய்",
    stopAndSaveBtn: "நிறுத்தி சேமி",
    commonSituationsHeader: "பொதுவான பிரச்சனைகள் (ஆய்வு செய்ய தட்டவும்)",
    confidentialityBold: "100% ரகசியமான & இலவச தகவல்:",
    confidentialityText:
      "சரிபார்க்கப்பட்ட இந்திய சட்ட உரிமைகளை வழங்குகிறது. இது நீதிமன்ற வழக்கறிஞருக்கு மாற்றல்ல.",
    understandRightsHeader: "உங்கள் உரிமைகளை அறிந்து கொள்ளுங்கள்",
    viewAllBtn: "அனைத்தும் →",
    catPropertyTitle: "சொத்து & வாடகை",
    catPropertyDesc: "முன்பணம் திரும்பப் பெறுதல், வாடகை சட்டங்கள்",
    catLabourTitle: "தொழிலாளர் & ஊதியம்",
    catLabourDesc: "நிலுவை சம்பளம், பி.எஃப், பணிநீக்கம்",
    catFamilyTitle: "குடும்பம் & பெண்கள்",
    catFamilyDesc: "குடும்ப வன்முறை, ஜீவனாம்சம், வசிப்பிட உரிமை",
    catConsumerTitle: "நுகர்வோர் & சைபர்",
    catConsumerDesc: "UPI மோசடி, குறைபாடுள்ள பொருட்கள், இ-தாக்கல்",
    popularBadge: "முக்கியமானது",
    citizenGuidesHeader: "வழிகாட்டிகள் & நீதிக் கதைகள்",
    seeMoreBtn: "மேலும் காண்க →",
    readGuideBtn: "வழிகாட்டியைப் படி →",
    tryCaseBtn: "இதை முயற்சிக்கவும் →",
    needGuidanceTitle: "AI சட்ட வழிகாட்டுதல் வேண்டுமா?",
    needGuidanceSub: "Google Search இணைக்கப்பட்ட சட்ட AI உடன் உரையாடுங்கள்",
    openChatBtn: "அரட்டையைத் திற",

    aiAssessmentKicker: "AI சட்ட மதிப்பீடு",
    listenBtn: "கேட்க",
    stopBtn: "நிறுத்து",
    yourSituationLabel: "நீங்கள் விவரித்த சூழ்நிலை",
    editBtn: "திருத்து",
    addByVoiceBtn: "குரல் மூலம் சேர்",
    askFollowUpBtn: "கேள்வி கேள்",
    analyzingStatutesText: "இந்திய சட்டப் பிரிவுகள் ஆராயப்படுகின்றன...",
    whatLawSaysTitle: "சட்டம் எளிய வார்த்தைகளில் கூறுவது என்ன",
    questionsToStrengthenTitle: "உங்கள் வழக்கை வலுப்படுத்த கேள்விகள்",
    tapToAnswerLabel: "பதிலைத் தேர்ந்தெடுக்கவும்",
    recommendedNextStepsTitle: "பரிந்துரைக்கப்படும் அடுத்த படிகள்",
    prepareNoticeCta: "சட்ட நோட்டீஸ் & செயல் திட்டத்தை உருவாக்கு →",

    prepareActionHeader: "சட்ட நடவடிக்கை தயாரிப்பு",
    askAiAssistantBtn: "AI உதவியாளரிடம் கேள்",
    step2Of3Label: "படி 2 / 3 · ஆதாரங்கள் & சட்ட நோட்டீஸ்",
    readyLabel: "66% தயார்",
    whyNoticeTitle: "எழுத்துப்பூர்வ நோட்டீஸுடன் ஏன் தொடங்க வேண்டும்?",
    whyNoticeBody:
      "68% ஊதிய மற்றும் வாடகை தகராறுகளில், சரியான சட்டப் பிரிவுகளுடன் நோட்டீஸ் அனுப்புவது நீதிமன்றம் செல்லாமலேயே 15 நாட்களில் தீர்வைத் தருகிறது.",
    evidenceChecklistHeader: "1. ஆதாரப் பட்டியல் (Evidence Checklist)",
    scanDocumentBtn: "ஆவணத்தை ஸ்கேன் செய்",
    capturePhotoBtn: "புகைப்படம் எடு",
    retakePhotoBtn: "மீண்டும் எடு",
    eligibilityHeader: "2. இலவச சட்ட உதவி தகுதி (NALSA)",
    aiNoticeDraftHeader: "3. AI சட்ட நோட்டீஸ் வரைவு",
    customizeWithAiBtn: "AI மூலம் மாற்று",
    draftingText: "உருவாக்கப்படுகிறது...",
    copyNoticeBtn: "சட்ட நோட்டீஸை நகலெடு / பதிவிறக்கு",
    copiedNoticeBtn: "நோட்டீஸ் நகலெடுக்கப்பட்டது!",
    saveAndProceedBtn: "சேமித்து செயல் திட்டத்திற்குச் செல் →",

    activeJurisdictionLabel: "சட்ட வரம்பு",
    centralAndStateLabel: "இந்தியா · மத்திய & மாநில சட்டங்கள்",
    searchLawPlaceholder: "சட்டம் அல்லது பிரிவைத் தேடுங்கள் (எ.கா. Sec 15, FIR)...",
    askAiShortBtn: "AI-யிடம் கேள்",
    googleSearchConnectedNote:
      "BNS 2023 & உச்ச நீதிமன்ற தகவல்களுக்கு Google Search இணைக்கப்பட்டுள்ளது",
    matchingSectionsLabel: "பொருந்தும் சட்டப் பிரிவுகள்",
    explainWithAiBtn: "AI விளக்கம்",
    faqHeader: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    unsureSectionTitle: "எந்த சட்டப் பிரிவு பொருந்தும் எனத் தெரியவில்லையா?",
    unsureSectionSub: "எங்கள் சட்ட AI சாட்பாட்டிடம் கேளுங்கள்",
    chatNowBtn: "இப்போது உரையாடு",

    actionPlanTab: "செயல் திட்டம் (5)",
    draftsEvidenceTab: "வரைவு & ஆதாரம்",
    caseHistoryTab: "வழக்கு வரலாறு",
    actionPlanStatusTitle: "சட்ட செயல் திட்ட நிலை",
    completeSuffix: "முடிந்தது",
    completedStepsLabel: "முடிந்த படிகள்",
    inProgressLabel: "நடைபெறுபவை",
    pendingActionsLabel: "நிலுவை நடவடிக்கைகள்",
    tapCircleHint: "விளக்கப்படத்தைப் புதுப்பிக்க கீழே உள்ள படிகளைத் தட்டவும்",
    stepTimelineHeader: "படிப்படியான காலவரிசை",
    savedNoticeHeader: "சேமிக்கப்பட்ட சட்ட நோட்டீஸ் & ஆதாரங்கள்",
    editDraftBtn: "வரைவைத் திருத்து →",
    exportPdfBtn: "சட்ட நோட்டீஸை PDF ஆக பதிவிறக்கு",
    exportedPdfBtn: "PDF பதிவிறக்கப்பட்டது!",
    attachedEvidenceHeader: "இணைக்கப்பட்ட ஆதாரங்கள்",
    recordedVoiceNotesHeader: "பதிவு செய்யப்பட்ட குரல் குறிப்புகள்",
    recordNewBtn: "+ புதிய பதிவு",
    noVoiceNotesText:
      "குரல் குறிப்புகள் எதுவும் இல்லை. திரை 1-ல் உங்கள் வாக்குமூலத்தைப் பதிவு செய்யவும்.",
    caseHistoryHeader: "வழக்கு வரலாறு பதிவு (Audit Trail)",
    loggedEventsSuffix: "நிகழ்வுகள்",
    logMilestonePlaceholder: "குறிப்பைச் சேர்க்கவும் (எ.கா. தபால் அனுப்பப்பட்டது)...",
    logBtn: "+ சேர்",
    limitationAlertTitle: "சட்ட காலவரம்பு எச்சரிக்கை",
    needPlvTitle: "சட்ட தன்னார்வலர் (PLV) சரிபார்க்க வேண்டுமா?",
    needPlvSub: "இலவச DLSA உதவி மையம் · திங்கள்–சனி, காலை 10 – மாலை 5",

    findAidHeader: "உங்கள் அருகிலுள்ள இலவச சட்ட உதவியைக் கண்டறியவும்",
    findAidSub: "சரிபார்க்கப்பட்ட NALSA, DLSA & தொழிலாளர் மையங்கள்",
    searchCenterPlaceholder: "நீதிமன்றம், பகுதி அல்லது பின்கோடு தேடுக...",
    bookTokenBtn: "இலவச சட்ட உதவி டோக்கன் முன்பதிவு →",
    askAiGuideBtn: "AI வழிகாட்டி",
    emergencyHelplinesTitle: "24×7 அவசர உதவி எண்கள்",
    needTeleLawTitle: "டெலி-லா (Tele-Law) வீடியோ ஆலோசனை வேண்டுமா?",
    needTeleLawSub: "வழக்கறிஞர் அல்லது AI குரலுடன் பேசுங்கள்",
    startVoiceCallBtn: "குரல் அழைப்பு",
  },

  "తెలుగు (Telugu)": {
    appTitle: "న్యాయ సహాయక్",
    appSubtitle: "పౌర న్యాయ సహాయం",
    navHome: "హోమ్",
    navExplainLaw: "చట్టం వివరణ",
    navTrackCase: "కేసు ట్రాక్",
    navFindAid: "న్యాయ సహాయం",
    screen1Title: "1. సమస్యను వివరించండి",
    screen2Title: "2. AI న్యాయ విశ్లేషణ",
    screen3Title: "3. నోటీసు & అర్హత",
    screen4Title: "4. చట్టాల లైబ్రరీ",
    screen5Title: "5. కార్యాచరణ ప్రణాళిక",
    screen6Title: "6. సమీప న్యాయ సహాయం",
    all6ScreensView: "మొత్తం 6 స్క్రీన్లు",
    focusedView: "సింగిల్ వ్యూ",
    liveVoiceBtn: "లైవ్ వాయిస్",
    aiLegalChatBtn: "AI లీగల్ చాట్",
    interactiveJourneyKicker: "ఇంటరాక్టివ్ 6-స్క్రీన్ పౌర న్యాయ ప్రయాణం",
    switchOrInspectHeading: "స్క్రీన్లను మార్చండి లేదా 6 స్క్రీన్లను ఒకేసారి చూడండి",
    open6ScreenCanvas: "6-స్క్రీన్ కాన్వాస్ తెరవండి",

    nalsaBannerTitle: "NALSA కింద ఉచిత న్యాయ సహాయం",
    nalsaBannerSub: "24×7 టోల్-ఫ్రీ జాతీయ హెల్ప్‌లైన్ 15100",
    getAidBtn: "సహాయం పొందండి →",
    heroKicker: "మీ భాషలో AI న్యాయ మార్గదర్శకత్వం",
    heroTitle: "మీ పరిస్థితిని సరళమైన మాటల్లో వివరించండి",
    heroSubtitle:
      "మీ చట్టపరమైన హక్కులు మరియు తదుపరి చర్యలను తెలుసుకోవడానికి తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మాట్లాడండి లేదా టైప్ చేయండి.",
    tapToSpeakTitle: "Gemini Live వాయిస్‌లో మాట్లాడటానికి నొక్కండి",
    tapToSpeakSub: "తెలుగు, హిందీ, ఇంగ్లీష్, మరాఠీ & తమిళం",
    typeProblemPlaceholder: "లేదా మీ సమస్యను ఇక్కడ టైప్ చేయండి...",
    recordVoiceNoteTitle: "సాక్ష్యం కోసం వాయిస్ నోట్ రికార్డ్ చేయండి",
    recordingVoiceNoteTitle: "వాయిస్ నోట్ రికార్డ్ అవుతోంది",
    recordVoiceNoteSub: "మీ వాంగ్మూలాన్ని ఆడియోగా సేవ్ చేయండి",
    recordingInBackgroundSub:
      "బ్యాక్‌గ్రౌండ్‌లో రికార్డింగ్ జరుగుతోంది · సేవ్ చేయడానికి ఆపండి",
    recordNoteBtn: "రికార్డ్ నోట్",
    stopAndSaveBtn: "ఆపి సేవ్ చేయండి",
    commonSituationsHeader: "సాధారణ పౌర సమస్యలు (విశ్లేషించడానికి నొక్కండి)",
    confidentialityBold: "100% గోప్యమైన & ఉచిత సమాచారం:",
    confidentialityText:
      "ధృవీకరించబడిన భారతీయ చట్టపరమైన హక్కులను అందిస్తుంది. ఇది కోర్టు న్యాయవాదికి ప్రత్యామ్నాయం కాదు.",
    understandRightsHeader: "మీ హక్కులను తెలుసుకోండి",
    viewAllBtn: "అన్నీ చూడండి →",
    catPropertyTitle: "ఆస్తి & అద్దె హక్కులు",
    catPropertyDesc: "డిపాజిట్ వాపసు, అక్రమ ఖాళీ చేయించడం, అద్దె చట్టాలు",
    catLabourTitle: "కార్మిక & వేతన హక్కులు",
    catLabourDesc: "పెండింగ్ జీతం, పీఎఫ్, అక్రమ తొలగింపు",
    catFamilyTitle: "కుటుంబ & మహిళా హక్కులు",
    catFamilyDesc: "గృహ హింస, భరణం, నివాస హక్కు",
    catConsumerTitle: "వినియోగదారు & సైబర్",
    catConsumerDesc: "UPI మోసం, లోపభూయిష్ట వస్తువులు, ఇ-దాఖిల్",
    popularBadge: "ప్రముఖమైనది",
    citizenGuidesHeader: "పౌర గైడ్‌లు & న్యాయ కథనాలు",
    seeMoreBtn: "మరిన్ని →",
    readGuideBtn: "గైడ్ చదవండి →",
    tryCaseBtn: "ఈ కేసు చూడండి →",
    needGuidanceTitle: "ఇంటరాక్టివ్ AI సహాయం కావాలా?",
    needGuidanceSub: "Google Search ఆధారిత లీగల్ AI తో చాట్ చేయండి",
    openChatBtn: "చాట్ తెరవండి",

    aiAssessmentKicker: "AI న్యాయ విశ్లేషణ",
    listenBtn: "వినండి",
    stopBtn: "ఆపండి",
    yourSituationLabel: "మీరు వివరించిన పరిస్థితి",
    editBtn: "మార్చండి",
    addByVoiceBtn: "వాయిస్ ద్వారా జోడించండి",
    askFollowUpBtn: "ప్రశ్న అడగండి",
    analyzingStatutesText: "భారతీయ చట్టాలు మరియు సెక్షన్లను విశ్లేషిస్తోంది...",
    whatLawSaysTitle: "చట్టం సరళమైన మాటల్లో ఏమి చెబుతోంది",
    questionsToStrengthenTitle: "మీ కేసును బలోపేతం చేసే ప్రశ్నలు",
    tapToAnswerLabel: "సమాధానం ఎంచుకోండి",
    recommendedNextStepsTitle: "సూచించిన తదుపరి చర్యలు",
    prepareNoticeCta: "లీగల్ నోటీసు & కార్యాచరణ ప్రణాళిక రూపొందించండి →",

    prepareActionHeader: "చట్టపరమైన చర్య తయారీ",
    askAiAssistantBtn: "AI సహాయకుడిని అడగండి",
    step2Of3Label: "దశ 2 / 3 · సాక్ష్యాలు & లీగల్ నోటీసు",
    readyLabel: "66% సిద్ధం",
    whyNoticeTitle: "రాతపూర్వక డిమాండ్ నోటీసుతో ఎందుకు ప్రారంభించాలి?",
    whyNoticeBody:
      "68% పైగా జీతం మరియు అద్దె వివాదాలలో, సరైన చట్టపరమైన సెక్షన్లను పేర్కొంటూ రాతపూర్వక నోటీసు పంపడం ద్వారా కోర్టుకు వెళ్లకుండానే 15 రోజుల్లో పరిష్కారం లభిస్తుంది.",
    evidenceChecklistHeader: "1. సాక్ష్యాల జాబితా (Evidence Checklist)",
    scanDocumentBtn: "పత్రం స్కాన్ చేయండి",
    capturePhotoBtn: "ఫోటో తీయండి",
    retakePhotoBtn: "మళ్ళీ తీయండి",
    eligibilityHeader: "2. ఉచిత న్యాయ సహాయం అర్హత (NALSA)",
    aiNoticeDraftHeader: "3. AI లీగల్ నోటీసు డ్రాఫ్ట్",
    customizeWithAiBtn: "AI తో మార్చండి",
    draftingText: "రూపొందిస్తోంది...",
    copyNoticeBtn: "లీగల్ నోటీసు కాపీ / డౌన్‌లోడ్ చేయండి",
    copiedNoticeBtn: "నోటీసు కాపీ చేయబడింది!",
    saveAndProceedBtn: "సేవ్ చేసి కార్యాచరణ ప్రణాళికకు వెళ్ళండి →",

    activeJurisdictionLabel: "ప్రస్తుత పరిధి",
    centralAndStateLabel: "భారతదేశం · కేంద్ర & రాష్ట్ర చట్టాలు",
    searchLawPlaceholder: "చట్టం లేదా సెక్షన్ వెతకండి (ఉదా. Sec 15, FIR)...",
    askAiShortBtn: "AI ని అడగండి",
    googleSearchConnectedNote:
      "BNS 2023 & సుప్రీంకోర్టు అప్‌డేట్స్ కోసం Google Search తో అనుసంధానం",
    matchingSectionsLabel: "సరిపోలే చట్టపరమైన సెక్షన్లు",
    explainWithAiBtn: "AI తో వివరణ",
    faqHeader: "తరచుగా అడిగే పౌర ప్రశ్నలు",
    unsureSectionTitle: "ఏ సెక్షన్ వర్తిస్తుందో ఖచ్చితంగా తెలియదా?",
    unsureSectionSub: "మా లీగల్ AI చాట్‌బాట్‌ని అడగండి",
    chatNowBtn: "ఇప్పుడే చాట్ చేయండి",

    actionPlanTab: "ప్రణాళిక (5)",
    draftsEvidenceTab: "డ్రాఫ్ట్ & సాక్ష్యం",
    caseHistoryTab: "కేసు చరిత్ర",
    actionPlanStatusTitle: "కార్యాచరణ ప్రణాళిక స్థితి",
    completeSuffix: "పూర్తయింది",
    completedStepsLabel: "పూర్తయిన దశలు",
    inProgressLabel: "పురోగతిలో ఉన్నవి",
    pendingActionsLabel: "పెండింగ్ చర్యలు",
    tapCircleHint: "చార్ట్ & చరిత్రను అప్‌డేట్ చేయడానికి ఏదైనా దశపై నొక్కండి",
    stepTimelineHeader: "మీ దశలవారీ టైమ్‌లైన్",
    savedNoticeHeader: "సేవ్ చేసిన లీగల్ నోటీసు & జాబితా",
    editDraftBtn: "డ్రాఫ్ట్ మార్చు →",
    exportPdfBtn: "లీగల్ నోటీసు PDF గా డౌన్‌లోడ్ చేయండి",
    exportedPdfBtn: "PDF డౌన్‌లోడ్ అయింది!",
    attachedEvidenceHeader: "జతచేసిన సాక్ష్యాలు",
    recordedVoiceNotesHeader: "రికార్డ్ చేసిన వాయిస్ నోట్స్",
    recordNewBtn: "+ కొత్త రికార్డ్",
    noVoiceNotesText:
      "ఇంకా వాయిస్ నోట్స్ రికార్డ్ చేయలేదు. స్క్రీన్ 1 లో మీ వాంగ్మూలాన్ని రికార్డ్ చేయండి.",
    caseHistoryHeader: "కేసు చరిత్ర లాగ్ (Audit Trail)",
    loggedEventsSuffix: "నమోదైన సంఘటనలు",
    logMilestonePlaceholder:
      "మైలురాయి నోట్ చేర్చండి (ఉదా. రిజిస్టర్డ్ పోస్ట్ పంపబడింది)...",
    logBtn: "+ చేర్చు",
    limitationAlertTitle: "చట్టపరమైన గడువు హెచ్చరిక",
    needPlvTitle: "పారాలీగల్ వాలంటీర్ (PLV) సమీక్ష కావాలా?",
    needPlvSub: "ఉచిత DLSA హెల్ప్‌డెస్క్ · సోమ–శని, ఉ. 10 – సా. 5",

    findAidHeader: "మీ సమీపంలో ఉచిత న్యాయ సహాయాన్ని కనుగొనండి",
    findAidSub: "ధృవీకరించబడిన NALSA, DLSA & లేబర్ కార్యాలయాలు",
    searchCenterPlaceholder: "కోర్టు పేరు, ప్రాంతం లేదా పిన్‌కోడ్ వెతకండి...",
    bookTokenBtn: "ఉచిత న్యాయ సహాయం టోకెన్ బుక్ చేయండి →",
    askAiGuideBtn: "AI గైడ్",
    emergencyHelplinesTitle: "24×7 అత్యవసర ప్రభుత్వ హెల్ప్‌లైన్లు",
    needTeleLawTitle: "టెలి-లా (Tele-Law) వీడియో సలహా కావాలా?",
    needTeleLawSub: "న్యాయవాది లేదా AI వాయిస్‌తో మాట్లాడండి",
    startVoiceCallBtn: "వాయిస్ కాల్",
  },
};

export const REGIONAL_HEADER_OVERRIDES: Record<
  string,
  Partial<UITranslations>
> = {
  "বাংলা (Bengali)": {
    appTitle: "ন্যায় সহায়ক",
    appSubtitle: "নাগরিক আইনি সহায়তা",
    navHome: "হোম",
    navExplainLaw: "আইন বুঝুন",
    navTrackCase: "কেস ট্র্যাক",
    navFindAid: "আইনি সাহায্য",
    screen1Title: "1. সমস্যা বর্ণনা করুন",
    screen2Title: "2. AI আইনি মূল্যায়ন",
    screen3Title: "3. নোটিশ ও যোগ্যতা",
    screen4Title: "4. আইন লাইব্রেরি",
    screen5Title: "5. কর্মপরিকল্পনা",
    screen6Title: "6. নিকটবর্তী আইনি সাহায্য",
    all6ScreensView: "সব ৬টি স্ক্রিন",
    focusedView: "একক ভিউ",
    liveVoiceBtn: "লাইভ ভয়েস",
    aiLegalChatBtn: "AI আইনি চ্যাট",
    interactiveJourneyKicker: "ইন্টারেক্টিভ ৬-স্ক্রিন নাগরিক আইনি যাত্রা",
    switchOrInspectHeading: "স্ক্রিন পরিবর্তন করুন বা ৬টি স্ক্রিন একসাথে দেখুন",
    open6ScreenCanvas: "৬-স্ক্রিন ক্যানভাস খুলুন",
    nalsaBannerTitle: "NALSA-এর অধীনে বিনামূল্যে আইনি সহায়তা",
    nalsaBannerSub: "২৪×৭ টোল-ফ্রি জাতীয় হেল্পলাইন ১৫১০০",
    getAidBtn: "সাহায্য নিন →",
    heroKicker: "আপনার ভাষায় AI আইনি নির্দেশিকা",
    heroTitle: "আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    heroSubtitle:
      "আপনার আইনি অধিকার এবং পরবর্তী পদক্ষেপ বুঝতে বাংলা বা যেকোনো ভারতীয় ভাষায় কথা বলুন বা টাইপ করুন।",
    tapToSpeakTitle: "Gemini Live Voice-এ কথা বলতে ট্যাপ করুন",
    tapToSpeakSub: "বাংলা সহ ৩৩টি ভারতীয় ভাষা সমর্থিত",
    typeProblemPlaceholder: "অথবা আপনার সমস্যা এখানে টাইপ করুন...",
    recordVoiceNoteTitle: "প্রমাণের জন্য ভয়েস নোট রেকর্ড করুন",
    recordingVoiceNoteTitle: "ভয়েস নোট রেকর্ড হচ্ছে",
    recordVoiceNoteSub: "আপনার মৌখিক বিবৃতি সংরক্ষণ করুন",
    recordingInBackgroundSub: "ব্যাকগ্রাউন্ডে রেকর্ডিং চলছে · সেভ করতে থামান",
    recordNoteBtn: "নোট রেকর্ড",
    stopAndSaveBtn: "থামান ও সেভ",
    commonSituationsHeader: "সাধারণ নাগরিক সমস্যা (বিশ্লেষণ করতে ট্যাপ করুন)",
    confidentialityBold: "১০০% গোপনীয় ও বিনামূল্যে তথ্য:",
    confidentialityText:
      "যাচাইকৃত ভারতীয় আইনি অধিকার ও প্রক্রিয়া প্রদান করে। এটি আদালতের আইনজীবীর বিকল্প নয়।",
    understandRightsHeader: "আপনার অধিকার জানুন",
    viewAllBtn: "সব দেখুন →",
    catPropertyTitle: "সম্পত্তি ও ভাড়াটিয়া",
    catPropertyDesc: "ডিপোজিট ফেরত, অবৈধ উচ্ছেদ, ভাড়া আইন",
    catLabourTitle: "শ্রম ও মজুরি",
    catLabourDesc: "বকেয়া বেতন, পিএফ, অন্যায় বরখাস্ত",
    catFamilyTitle: "পরিবার ও নারী অধিকার",
    catFamilyDesc: "গার্হস্থ্য হিংসা, ভরণপোষণ, বাসস্থান অধিকার",
    catConsumerTitle: "গ্রাহক ও সাইবার",
    catConsumerDesc: "UPI জালিয়াতি, ত্রুটিপূর্ণ পণ্য, ই-দাখিল",
    popularBadge: "জনপ্রিয়",
    citizenGuidesHeader: "নাগরিক গাইড ও কেস স্টোরি",
    seeMoreBtn: "আরও দেখুন →",
    readGuideBtn: "গাইড পড়ুন →",
    tryCaseBtn: "এই কেস দেখুন →",
    needGuidanceTitle: "ইন্টারেক্টিভ AI নির্দেশিকা প্রয়োজন?",
    needGuidanceSub: "Google Search যুক্ত লিগ্যাল AI-এর সাথে চ্যাট করুন",
    openChatBtn: "চ্যাট খুলুন",
    aiAssessmentKicker: "AI আইনি মূল্যায়ন",
    listenBtn: "শুনুন",
    stopBtn: "থামান",
    yourSituationLabel: "আপনার বর্ণিত পরিস্থিতি",
    editBtn: "সম্পাদনা",
    addByVoiceBtn: "ভয়েসে যোগ করুন",
    askFollowUpBtn: "প্রশ্ন করুন",
    analyzingStatutesText: "ভারতীয় আইন ও ধারা বিশ্লেষণ করা হচ্ছে...",
    whatLawSaysTitle: "সহজ কথায় আইন কী বলে",
    questionsToStrengthenTitle: "আপনার কেস শক্তিশালী করার প্রশ্ন",
    tapToAnswerLabel: "উত্তর নির্বাচন করুন",
    recommendedNextStepsTitle: "প্রস্তাবিত পরবর্তী পদক্ষেপ",
    prepareNoticeCta: "আমার আইনি নোটিশ ও কর্মপরিকল্পনা তৈরি করুন →",
    prepareActionHeader: "আইনি পদক্ষেপের প্রস্তুতি",
    askAiAssistantBtn: "AI সহকারীকে জিজ্ঞাসা করুন",
    step2Of3Label: "ধাপ ২ / ৩ · প্রমাণ ও আইনি নোটিশ",
    readyLabel: "৬৬% প্রস্তুত",
    whyNoticeTitle: "লিখিত ডিমান্ড নোটিশ দিয়ে কেন শুরু করবেন?",
    whyNoticeBody:
      "৬৮%-এর বেশি বেতন ও ভাড়া সংক্রান্ত বিরোধে সঠিক আইনি ধারা উল্লেখ করে লিখিত নোটিশ পাঠালে আদালতে না গিয়েই ১৫ দিনের মধ্যে সমাধান হয়।",
    evidenceChecklistHeader: "১. প্রমাণ তালিকা (Evidence Checklist)",
    scanDocumentBtn: "নথি স্ক্যান করুন",
    capturePhotoBtn: "ছবি তুলুন",
    retakePhotoBtn: "আবার ছবি তুলুন",
    eligibilityHeader: "২. বিনামূল্যে আইনি সহায়তা যোগ্যতা (NALSA)",
    aiNoticeDraftHeader: "৩. AI আইনি নোটিশ খসড়া",
    customizeWithAiBtn: "AI দিয়ে তৈরি করুন",
    draftingText: "তৈরি হচ্ছে...",
    copyNoticeBtn: "আইনি নোটিশ কপি / ডাউনলোড করুন",
    copiedNoticeBtn: "নোটিশ কপি হয়েছে!",
    saveAndProceedBtn: "সেভ করুন ও কর্মপরিকল্পনায় যান →",
    activeJurisdictionLabel: "সক্রিয় বিচারক্ষেত্র",
    centralAndStateLabel: "ভারত · কেন্দ্রীয় ও রাজ্য আইন",
    searchLawPlaceholder: "আইন বা ধারা খুঁজুন (যেমন Sec 15, FIR)...",
    askAiShortBtn: "AI জিজ্ঞাসা",
    googleSearchConnectedNote:
      "BNS 2023 ও সুপ্রিম কোর্ট আপডেটের জন্য Google Search সংযুক্ত",
    matchingSectionsLabel: "সংশ্লিষ্ট আইনি ধারা",
    explainWithAiBtn: "AI দিয়ে বুঝুন",
    faqHeader: "সচরাচর জিজ্ঞাসিত নাগরিক প্রশ্ন",
    unsureSectionTitle: "কোন ধারা প্রযোজ্য তা নিশ্চিত নন?",
    unsureSectionSub: "আমাদের লিগ্যাল AI চ্যাটবটকে জিজ্ঞাসা করুন",
    chatNowBtn: "এখনই চ্যাট করুন",
    actionPlanTab: "কর্মপরিকল্পনা (5)",
    draftsEvidenceTab: "খসড়া ও প্রমাণ",
    caseHistoryTab: "কেস ইতিহাস",
    actionPlanStatusTitle: "আইনি কর্মপরিকল্পনার স্থিতি",
    completeSuffix: "সম্পূর্ণ",
    completedStepsLabel: "সম্পন্ন ধাপ",
    inProgressLabel: "চলমান",
    pendingActionsLabel: "বাকি পদক্ষেপ",
    tapCircleHint: "চার্ট ও ইতিহাস আপডেট করতে নিচের যেকোনো ধাপে ট্যাপ করুন",
    stepTimelineHeader: "আপনার ধাপে ধাপে সময়রেখা",
    savedNoticeHeader: "সংরক্ষিত আইনি নোটিশ ও তালিকা",
    editDraftBtn: "খসড়া সম্পাদনা →",
    exportPdfBtn: "আইনি নোটিশ PDF ডাউনলোড করুন",
    exportedPdfBtn: "PDF ডাউনলোড হয়েছে!",
    attachedEvidenceHeader: "সংযুক্ত প্রমাণসমূহ",
    recordedVoiceNotesHeader: "রেকর্ড করা ভয়েস নোট",
    recordNewBtn: "+ নতুন রেকর্ড",
    noVoiceNotesText: "এখনও কোনো ভয়েস নোট রেকর্ড করা হয়নি। স্ক্রিন ১-এ রেকর্ড করুন।",
    caseHistoryHeader: "কেস ইতিহাস লগ (Audit Trail)",
    loggedEventsSuffix: "নথিভুক্ত ঘটনা",
    logMilestonePlaceholder: "নতুন নোট যোগ করুন (যেমন স্পিড পোস্ট পাঠানো হয়েছে)...",
    logBtn: "+ যোগ করুন",
    limitationAlertTitle: "আইনি সময়সীমা সতর্কতা",
    needPlvTitle: "প্যারালিগ্যাল ভলান্টিয়ার (PLV) দ্বারা যাচাই চান?",
    needPlvSub: "বিনামূল্যে DLSA হেল্পডেস্ক · সোম–শনি, সকাল ১০ – বিকাল ৫",
    findAidHeader: "আপনার কাছে বিনামূল্যে আইনি সহায়তা খুঁজুন",
    findAidSub: "যাচাইকৃত NALSA, DLSA ও শ্রম দপ্তর",
    searchCenterPlaceholder: "আদালতের নাম, এলাকা বা পিন কোড খুঁজুন...",
    bookTokenBtn: "বিনামূল্যে আইনি সহায়তা টোকেন বুক করুন →",
    askAiGuideBtn: "AI গাইড",
    emergencyHelplinesTitle: "২৪×৭ জরুরি সরকারি হেল্পলাইন",
    needTeleLawTitle: "টেলি-ল (Tele-Law) ভিডিও পরামর্শ প্রয়োজন?",
    needTeleLawSub: "প্যানেল আইনজীবী বা AI ভয়েসের সাথে কথা বলুন",
    startVoiceCallBtn: "ভয়েস কল শুরু করুন",
  },
  "ગુજરાતી (Gujarati)": {
    appTitle: "ન્યાય સહાયક",
    appSubtitle: "નાગરિક કાનૂની સહાય",
    navHome: "હોમ",
    navExplainLaw: "કાયદો સમજો",
    navTrackCase: "કેસ ટ્રેક",
    navFindAid: "કાનૂની સહાય",
    screen1Title: "1. સમસ્યા જણાવો",
    screen2Title: "2. AI કાનૂની મૂલ્યાંકન",
    screen3Title: "3. નોટિસ અને પાત્રતા",
    screen4Title: "4. કાયદા લાઇબ્રેરી",
    screen5Title: "5. કાર્ય યોજના",
    screen6Title: "6. નજીકની કાનૂની સહાય",
    all6ScreensView: "બધી 6 સ્ક્રીન જુઓ",
    focusedView: "સિંગલ વ્યૂ",
    liveVoiceBtn: "લાઇવ વોઇસ",
    aiLegalChatBtn: "AI કાનૂની ચેટ",
    interactiveJourneyKicker: "ઇન્ટરેક્ટિવ 6-સ્ક્રીન નાગરિક કાનૂની યાત્રા",
    switchOrInspectHeading: "સ્ક્રીન બદલો અથવા બધી 6 સ્ક્રીન સાથે જુઓ",
    open6ScreenCanvas: "6-સ્ક્રીન કેનવાસ ખોલો",
    nalsaBannerTitle: "NALSA હેઠળ મફત કાનૂની સહાય",
    nalsaBannerSub: "24×7 ટોલ-ફ્રી રાષ્ટ્રીય હેલ્પલાઇન 15100",
    getAidBtn: "સહાય મેળવો →",
    heroKicker: "તમારી ભાષામાં AI કાનૂની માર્ગદર્શન",
    heroTitle: "આજે હું તમારી શું મદદ કરી શકું?",
    heroSubtitle:
      "તમારા કાનૂની અધિકારો અને આગળના પગલાં સમજવા માટે ગુજરાતી, હિન્દી અથવા અંગ્રેજીમાં બોલો અથવા ટાઇપ કરો.",
    tapToSpeakTitle: "Gemini Live Voice માં બોલવા માટે ટેપ કરો",
    tapToSpeakSub: "ગુજરાતી સહિત 33 ભારતીય ભાષાઓ ઉપલબ્ધ",
    typeProblemPlaceholder: "અથવા તમારી સમસ્યા અહીં ટાઇપ કરો...",
    recordVoiceNoteTitle: "પુરાવા માટે વોઇસ નોટ રેકોર્ડ કરો",
    recordingVoiceNoteTitle: "વોઇસ નોટ રેકોર્ડ થઈ રહી છે",
    recordVoiceNoteSub: "તમારું મૌખિક નિવેદન સેવ કરો",
    recordingInBackgroundSub: "બેકગ્રાઉન્ડમાં રેકોર્ડિંગ ચાલુ · સેવ કરવા રોકો",
    recordNoteBtn: "નોટ રેકોર્ડ",
    stopAndSaveBtn: "રોકો અને સેવ કરો",
    commonSituationsHeader: "સામાન્ય નાગરિક સમસ્યાઓ (તપાસવા માટે ટેપ કરો)",
    confidentialityBold: "100% ગોપનીય અને મફત માહિતી:",
    confidentialityText:
      "પ્રમાણિત ભારતીય કાનૂની અધિકારો અને પ્રક્રિયાઓ આપે છે. આ કોર્ટના વકીલનો વિકલ્પ નથી.",
    understandRightsHeader: "તમારા અધિકારો જાણો",
    viewAllBtn: "બધું જુઓ →",
    catPropertyTitle: "મિલકત અને ભાડા હક્કો",
    catPropertyDesc: "ડિપોઝિટ પરત, ગેરકાયદેસર ખાલી કરાવવું, ભાડા કાયદા",
    catLabourTitle: "શ્રમ અને પગાર",
    catLabourDesc: "બાકી પગાર, પીએફ, ખોટી છટણી",
    catFamilyTitle: "પરિવાર અને મહિલા હક્કો",
    catFamilyDesc: "ઘરેલુ હિંસા, ભરણપોષણ, રહેઠાણનો અધિકાર",
    catConsumerTitle: "ગ્રાહક અને સાયબર",
    catConsumerDesc: "UPI છેતરપિંડી, ખામીયુક્ત વસ્તુઓ, ઈ-દાખિલ",
    popularBadge: "લોકપ્રિય",
    citizenGuidesHeader: "નાગરિક માર્ગદર્શિકા અને કેસ સ્ટોરી",
    seeMoreBtn: "વધુ જુઓ →",
    readGuideBtn: "માર્ગદર્શિકા વાંચો →",
    tryCaseBtn: "આ કેસ જુઓ →",
    needGuidanceTitle: "ઇન્ટરેક્ટિવ AI માર્ગદર્શન જોઈએ છે?",
    needGuidanceSub: "Google Search આધારિત લીગલ AI સાથે ચેટ કરો",
    openChatBtn: "ચેટ ખોલો",
    aiAssessmentKicker: "AI કાનૂની મૂલ્યાંકન",
    listenBtn: "સાંભળો",
    stopBtn: "રોકો",
    yourSituationLabel: "તમે જણાવેલી પરિસ્થિતિ",
    editBtn: "ફેરફાર કરો",
    addByVoiceBtn: "અવાજથી ઉમેરો",
    askFollowUpBtn: "પ્રશ્ન પૂછો",
    analyzingStatutesText: "ભારતીય કાયદા અને કલમોનું વિશ્લેષણ થઈ રહ્યું છે...",
    whatLawSaysTitle: "સરળ શબ્દોમાં કાયદો શું કહે છે",
    questionsToStrengthenTitle: "તમારા કેસને મજબૂત કરવા માટેના પ્રશ્નો",
    tapToAnswerLabel: "જવાબ પસંદ કરો",
    recommendedNextStepsTitle: "ભલામણ કરેલ આગળના પગલાં",
    prepareNoticeCta: "મારી કાનૂની નોટિસ અને કાર્ય યોજના બનાવો →",
    prepareActionHeader: "કાનૂની કાર્યવાહીની તૈયારી",
    askAiAssistantBtn: "AI સહાયકને પૂછો",
    step2Of3Label: "તબક્કો 2 / 3 · પુરાવા અને કાનૂની નોટિસ",
    readyLabel: "66% તૈયાર",
    whyNoticeTitle: "લેખિત ડિમાન્ડ નોટિસથી કેમ શરૂઆત કરવી?",
    whyNoticeBody:
      "68% થી વધુ પગાર અને ભાડા વિવાદોમાં સાચી કલમો સાથે લેખિત નોટિસ મોકલવાથી કોર્ટમાં ગયા વિના 15 દિવસમાં ઉકેલ આવે છે.",
    evidenceChecklistHeader: "1. પુરાવા યાદી (Evidence Checklist)",
    scanDocumentBtn: "દસ્તાવેજ સ્કેન કરો",
    capturePhotoBtn: "ફોટો પાડો",
    retakePhotoBtn: "ફરી ફોટો પાડો",
    eligibilityHeader: "2. મફત કાનૂની સહાય પાત્રતા (NALSA)",
    aiNoticeDraftHeader: "3. AI કાનૂની નોટિસ ડ્રાફ્ટ",
    customizeWithAiBtn: "AI થી તૈયાર કરો",
    draftingText: "તૈયાર થઈ રહ્યું છે...",
    copyNoticeBtn: "કાનૂની નોટિસ કોપી / ડાઉનલોડ કરો",
    copiedNoticeBtn: "નોટિસ કોપી થઈ ગઈ!",
    saveAndProceedBtn: "સેવ કરો અને કાર્ય યોજના પર જાઓ →",
    activeJurisdictionLabel: "સક્રિય ક્ષેત્રાધિકાર",
    centralAndStateLabel: "ભારત · કેન્દ્ર અને રાજ્ય કાયદા",
    searchLawPlaceholder: "કાયદો અથવા કલમ શોધો (દા.ત. Sec 15, FIR)...",
    askAiShortBtn: "AI ને પૂછો",
    googleSearchConnectedNote:
      "BNS 2023 અને સુપ્રીમ કોર્ટ અપડેટ્સ માટે Google Search સાથે જોડાયેલ",
    matchingSectionsLabel: "સંબંધિત કાનૂની કલમો",
    explainWithAiBtn: "AI થી સમજો",
    faqHeader: "વારંવાર પૂછાતા નાગરિક પ્રશ્નો",
    unsureSectionTitle: "કઈ કલમ લાગુ પડે છે તે ખબર નથી?",
    unsureSectionSub: "અમારા લીગલ AI ચેટબોટને પૂછો",
    chatNowBtn: "અત્યારે ચેટ કરો",
    actionPlanTab: "કાર્ય યોજના (5)",
    draftsEvidenceTab: "ડ્રાફ્ટ અને પુરાવા",
    caseHistoryTab: "કેસ ઇતિહાસ",
    actionPlanStatusTitle: "કાનૂની કાર્ય યોજના સ્થિતિ",
    completeSuffix: "પૂર્ણ",
    completedStepsLabel: "પૂર્ણ થયેલા પગલાં",
    inProgressLabel: "ચાલુ",
    pendingActionsLabel: "બાકી પગલાં",
    tapCircleHint: "ચાર્ટ અપડેટ કરવા નીચેના કોઈપણ તબક્કા પર ટેપ કરો",
    stepTimelineHeader: "તમારી તબક્કાવાર સમયરેખા",
    savedNoticeHeader: "સેવ કરેલી કાનૂની નોટિસ અને યાદી",
    editDraftBtn: "ડ્રાફ્ટ બદલો →",
    exportPdfBtn: "કાનૂની નોટિસ PDF ડાઉનલોડ કરો",
    exportedPdfBtn: "PDF ડાઉનલોડ થઈ!",
    attachedEvidenceHeader: "જોડેલા પુરાવા",
    recordedVoiceNotesHeader: "રેકોર્ડ કરેલી વોઇસ નોટ્સ",
    recordNewBtn: "+ નવું રેકોર્ડ",
    noVoiceNotesText: "હજુ કોઈ વોઇસ નોટ રેકોર્ડ થઈ નથી. સ્ક્રીન 1 પર રેકોર્ડ કરો.",
    caseHistoryHeader: "કેસ ઇતિહાસ લોગ (Audit Trail)",
    loggedEventsSuffix: "નોંધાયેલ ઘટનાઓ",
    logMilestonePlaceholder: "નોંધ ઉમેરો (દા.ત. રજિસ્ટર્ડ પોસ્ટ મોકલી)...",
    logBtn: "+ ઉમેરો",
    limitationAlertTitle: "કાનૂની સમયમર્યાદા ચેતવણી",
    needPlvTitle: "પેરાલીગલ સ્વયંસેવક (PLV) પાસે તપાસ કરાવવી છે?",
    needPlvSub: "મફત DLSA હેલ્પડેસ્ક · સોમ–શનિ, સવારે 10 – સાંજે 5",
    findAidHeader: "તમારી નજીક મફત કાનૂની સહાય શોધો",
    findAidSub: "પ્રમાણિત NALSA, DLSA અને લેબર કચેરીઓ",
    searchCenterPlaceholder: "કોર્ટનું નામ, વિસ્તાર અથવા પિન કોડ શોધો...",
    bookTokenBtn: "મફત કાનૂની સહાય ટોકન બુક કરો →",
    askAiGuideBtn: "AI ગાઇડ",
    emergencyHelplinesTitle: "24×7 તાત્કાલિક સરકારી હેલ્પલાઇન",
    needTeleLawTitle: "ટેલી-લો (Tele-Law) વિડિયો સલાહ જોઈએ છે?",
    needTeleLawSub: "વકીલ અથવા AI વોઇસ સાથે વાત કરો",
    startVoiceCallBtn: "વોઇસ કોલ શરૂ કરો",
  },
  "اردو (Urdu)": {
    appTitle: "نیائے سہایک",
    appSubtitle: "شہری قانونی امداد",
    navHome: "ہوم",
    navExplainLaw: "قانون سمجھیں",
    navTrackCase: "کیس ٹریک",
    navFindAid: "قانونی مدد",
    screen1Title: "1. مسئلہ بیان کریں",
    screen2Title: "2. AI قانونی جائزہ",
    screen3Title: "3. نوٹس اور اہلیت",
    screen4Title: "4. قانون لائبریری",
    screen5Title: "5. لائحہ عمل",
    screen6Title: "6. قریبی قانونی امداد",
    all6ScreensView: "تمام 6 اسکرینیں دیکھیں",
    focusedView: "سنگل ویو",
    liveVoiceBtn: "لائیو وائس",
    aiLegalChatBtn: "AI قانونی چیٹ",
    interactiveJourneyKicker: "انٹرایکٹو 6-اسکرین شہری قانونی سفر",
    switchOrInspectHeading: "اسکرین بدلیں یا تمام 6 اسکرینیں ایک ساتھ دیکھیں",
    open6ScreenCanvas: "6-اسکرین کینوس کھولیں",
    nalsaBannerTitle: "NALSA کے تحت مفت قانونی امداد",
    nalsaBannerSub: "24×7 ٹول فری قومی ہیلپ لائن 15100",
    getAidBtn: "مدد حاصل کریں ←",
    heroKicker: "آپ کی زبان میں AI قانونی رہنمائی",
    heroTitle: "آج میں آپ کی کیا مدد کر سکتا ہوں؟",
    heroSubtitle:
      "اپنے قانونی حقوق اور اگلے اقدامات سمجھنے کے لیے اردو، ہندی یا انگریزی میں بولیں یا ٹائپ کریں۔",
    tapToSpeakTitle: "Gemini Live Voice میں بات کرنے کے لیے ٹیپ کریں",
    tapToSpeakSub: "اردو سمیت 33 ہندوستانی زبانیں دستیاب ہیں",
    typeProblemPlaceholder: "یا اپنا مسئلہ یہاں ٹائپ کریں...",
    recordVoiceNoteTitle: "ثبوت کے لیے وائس نوٹ ریکارڈ کریں",
    recordingVoiceNoteTitle: "وائس نوٹ ریکارڈ ہو رہا ہے",
    recordVoiceNoteSub: "اپنا زبانی بیان محفوظ کریں",
    recordingInBackgroundSub: "پس منظر میں ریکارڈنگ جاری · محفوظ کرنے کے لیے روکیں",
    recordNoteBtn: "ریکارڈ نوٹ",
    stopAndSaveBtn: "روکیں اور محفوظ کریں",
    commonSituationsHeader: "عام شہری مسائل (تجزیہ کے لیے ٹیپ کریں)",
    confidentialityBold: "100% رازداری اور مفت معلومات:",
    confidentialityText:
      "تصدیق شدہ ہندوستانی قانونی حقوق اور طریقہ کار فراہم کرتا ہے۔ یہ عدالتی وکیل کا متبادل نہیں ہے۔",
    understandRightsHeader: "اپنے حقوق جانیں",
    viewAllBtn: "سب دیکھیں ←",
    catPropertyTitle: "جائیداد اور کرایہ داری",
    catPropertyDesc: "ڈپازٹ واپسی، غیر قانونی بے دخلی، کرایہ قوانین",
    catLabourTitle: "محنت اور اجرت",
    catLabourDesc: "رکی ہوئی تنخواہ، پی ایف، غیر قانونی برطرفی",
    catFamilyTitle: "خاندان اور خواتین کے حقوق",
    catFamilyDesc: "گھریلو تشدد، نان و نفقہ، رہائش کا حق",
    catConsumerTitle: "صارف اور سائبر",
    catConsumerDesc: "UPI فراڈ، ناقص اشیاء، ای-داخل",
    popularBadge: "مقبول",
    citizenGuidesHeader: "شہری گائیڈز اور کیس اسٹوریز",
    seeMoreBtn: "مزید دیکھیں ←",
    readGuideBtn: "گائیڈ پڑھیں ←",
    tryCaseBtn: "یہ کیس دیکھیں ←",
    needGuidanceTitle: "انٹرایکٹو AI رہنمائی چاہیے؟",
    needGuidanceSub: "Google Search سے جڑے لیگل AI سے بات کریں",
    openChatBtn: "چیٹ کھولیں",
    aiAssessmentKicker: "AI قانونی جائزہ",
    listenBtn: "سنیں",
    stopBtn: "روکیں",
    yourSituationLabel: "آپ کی بیان کردہ صورتحال",
    editBtn: "تبدیل کریں",
    addByVoiceBtn: "آواز سے شامل کریں",
    askFollowUpBtn: "سوال پوچھیں",
    analyzingStatutesText: "ہندوستانی قوانین اور دفعات کا تجزیہ ہو رہا ہے...",
    whatLawSaysTitle: "آسان الفاظ میں قانون کیا کہتا ہے",
    questionsToStrengthenTitle: "آپ کے کیس کو مضبوط کرنے والے سوالات",
    tapToAnswerLabel: "جواب منتخب کریں",
    recommendedNextStepsTitle: "تجویز کردہ اگلے اقدامات",
    prepareNoticeCta: "میرا قانونی نوٹس اور لائحہ عمل تیار کریں ←",
    prepareActionHeader: "قانونی کارروائی کی تیاری",
    askAiAssistantBtn: "AI معاون سے پوچھیں",
    step2Of3Label: "مرحلہ 2 از 3 · ثبوت اور قانونی نوٹس",
    readyLabel: "66% تیار",
    whyNoticeTitle: "تحریری ڈیمانڈ نوٹس سے شروعات کیوں کریں؟",
    whyNoticeBody:
      "68 فیصد سے زائد تنخواہ اور کرایہ کے تنازعات میں قانونی دفعات کے ساتھ تحریری نوٹس بھیجنے سے عدالت جائے بغیر 15 دن میں مسئلہ حل ہو جاتا ہے۔",
    evidenceChecklistHeader: "1. ثبوتوں کی فہرست (Evidence Checklist)",
    scanDocumentBtn: "دستاویز اسکین کریں",
    capturePhotoBtn: "تصویر لیں",
    retakePhotoBtn: "دوبارہ تصویر لیں",
    eligibilityHeader: "2. مفت قانونی امداد کی اہلیت (NALSA)",
    aiNoticeDraftHeader: "3. AI قانونی نوٹس مسودہ",
    customizeWithAiBtn: "AI سے تیار کریں",
    draftingText: "تیار ہو رہا ہے...",
    copyNoticeBtn: "قانونی نوٹس کاپی / ڈاؤن لوڈ کریں",
    copiedNoticeBtn: "نوٹس کاپی ہو گیا!",
    saveAndProceedBtn: "محفوظ کریں اور لائحہ عمل پر جائیں ←",
    activeJurisdictionLabel: "فعال دائرہ اختیار",
    centralAndStateLabel: "بھارت · مرکزی اور ریاستی قوانین",
    searchLawPlaceholder: "قانون یا دفعہ تلاش کریں (مثلاً Sec 15, FIR)...",
    askAiShortBtn: "AI سے پوچھیں",
    googleSearchConnectedNote:
      "BNS 2023 اور سپریم کورٹ اپڈیٹس کے لیے Google Search سے منسلک",
    matchingSectionsLabel: "متعلقہ قانونی دفعات",
    explainWithAiBtn: "AI سے سمجھیں",
    faqHeader: "اکثر پوچھے जाने والے سوالات",
    unsureSectionTitle: "یقین نہیں کہ کون سی دفعہ لاگو ہوتی ہے؟",
    unsureSectionSub: "ہمارے لیگل AI چیٹ بوٹ سے پوچھیں",
    chatNowBtn: "ابھی چیٹ کریں",
    actionPlanTab: "لائحہ عمل (5)",
    draftsEvidenceTab: "مسودہ اور ثبوت",
    caseHistoryTab: "کیس کی تاریخ",
    actionPlanStatusTitle: "قانونی لائحہ عمل کی صورتحال",
    completeSuffix: "مکمل",
    completedStepsLabel: "مکمل مراحل",
    inProgressLabel: "جاری",
    pendingActionsLabel: "باقی اقدامات",
    tapCircleHint: "چارٹ اپڈیٹ کرنے کے لیے کسی بھی مرحلے پر ٹیپ کریں",
    stepTimelineHeader: "آپ کی مرحلہ وار ٹائم لائن",
    savedNoticeHeader: "محفوظ شدہ قانونی نوٹس اور فہرست",
    editDraftBtn: "مسودہ بدلیں ←",
    exportPdfBtn: "قانونی نوٹس PDF ڈاؤن لوڈ کریں",
    exportedPdfBtn: "PDF ڈاؤن لوڈ ہو گئی!",
    attachedEvidenceHeader: "منسلک ثبوت",
    recordedVoiceNotesHeader: "ریکارڈ شدہ وائس نوٹس",
    recordNewBtn: "+ نیا ریکارڈ",
    noVoiceNotesText: "ابھی کوئی وائس نوٹ ریکارڈ نہیں ہوا۔ اسکرین 1 پر ریکارڈ کریں۔",
    caseHistoryHeader: "کیس ہسٹری لاگ (Audit Trail)",
    loggedEventsSuffix: "درج واقعات",
    logMilestonePlaceholder: "نوٹ شامل کریں (مثلاً رجسٹرڈ پوسٹ بھیج دی)...",
    logBtn: "+ شامل کریں",
    limitationAlertTitle: "قانونی مدت کی تنبیہ",
    needPlvTitle: "پیرالیگل رضاکار (PLV) سے جائزہ لینا ہے؟",
    needPlvSub: "مفت DLSA ہیلپ ڈیسک · پیر تا ہفتہ، صبح 10 تا شام 5",
    findAidHeader: "اپنے قریب مفت قانونی امداد تلاش کریں",
    findAidSub: "تصدیق شدہ NALSA، DLSA اور لیبر دفاتر",
    searchCenterPlaceholder: "عدالت کا نام، علاقہ یا پن کوڈ تلاش کریں...",
    bookTokenBtn: "مفت قانونی امداد ٹوکن بک کریں ←",
    askAiGuideBtn: "AI گائیڈ",
    emergencyHelplinesTitle: "24×7 ہنگامی سرکاری ہیلپ لائنز",
    needTeleLawTitle: "ٹیلی لا (Tele-Law) ویڈیو مشورہ چاہیے؟",
    needTeleLawSub: "پینل وکیل یا AI وائس سے بات کریں",
    startVoiceCallBtn: "وائس کال شروع کریں",
  },
  "ಕನ್ನಡ (Kannada)": {
    appTitle: "ನ್ಯಾಯ ಸಹಾಯಕ",
    appSubtitle: "ನಾಗರಿಕ ಕಾನೂನು ನೆರವು",
    navHome: "ಮುಖಪುಟ",
    navExplainLaw: "ಕಾನೂನು ವಿವರಣೆ",
    navTrackCase: "ಕೇಸ್ ಟ್ರ್ಯಾಕ್",
    navFindAid: "ಕಾನೂನು ನೆರವು",
    screen1Title: "1. ಸಮಸ್ಯೆ ವಿವರಿಸಿ",
    screen2Title: "2. AI ಕಾನೂನು ವಿಶ್ಲೇಷಣೆ",
    screen3Title: "3. ನೋಟಿಸ್ ಮತ್ತು ಅರ್ಹತೆ",
    screen4Title: "4. ಕಾನೂನು ಗ್ರಂಥಾಲಯ",
    screen5Title: "5. ಕಾರ್ಯ ಯೋಜನೆ",
    screen6Title: "6. ಹತ್ತಿರದ ಕಾನೂನು ನೆರವು",
    all6ScreensView: "ಎಲ್ಲಾ 6 ಪರದೆಗಳು",
    focusedView: "ಏಕ ನೋಟ",
    liveVoiceBtn: "ಲೈವ್ ವಾಯ್ಸ್",
    aiLegalChatBtn: "AI ಕಾನೂನು ಚಾಟ್",
    interactiveJourneyKicker: "ಇಂಟರಾಕ್ಟಿವ್ 6-ಪರದೆ ನಾಗರಿಕ ಕಾನೂನು ಪ್ರಯಾಣ",
    switchOrInspectHeading: "ಪರದೆಗಳನ್ನು ಬದಲಿಸಿ ಅಥವಾ 6 ಪರದೆಗಳನ್ನು ಒಟ್ಟಿಗೆ ನೋಡಿ",
    open6ScreenCanvas: "6-ಪರದೆ ಕ್ಯಾನ್ವಾಸ್ ತೆರೆಯಿರಿ",
    nalsaBannerTitle: "NALSA ಅಡಿಯಲ್ಲಿ ಉಚಿತ ಕಾನೂನು ನೆರವು",
    nalsaBannerSub: "24×7 ಟೋಲ್-ಫ್ರೀ ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ 15100",
    getAidBtn: "ನೆರವು ಪಡೆಯಿರಿ →",
    heroKicker: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ AI ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ",
    heroTitle: "ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    heroSubtitle:
      "ನಿಮ್ಮ ಕಾನೂನು ಹಕ್ಕುಗಳು ಮತ್ತು ಮುಂದಿನ ಹಂತಗಳನ್ನು ತಿಳಿಯಲು ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.",
    tapToSpeakTitle: "Gemini Live Voice ನಲ್ಲಿ ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    tapToSpeakSub: "ಕನ್ನಡ ಸೇರಿದಂತೆ 33 ಭಾರತೀಯ ಭಾಷೆಗಳ ಬೆಂಬಲ",
    typeProblemPlaceholder: "ಅಥವಾ ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    recordVoiceNoteTitle: "ಸಾಕ್ಷ್ಯಕ್ಕಾಗಿ ವಾಯ್ಸ್ ನೋಟ್ ರೆಕಾರ್ಡ್ ಮಾಡಿ",
    recordingVoiceNoteTitle: "ವಾಯ್ಸ್ ನೋಟ್ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ",
    recordVoiceNoteSub: "ನಿಮ್ಮ ಹೇಳಿಕೆಯನ್ನು ಆಡಿಯೋ ಆಗಿ ಉಳಿಸಿ",
    recordingInBackgroundSub: "ಹಿನ್ನೆಲೆಯಲ್ಲಿ ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ · ಉಳಿಸಲು ನಿಲ್ಲಿಸಿ",
    recordNoteBtn: "ರೆಕಾರ್ಡ್ ನೋಟ್",
    stopAndSaveBtn: "ನಿಲ್ಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ",
    commonSituationsHeader: "ಸಾಮಾನ್ಯ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು (ವಿಶ್ಲೇಷಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ)",
    confidentialityBold: "100% ಗೌಪ್ಯ ಮತ್ತು ಉಚಿತ ಮಾಹಿತಿ:",
    confidentialityText:
      "ಪರಿಶೀಲಿಸಿದ ಭಾರತೀಯ ಕಾನೂನು ಹಕ್ಕುಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ. ಇದು ನ್ಯಾಯಾಲಯದ ವಕೀಲರಿಗೆ ಪರ್ಯಾಯವಲ್ಲ.",
    understandRightsHeader: "ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ",
    viewAllBtn: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ →",
    catPropertyTitle: "ಆಸ್ತಿ ಮತ್ತು ಬಾಡಿಗೆ",
    catPropertyDesc: "ಡಿಪಾಸಿಟ್ ಮರುಪಾವತಿ, ಅಕ್ರಮ ತೆರವು, ಬಾಡಿಗೆ ಕಾನೂನು",
    catLabourTitle: "ಕಾರ್ಮಿಕ ಮತ್ತು ವೇತನ",
    catLabourDesc: "ಬಾಕಿ ಸಂಬಳ, ಪಿಎಫ್, ಅಕ್ರಮ ವಜಾ",
    catFamilyTitle: "ಕುಟುಂಬ ಮತ್ತು ಮಹಿಳಾ ಹಕ್ಕುಗಳು",
    catFamilyDesc: "ಕೌಟುಂಬಿಕ ಹಿಂಸೆ, ಜೀವನಾಂಶ, ವಾಸದ ಹಕ್ಕು",
    catConsumerTitle: "ಗ್ರಾಹಕ ಮತ್ತು ಸೈಬರ್",
    catConsumerDesc: "UPI ವಂಚನೆ, ದೋಷಪೂರಿತ ವಸ್ತುಗಳು, ಇ-ದಾಖಿಲ್",
    popularBadge: "ಜನಪ್ರಿಯ",
    citizenGuidesHeader: "ನಾಗರಿಕ ಮಾರ್ಗದರ್ಶಿಗಳು ಮತ್ತು ಕೇಸ್ ಕಥೆಗಳು",
    seeMoreBtn: "ಇನ್ನಷ್ಟು →",
    readGuideBtn: "ಮಾರ್ಗದರ್ಶಿ ಓದಿ →",
    tryCaseBtn: "ಈ ಕೇಸ್ ನೋಡಿ →",
    needGuidanceTitle: "ಇಂಟರಾಕ್ಟಿವ್ AI ಮಾರ್ಗದರ್ಶನ ಬೇಕೇ?",
    needGuidanceSub: "Google Search ಆಧಾರಿತ ಲೀಗಲ್ AI ಜೊತೆ ಚಾಟ್ ಮಾಡಿ",
    openChatBtn: "ಚಾಟ್ ತೆರೆಯಿರಿ",
    aiAssessmentKicker: "AI ಕಾನೂನು ವಿಶ್ಲೇಷಣೆ",
    listenBtn: "ಕೇಳಿ",
    stopBtn: "ನಿಲ್ಲಿಸಿ",
    yourSituationLabel: "ನೀವು ವಿವರಿಸಿದ ಪರಿಸ್ಥಿತಿ",
    editBtn: "ತಿದ್ದಿ",
    addByVoiceBtn: "ಧ್ವನಿ ಮೂಲಕ ಸೇರಿಸಿ",
    askFollowUpBtn: "ಪ್ರಶ್ನೆ ಕೇಳಿ",
    analyzingStatutesText: "ಭಾರತೀಯ ಕಾನೂನು ಮತ್ತು ಕಲಂಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    whatLawSaysTitle: "ಸರಳ ಪದಗಳಲ್ಲಿ ಕಾನೂನು ಏನು ಹೇಳುತ್ತದೆ",
    questionsToStrengthenTitle: "ನಿಮ್ಮ ಪ್ರಕರಣವನ್ನು ಬಲಪಡಿಸುವ ಪ್ರಶ್ನೆಗಳು",
    tapToAnswerLabel: "ಉತ್ತರ ಆಯ್ಕೆಮಾಡಿ",
    recommendedNextStepsTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಮುಂದಿನ ಹಂತಗಳು",
    prepareNoticeCta: "ನನ್ನ ಲೀಗಲ್ ನೋಟಿಸ್ ಮತ್ತು ಕಾರ್ಯ ಯೋಜನೆ ರಚಿಸಿ →",
    prepareActionHeader: "ಕಾನೂನು ಕ್ರಮದ ಸಿದ್ಧತೆ",
    askAiAssistantBtn: "AI ಸಹಾಯಕರನ್ನು ಕೇಳಿ",
    step2Of3Label: "ಹಂತ 2 / 3 · ಸಾಕ್ಷ್ಯ ಮತ್ತು ಲೀಗಲ್ ನೋಟಿಸ್",
    readyLabel: "66% ಸಿದ್ಧ",
    whyNoticeTitle: "ಲಿಖಿತ ಡಿಮ್ಯಾಂಡ್ ನೋಟಿಸ್‌ನಿಂದ ಏಕೆ ಪ್ರಾರಂಭಿಸಬೇಕು?",
    whyNoticeBody:
      "68% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಂಬಳ ಮತ್ತು ಬಾಡಿಗೆ ವಿವಾದಗಳಲ್ಲಿ ಸರಿಯಾದ ಕಾನೂನು ಕಲಂಗಳನ್ನು ಉಲ್ಲೇಖಿಸಿ ನೋಟಿಸ್ ಕಳುಹಿಸುವುದರಿಂದ ನ್ಯಾಯಾಲಯಕ್ಕೆ ಹೋಗದೆ 15 ದಿನಗಳಲ್ಲಿ ಪರಿಹಾರ ಸಿಗುತ್ತದೆ.",
    evidenceChecklistHeader: "1. ಸಾಕ್ಷ್ಯಗಳ ಪಟ್ಟಿ (Evidence Checklist)",
    scanDocumentBtn: "ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    capturePhotoBtn: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    retakePhotoBtn: "ಮತ್ತೆ ತೆಗೆಯಿರಿ",
    eligibilityHeader: "2. ಉಚಿತ ಕಾನೂನು ನೆರವು ಅರ್ಹತೆ (NALSA)",
    aiNoticeDraftHeader: "3. AI ಲೀಗಲ್ ನೋಟಿಸ್ ಕರಡು",
    customizeWithAiBtn: "AI ಮೂಲಕ ರಚಿಸಿ",
    draftingText: "ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    copyNoticeBtn: "ಲೀಗಲ್ ನೋಟಿಸ್ ಕಾಪಿ / ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    copiedNoticeBtn: "ನೋಟಿಸ್ ಕಾಪಿ ಆಗಿದೆ!",
    saveAndProceedBtn: "ಉಳಿಸಿ ಮತ್ತು ಕಾರ್ಯ ಯೋಜನೆಗೆ ಮುಂದುವರಿಯಿರಿ →",
    activeJurisdictionLabel: "ಸಕ್ರಿಯ ವ್ಯಾಪ್ತಿ",
    centralAndStateLabel: "ಭಾರತ · ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಕಾನೂನುಗಳು",
    searchLawPlaceholder: "ಕಾಯ್ದೆ ಅಥವಾ ಕಲಂ ಹುಡುಕಿ (ಉದಾ. Sec 15, FIR)...",
    askAiShortBtn: "AI ಕೇಳಿ",
    googleSearchConnectedNote:
      "BNS 2023 ಮತ್ತು ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ಮಾಹಿತಿಗಾಗಿ Google Search ಸಂಪರ್ಕಿತ",
    matchingSectionsLabel: "ಹೊಂದಾಣಿಕೆಯಾಗುವ ಕಾನೂನು ಕಲಂಗಳು",
    explainWithAiBtn: "AI ವಿವರಣೆ",
    faqHeader: "ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
    unsureSectionTitle: "ಯಾವ ಕಲಂ ಅನ್ವಯಿಸುತ್ತದೆ ಎಂದು ಖಚಿತವಿಲ್ಲವೇ?",
    unsureSectionSub: "ನಮ್ಮ ಲೀಗಲ್ AI ಚಾಟ್‌ಬಾಟ್ ಕೇಳಿ",
    chatNowBtn: "ಈಗಲೇ ಚಾಟ್ ಮಾಡಿ",
    actionPlanTab: "ಕಾರ್ಯ ಯೋಜನೆ (5)",
    draftsEvidenceTab: "ಕರಡು ಮತ್ತು ಸಾಕ್ಷ್ಯ",
    caseHistoryTab: "ಕೇಸ್ ಇತಿಹಾಸ",
    actionPlanStatusTitle: "ಕಾನೂನು ಕಾರ್ಯ ಯೋಜನೆ ಸ್ಥಿತಿ",
    completeSuffix: "ಪೂರ್ಣ",
    completedStepsLabel: "ಪೂರ್ಣಗೊಂಡ ಹಂತಗಳು",
    inProgressLabel: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    pendingActionsLabel: "ಬಾಕಿ ಇರುವ ಕ್ರಮಗಳು",
    tapCircleHint: "ಚಾರ್ಟ್ ನವೀಕರಿಸಲು ಕೆಳಗಿನ ಯಾವುದೇ ಹಂತವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ",
    stepTimelineHeader: "ನಿಮ್ಮ ಹಂತಹಂತದ ಸಮಯರೇಖೆ",
    savedNoticeHeader: "ಉಳಿಸಿದ ಲೀಗಲ್ ನೋಟಿಸ್ ಮತ್ತು ಪಟ್ಟಿ",
    editDraftBtn: "ಕರಡು ತಿದ್ದಿ →",
    exportPdfBtn: "ಲೀಗಲ್ ನೋಟಿಸ್ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    exportedPdfBtn: "PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!",
    attachedEvidenceHeader: "ಲಗತ್ತಿಸಿದ ಸಾಕ್ಷ್ಯಗಳು",
    recordedVoiceNotesHeader: "ರೆಕಾರ್ಡ್ ಮಾಡಿದ ವಾಯ್ಸ್ ನೋಟ್ಸ್",
    recordNewBtn: "+ ಹೊಸ ರೆಕಾರ್ಡ್",
    noVoiceNotesText: "ಇನ್ನೂ ಯಾವುದೇ ವಾಯ್ಸ್ ನೋಟ್ ರೆಕಾರ್ಡ್ ಆಗಿಲ್ಲ. ಪರದೆ 1 ರಲ್ಲಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ.",
    caseHistoryHeader: "ಕೇಸ್ ಇತಿಹಾಸ ಲಾಗ್ (Audit Trail)",
    loggedEventsSuffix: "ದಾಖಲಾದ ಘಟನೆಗಳು",
    logMilestonePlaceholder: "ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ (ಉದಾ. ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ ಕಳುಹಿಸಲಾಗಿದೆ)...",
    logBtn: "+ ಸೇರಿಸಿ",
    limitationAlertTitle: "ಕಾನೂನು ಕಾಲಮಿತಿ ಎಚ್ಚರಿಕೆ",
    needPlvTitle: "ಪ್ಯಾರಾಲೀಗಲ್ ಸ್ವಯಂಸೇವಕರ (PLV) ಪರಿಶೀಲನೆ ಬೇಕೇ?",
    needPlvSub: "ಉಚಿತ DLSA ಹೆಲ್ಪ್‌ಡೆಸ್ಕ್ · ಸೋಮ–ಶನಿ, ಬೆ. 10 – ಸಂ. 5",
    findAidHeader: "ನಿಮ್ಮ ಹತ್ತಿರ ಉಚಿತ ಕಾನೂನು ನೆರವು ಹುಡುಕಿ",
    findAidSub: "ಪರಿಶೀಲಿಸಿದ NALSA, DLSA ಮತ್ತು ಕಾರ್ಮಿಕ ಕಚೇರಿಗಳು",
    searchCenterPlaceholder: "ನ್ಯಾಯಾಲಯದ ಹೆಸರು, ಪ್ರದೇಶ ಅಥವಾ ಪಿನ್ ಕೋಡ್ ಹುಡುಕಿ...",
    bookTokenBtn: "ಉಚಿತ ಕಾನೂನು ನೆರವು ಟೋಕನ್ ಬುಕ್ ಮಾಡಿ →",
    askAiGuideBtn: "AI ಗೈಡ್",
    emergencyHelplinesTitle: "24×7 ತುರ್ತು ಸರ್ಕಾರಿ ಸಹಾಯವಾಣಿಗಳು",
    needTeleLawTitle: "ಟೆಲಿ-ಲಾ (Tele-Law) ವಿಡಿಯೋ ಸಲಹೆ ಬೇಕೇ?",
    needTeleLawSub: "ವಕೀಲರು ಅಥವಾ AI ವಾಯ್ಸ್ ಜೊತೆ ಮಾತನಾಡಿ",
    startVoiceCallBtn: "ವಾಯ್ಸ್ ಕಾಲ್",
  },
  "ଓଡ଼ିଆ (Odia)": {
    ...TRANSLATIONS["বাংলা (Bengali)"],
    appTitle: "ନ୍ୟାୟ ସହାୟକ",
    appSubtitle: "ନାଗରିକ ଆଇନ ସହାୟତା",
    navHome: "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    navExplainLaw: "ଆଇନ ବୁଝନ୍ତୁ",
    navTrackCase: "କେସ୍ ଟ୍ରାକ୍",
    navFindAid: "ଆଇନ ସହାୟତା",
    screen1Title: "1. ସମସ୍ୟା କୁହନ୍ତୁ",
    screen2Title: "2. AI ଆଇନଗତ ମୂଲ୍ୟାଙ୍କନ",
    screen3Title: "3. ନୋଟିସ୍ ଓ ଯୋଗ୍ୟତା",
    screen4Title: "4. ଆଇନ ଲାଇବ୍ରେରୀ",
    screen5Title: "5. କାର୍ଯ୍ୟ ଯୋଜନା",
    screen6Title: "6. ନିକଟସ୍ଥ ଆଇନ ସହାୟତା",
    all6ScreensView: "ସବୁ ୬ଟି ସ୍କ୍ରିନ୍",
    focusedView: "ଏକକ ଦୃଶ୍ୟ",
    liveVoiceBtn: "ଲାଇଭ୍ ଭଏସ୍",
    aiLegalChatBtn: "AI ଆଇନ ଚାଟ୍",
    nalsaBannerTitle: "NALSA ଅଧୀନରେ ମାଗଣା ଆଇନ ସହାୟତା",
    nalsaBannerSub: "24×7 ଟୋଲ୍-ଫ୍ରି ଜାତୀୟ ହେଲ୍ପଲାଇନ୍ 15100",
    getAidBtn: "ସହାୟତା ପାଆନ୍ତୁ →",
    heroKicker: "ଆପଣଙ୍କ ଭାଷାରେ AI ଆଇନଗତ ମାର୍ଗଦର୍ଶନ",
    heroTitle: "ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    heroSubtitle:
      "ଆପଣଙ୍କ ଆଇନଗତ ଅଧିକାର ଏବଂ ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ ଜାଣିବା ପାଇଁ ଓଡ଼ିଆ, ହିନ୍ଦୀ କିମ୍ବା ଇଂରାଜୀରେ କୁହନ୍ତୁ ବା ଟାଇପ୍ କରନ୍ତୁ।",
    tapToSpeakTitle: "Gemini Live Voice ରେ କହିବା ପାଇଁ ଟାପ୍ କରନ୍ତୁ",
    tapToSpeakSub: "ଓଡ଼ିଆ ସମେତ ୩୩ଟି ଭାରତୀୟ ଭାଷା ସମର୍ଥିତ",
    typeProblemPlaceholder: "କିମ୍ବା ଆପଣଙ୍କ ସମସ୍ୟା ଏଠାରେ ଟାଇପ୍ କରନ୍ତୁ...",
    recordVoiceNoteTitle: "ପ୍ରମାଣ ପାଇଁ ଭଏସ୍ ନୋଟ୍ ରେକର୍ଡ କରନ୍ତୁ",
    recordingVoiceNoteTitle: "ଭଏସ୍ ନୋଟ୍ ରେକର୍ଡ ହେଉଛି",
    recordVoiceNoteSub: "ଆପଣଙ୍କ ବକ୍ତବ୍ୟ ସଂରକ୍ଷଣ କରନ୍ତୁ",
    recordNoteBtn: "ଭଏସ୍ ରେକର୍ଡ",
    stopAndSaveBtn: "ରଖନ୍ତୁ ଓ ସେଭ୍ କରନ୍ତୁ",
    commonSituationsHeader: "ସାଧାରଣ ନାଗରିକ ସମସ୍ୟା (ବିଶ୍ଳେଷଣ ପାଇଁ ଟାପ୍ କରନ୍ତୁ)",
    confidentialityBold: "୧୦୦% ଗୋପନୀୟ ଏବଂ ମାଗଣା ତଥ୍ୟ:",
    confidentialityText:
      "ଭାରତୀୟ ଆଇନଗତ ଅଧିକାର ଓ ପ୍ରକ୍ରିୟା ପ୍ରଦାନ କରେ। ଏହା କୋର୍ଟ ଓକିଲଙ୍କ ବିକଳ୍ପ ନୁହେଁ।",
    understandRightsHeader: "ଆପଣଙ୍କ ଅଧିକାର ଜାଣନ୍ତୁ",
    viewAllBtn: "ସବୁ ଦେଖନ୍ତୁ →",
    catPropertyTitle: "ସମ୍ପତ୍ତି ଓ ଭଡ଼ା",
    catPropertyDesc: "ଡିପୋଜିଟ୍ ଫେରସ୍ତ, ଅବୈଧ ଉଚ୍ଛେଦ, ଭଡ଼ା ଆଇନ",
    catLabourTitle: "ଶ୍ରମ ଓ ମଜୁରୀ",
    catLabourDesc: "ବକେୟା ଦରମା, ପିଏଫ୍, ଚାକିରିରୁ ବହିଷ୍କାର",
    catFamilyTitle: "ପରିବାର ଓ ମହିଳା ଅଧିକାର",
    catFamilyDesc: "ଘରୋଇ ହିଂସା, ଭରଣପୋଷଣ, ବାସସ୍ଥାନ ଅଧିକାର",
    catConsumerTitle: "ଗ୍ରାହକ ଓ ସାଇବର",
    catConsumerDesc: "UPI ଠକେଇ, ତ୍ରୁଟିପୂର୍ଣ୍ଣ ସାମଗ୍ରୀ, ଇ-ଦାଖିଲ",
    whatLawSaysTitle: "ସରଳ ଭାଷାରେ ଆଇନ କ’ଣ କହେ",
    questionsToStrengthenTitle: "ଆପଣଙ୍କ କେସ୍ ମଜବୁତ କରିବା ପାଇଁ ପ୍ରଶ୍ନ",
    tapToAnswerLabel: "ଉତ୍ତର ବାଛନ୍ତୁ",
    recommendedNextStepsTitle: "ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ",
    prepareNoticeCta: "ମୋର ଆଇନ ନୋଟିସ୍ ଓ କାର୍ଯ୍ୟ ଯୋଜନା ପ୍ରସ୍ତୁତ କରନ୍ତୁ →",
    prepareActionHeader: "ଆଇନଗତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ପ୍ରସ୍ତୁତି",
    askAiAssistantBtn: "AI ସହାୟକଙ୍କୁ ପଚାରନ୍ତୁ",
    step2Of3Label: "ପଦକ୍ଷେପ ୨ / ୩ · ପ୍ରମାଣ ଏବଂ ଆଇନ ନୋଟିସ୍",
    readyLabel: "୬୬% ପ୍ରସ୍ତୁତ",
    whyNoticeTitle: "ଲିଖିତ ଡିମାଣ୍ଡ ନୋଟିସ୍‌ରୁ କାହିଁକି ଆରମ୍ଭ କରିବେ?",
    whyNoticeBody:
      "ସଠିକ ଆଇନ ଧାରା ଉଲ୍ଲେଖ କରି ଲିଖିତ ନୋଟିସ୍ ପଠାଇବା ଦ୍ୱାରା ୬୮% ବିବାଦ କୋର୍ଟ ନଯାଇ ୧୫ ଦିନ ମଧ୍ୟରେ ସମାଧାନ ହୋଇଥାଏ।",
    evidenceChecklistHeader: "୧. ପ୍ରମାଣ ତାଲିକା (Evidence Checklist)",
    scanDocumentBtn: "ଦସ୍ତାବିଜ୍ ସ୍କାନ୍ କରନ୍ତୁ",
    capturePhotoBtn: "ଫଟୋ ଉଠାନ୍ତୁ",
    eligibilityHeader: "୨. ମାଗଣା ଆଇନ ସହାୟତା ଯୋଗ୍ୟତା (NALSA)",
    aiNoticeDraftHeader: "୩. AI ଆଇନ ନୋଟିସ୍ ଡ୍ରାଫ୍ଟ",
    customizeWithAiBtn: "AI ଦ୍ୱାରା ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    draftingText: "ଲେଖା ଚାଲିଛି...",
    copyNoticeBtn: "ଆଇନ ନୋଟିସ୍ କପି / ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
    copiedNoticeBtn: "ନୋଟିସ୍ କପି ହୋଇଗଲା!",
    saveAndProceedBtn: "ସେଭ୍ କରନ୍ତୁ ଏବଂ କାର୍ଯ୍ୟ ଯୋଜନାକୁ ଯାଆନ୍ତୁ →",
    activeJurisdictionLabel: "ସକ୍ରିୟ ନ୍ୟାୟକ୍ଷେତ୍ର",
    centralAndStateLabel: "ଭାରତ · କେନ୍ଦ୍ରୀୟ ଓ ରାଜ୍ୟ ଆଇନ",
    searchLawPlaceholder: "ଆଇନ ବା ଧାରା ଖୋଜନ୍ତୁ (ଯେପରି Sec 15, FIR)...",
    askAiShortBtn: "AI ପଚାରନ୍ତୁ",
    matchingSectionsLabel: "ସମ୍ପର୍କିତ ଆଇନଗତ ଧାରା",
    explainWithAiBtn: "AI ସହିତ ବୁଝନ୍ତୁ",
    faqHeader: "ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ",
    unsureSectionTitle: "କେଉଁ ଧାରା ଲାଗୁ ହେବ ସ୍ପଷ୍ଟ ନୁହେଁ କି?",
    unsureSectionSub: "ଆମ ଲିଗାଲ୍ AI ଚାଟ୍‌ବଟ୍‌କୁ ପଚାରନ୍ତୁ",
    chatNowBtn: "ବର୍ତ୍ତମାନ ଚାଟ୍ କରନ୍ତୁ",
    actionPlanTab: "କାର୍ଯ୍ୟ ଯୋଜନା (5)",
    draftsEvidenceTab: "ଡ୍ରାଫ୍ଟ ଓ ପ୍ରମାଣ",
    caseHistoryTab: "କେସ୍ ଇତିହାସ",
    actionPlanStatusTitle: "ଆଇନଗତ କାର୍ଯ୍ୟ ଯୋଜନାର ସ୍ଥିତି",
    completeSuffix: "ସମ୍ପୂର୍ଣ୍ଣ",
    completedStepsLabel: "ସମ୍ପନ୍ନ ପଦକ୍ଷେପ",
    inProgressLabel: "ଚାଲୁ ରହିଛି",
    pendingActionsLabel: "ବାକି ପଦକ୍ଷେପ",
    stepTimelineHeader: "ଆପଣଙ୍କ ପର୍ଯ୍ୟାୟକ୍ରମିକ ସମୟରେଖା",
    savedNoticeHeader: "ସଂରକ୍ଷିତ ଆଇନ ନୋଟିସ୍ ଓ ତାଲିକା",
    editDraftBtn: "ଡ୍ରାଫ୍ଟ ସମ୍ପାଦନା →",
    exportPdfBtn: "ଆଇନ ନୋଟିସ୍ PDF ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
    exportedPdfBtn: "PDF ଡାଉନଲୋଡ୍ ହୋଇଗଲା!",
    attachedEvidenceHeader: "ସଂଲଗ୍ନ ପ୍ରମାଣ",
    recordedVoiceNotesHeader: "ରେକର୍ଡ ହୋଇଥିବା ଭଏସ୍ ନୋଟ୍",
    recordNewBtn: "+ ନୂଆ ରେକର୍ଡ",
    noVoiceNotesText: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଭଏସ୍ ନୋଟ୍ ନାହିଁ। ସ୍କ୍ରିନ୍ ୧ରେ ରେକର୍ଡ କରନ୍ତୁ।",
    caseHistoryHeader: "କେସ୍ ଇତିହାସ ଅଡିଟ୍ ଲଗ୍",
    loggedEventsSuffix: "ଘଟଣା",
    logMilestonePlaceholder: "ନୋଟ୍ ଯୋଡ଼ନ୍ତୁ (ଯେପରି ସ୍ପିଡ୍ ପୋଷ୍ଟ ପଠାଗଲା)...",
    logBtn: "+ ଯୋଡ଼ନ୍ତୁ",
    limitationAlertTitle: "ଆଇନଗତ ସମୟସୀମା ଚେତାବନୀ",
    findAidHeader: "ଆପଣଙ୍କ ନିକଟରେ ମାଗଣା ଆଇନ ସହାୟତା ଖୋଜନ୍ତୁ",
    findAidSub: "ପ୍ରମାଣିତ NALSA, DLSA ଓ ଶ୍ରମ ଅଫିସ୍",
    searchCenterPlaceholder: "କୋର୍ଟ ନାମ, ଅଞ୍ଚଳ ବା ପିନ୍ କୋଡ୍ ଖୋଜନ୍ତୁ...",
    bookTokenBtn: "ମାଗଣା ଆଇନ ସହାୟତା ଟୋକନ୍ ବୁକ୍ କରନ୍ତୁ →",
    emergencyHelplinesTitle: "୨୪×୭ ଜରୁରୀ ସରକାରୀ ହେଲ୍ପଲାଇନ୍",
    needTeleLawTitle: "ଟେଲି-ଲ’ (Tele-Law) ଭିଡିଓ ପରାମର୍ଶ ଆବଶ୍ୟକ କି?",
    needTeleLawSub: "ପ୍ୟାନେଲ୍ ଓକିଲ ବା AI ଭଏସ୍ ସହିତ କଥା ହୁଅନ୍ତୁ",
    startVoiceCallBtn: "ଭଏସ୍ କଲ୍ ଆରମ୍ଭ କରନ୍ତୁ",
  },
  "മലയാളം (Malayalam)": {
    ...TRANSLATIONS["தமிழ் (Tamil)"],
    appTitle: "ന്യായ സഹായക്",
    appSubtitle: "പൗര നിയമ സഹായം",
    navHome: "ഹോം",
    navExplainLaw: "നിയമം അറിയുക",
    navTrackCase: "കേസ് ട്രാക്ക്",
    navFindAid: "നിയമ സഹായം",
    screen1Title: "1. പ്രശ്നം വിവരിക്കുക",
    screen2Title: "2. AI നിയമ വിലയിരുത്തൽ",
    screen3Title: "3. നോട്ടീസും യോഗ്യതയും",
    screen4Title: "4. നിയമ ലൈബ്രറി",
    screen5Title: "5. കർമ്മ പദ്ധതി",
    screen6Title: "6. അടുത്തുള്ള നിയമ സഹായം",
    all6ScreensView: "6 സ്ക്രീനുകളും കാണുക",
    focusedView: "സിംഗിൾ വ്യൂ",
    liveVoiceBtn: "ലൈവ് വോയ്സ്",
    aiLegalChatBtn: "AI ലീഗൽ ചാറ്റ്",
    nalsaBannerTitle: "NALSA-യ്ക്ക് കീഴിൽ സൗജന്യ നിയമ സഹായം",
    nalsaBannerSub: "24×7 ടോൾ-ഫ്രീ ദേശീയ ഹെൽപ്പ്‌ലൈൻ 15100",
    getAidBtn: "സഹായം നേടുക →",
    heroKicker: "നിങ്ങളുടെ ഭാഷയിൽ AI നിയമ മാർഗ്ഗനിർദ്ദേശം",
    heroTitle: "ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    heroSubtitle:
      "നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങളും അടുത്ത നടപടികളും മനസ്സിലാക്കാൻ മലയാളം, ഹിന്ദി അല്ലെങ്കിൽ ഇംഗ്ലീഷിൽ സംസാരിക്കുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക.",
    tapToSpeakTitle: "Gemini Live Voice-ൽ സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക",
    tapToSpeakSub: "മലയാളം ഉൾപ്പെടെ 33 ഇന്ത്യൻ ഭാഷകൾ പിന്തുണയ്ക്കുന്നു",
    typeProblemPlaceholder: "അല്ലെങ്കിൽ നിങ്ങളുടെ പ്രശ്നം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    recordVoiceNoteTitle: "തെളിവുകൾക്കായി വോയ്സ് നോട്ട് റെക്കോർഡ് ചെയ്യുക",
    recordingVoiceNoteTitle: "വോയ്സ് നോട്ട് റെക്കോർഡ് ചെയ്യുന്നു",
    recordVoiceNoteSub: "നിങ്ങളുടെ മൊഴി സുരക്ഷിതമായി സൂക്ഷിക്കുക",
    recordNoteBtn: "വോയ്സ് നോട്ട്",
    stopAndSaveBtn: "നിർത്തുക & സൂക്ഷിക്കുക",
    commonSituationsHeader: "സാധാരണ പൗര പ്രശ്നങ്ങൾ (പരിശോധിക്കാൻ ടാപ്പ് ചെയ്യുക)",
    confidentialityBold: "100% രഹസ്യവും സൗജന്യവുമായ വിവരങ്ങൾ:",
    confidentialityText:
      "സ്ഥിരീകരിച്ച ഇന്ത്യൻ നിയമപരമായ അവകാശങ്ങൾ നൽകുന്നു. ഇത് കോടതി വക്കീലിന് പകരമല്ല.",
    understandRightsHeader: "നിങ്ങളുടെ അവകാശങ്ങൾ മനസ്സിലാക്കുക",
    viewAllBtn: "എല്ലാം കാണുക →",
    catPropertyTitle: "വസ്തുവും വാടകയും",
    catPropertyDesc: "സെക്യൂരിറ്റി ഡിപ്പോസിറ്റ്, വാടക നിയമങ്ങൾ",
    catLabourTitle: "തൊഴിലും വേതനവും",
    catLabourDesc: "കുടിശ്ശിക ശമ്പളം, പി.എഫ്, പിരിച്ചുവിടൽ",
    catFamilyTitle: "കുടുംബവും സ്ത്രീകളുടെ അവകാശങ്ങളും",
    catFamilyDesc: "ഗാർഹിക പീഡനം, ജീവനാംശം, താമസിക്കാനുള്ള അവകാശം",
    catConsumerTitle: "ഉപഭോക്തൃ & സൈബർ",
    catConsumerDesc: "UPI തട്ടിപ്പ്, കേടുവന്ന സാധനങ്ങൾ, ഇ-ദാഖിൽ",
    whatLawSaysTitle: "ലളിതമായ വാക്കുകളിൽ നിയമം പറയുന്നത്",
    questionsToStrengthenTitle: "നിങ്ങളുടെ കേസ് ശക്തിപ്പെടുത്താനുള്ള ചോദ്യങ്ങൾ",
    tapToAnswerLabel: "ഉത്തരം തിരഞ്ഞെടുക്കുക",
    recommendedNextStepsTitle: "ശുപാർശ ചെയ്യുന്ന അടുത്ത നടപടികൾ",
    prepareNoticeCta: "എന്റെ വക്കീൽ നോട്ടീസും കർമ്മ പദ്ധതിയും തയ്യാറാക്കുക →",
    prepareActionHeader: "നിയമ നടപടികളുടെ തയ്യാറെടുപ്പ്",
    askAiAssistantBtn: "AI അസിസ്റ്റന്റിനോട് ചോദിക്കുക",
    step2Of3Label: "ഘട്ടം 2 / 3 · തെളിവുകളും നിയമ നോട്ടീസും",
    readyLabel: "66% തയ്യാറാണ്",
    whyNoticeTitle: "എഴുത്തുപൂർവ്വമായ നോട്ടീസോടെ തുടങ്ങുന്നത് എന്തുകൊണ്ട്?",
    whyNoticeBody:
      "ശമ്പളം, വാടക തർക്കങ്ങളിൽ കൃത്യമായ നിയമ വകുപ്പുകൾ ഉദ്ധരിച്ച് നോട്ടീസ് അയക്കുന്നത് കോടതിയിൽ പോകാതെ 15 ദിവസത്തിനകം പരിഹാരം നൽകുന്നു.",
    evidenceChecklistHeader: "1. തെളിവ് പട്ടിക (Evidence Checklist)",
    scanDocumentBtn: "രേഖ സ്കാൻ ചെയ്യുക",
    capturePhotoBtn: "ഫോട്ടോ എടുക്കുക",
    eligibilityHeader: "2. സൗജന്യ നിയമ സഹായ യോഗ്യത (NALSA)",
    aiNoticeDraftHeader: "3. AI ലീഗൽ നോട്ടീസ് ഡ്രാഫ്റ്റ്",
    customizeWithAiBtn: "AI ഉപയോഗിച്ച് തയ്യാറാക്കുക",
    draftingText: "തയ്യാറാക്കുന്നു...",
    copyNoticeBtn: "ലീഗൽ നോട്ടീസ് കോപ്പി / ഡൗൺലോഡ് ചെയ്യുക",
    copiedNoticeBtn: "നോട്ടീസ് കോപ്പി ചെയ്തു!",
    saveAndProceedBtn: "സൂക്ഷിച്ച് കർമ്മ പദ്ധതിയിലേക്ക് പോകുക →",
    activeJurisdictionLabel: "സജീവ അധികാരപരിധി",
    centralAndStateLabel: "ഇന്ത്യ · കേന്ദ്ര & സംസ്ഥാന നിയമങ്ങൾ",
    searchLawPlaceholder: "നിയമം അല്ലെങ്കിൽ വകുപ്പ് തിരയുക (ഉദാ: Sec 15, FIR)...",
    askAiShortBtn: "AI-യോട് ചോദിക്കുക",
    matchingSectionsLabel: "ബാധകമായ നിയമ വകുപ്പുകൾ",
    explainWithAiBtn: "AI വിശദീകരണം",
    faqHeader: "പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ",
    unsureSectionTitle: "ഏത് വകുപ്പാണ് ബാധകമെന്ന് ഉറപ്പില്ലേ?",
    unsureSectionSub: "ഞങ്ങളുടെ ലീഗൽ AI ചാറ്റ്ബോട്ടിനോട് ചോദിക്കുക",
    chatNowBtn: "ഇപ്പോൾ ചാറ്റ് ചെയ്യുക",
    actionPlanTab: "കർമ്മ പദ്ധതി (5)",
    draftsEvidenceTab: "ഡ്രാഫ്റ്റും തെളിവും",
    caseHistoryTab: "കേസ് ചരിത്രം",
    actionPlanStatusTitle: "നിയമ കർമ്മ പദ്ധതി നില",
    completeSuffix: "പൂർത്തിയായി",
    completedStepsLabel: "പൂർത്തിയായ ഘട്ടങ്ങൾ",
    inProgressLabel: "നടന്നുകൊണ്ടിരിക്കുന്നത്",
    pendingActionsLabel: "ശേഷിക്കുന്ന നടപടികൾ",
    stepTimelineHeader: "നിങ്ങളുടെ ഘട്ടം ഘട്ടമായുള്ള സമയക്രമം",
    savedNoticeHeader: "സൂക്ഷിച്ച ലീഗൽ നോട്ടീസും തെളിവുകളും",
    editDraftBtn: "ഡ്രാഫ്റ്റ് തിരുത്തുക →",
    exportPdfBtn: "ലീഗൽ നോട്ടീസ് PDF ഡൗൺലോഡ് ചെയ്യുക",
    exportedPdfBtn: "PDF ഡൗൺലോഡ് ചെയ്തു!",
    attachedEvidenceHeader: "ചേർത്ത തെളിവുകൾ",
    recordedVoiceNotesHeader: "റെക്കോർഡ് ചെയ്ത വോയ്സ് നോട്ടുകൾ",
    recordNewBtn: "+ പുതിയ റെക്കോർഡ്",
    noVoiceNotesText: "വോയ്സ് നോട്ടുകൾ ലഭ്യമല്ല. സ്ക്രീൻ 1-ൽ നിങ്ങളുടെ മൊഴി റെക്കോർഡ് ചെയ്യുക.",
    caseHistoryHeader: "കേസ് ചരിത്ര ലോഗ് (Audit Trail)",
    loggedEventsSuffix: "രേഖപ്പെടുത്തിയ സംഭവങ്ങൾ",
    logMilestonePlaceholder: "പുതിയ കുറിപ്പ് ചേർക്കുക (ഉദാ: സ്പീഡ് പോസ്റ്റ് അയച്ചു)...",
    logBtn: "+ ചേർക്കുക",
    limitationAlertTitle: "നിയമ കാലപരിധി മുന്നറിയിപ്പ്",
    findAidHeader: "നിങ്ങളുടെ അടുത്തുള്ള സൗജന്യ നിയമ സഹായം കണ്ടെത്തുക",
    findAidSub: "സ്ഥിരീകരിച്ച NALSA, DLSA, തൊഴിൽ ഓഫീസുകൾ",
    searchCenterPlaceholder: "കോടതി പേര്, പ്രദേശം അല്ലെങ്കിൽ പിൻകോഡ് തിരയുക...",
    bookTokenBtn: "സൗജന്യ നിയമ സഹായ ടോക്കൺ ബുക്ക് ചെയ്യുക →",
    emergencyHelplinesTitle: "24×7 അടിയന്തര സർക്കാർ ഹെൽപ്പ്‌ലൈനുകൾ",
    needTeleLawTitle: "ടെലി-ലോ (Tele-Law) വീഡിയോ ഉപദേശം വേണമെന്നുണ്ടോ?",
    needTeleLawSub: "പാനൽ വക്കീൽ അല്ലെങ്കിൽ AI വോയ്സുമായി സംസാരിക്കുക",
    startVoiceCallBtn: "വോയ്സ് കോൾ തുടങ്ങുക",
  },
  "ਪੰਜਾਬੀ (Punjabi)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "ਨਿਆਂ ਸਹਾਇਕ",
    appSubtitle: "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ",
    navHome: "ਮੁੱਖ ਪੰਨਾ",
    navExplainLaw: "ਕਾਨੂੰਨ ਸਮਝੋ",
    navTrackCase: "ਕੇਸ ਟ੍ਰੈਕ",
    navFindAid: "ਕਾਨੂੰਨੀ ਮਦਦ",
    screen1Title: "1. ਸਮੱਸਿਆ ਦੱਸੋ",
    screen2Title: "2. AI ਕਾਨੂੰਨੀ ਮੁਲਾਂਕਣ",
    screen3Title: "3. ਨੋਟਿਸ ਅਤੇ ਯੋਗਤਾ",
    screen4Title: "4. ਕਾਨੂੰਨ ਲਾਇਬ੍ਰੇਰੀ",
    screen5Title: "5. ਕਾਰਜ ਯੋਜਨਾ",
    screen6Title: "6. ਨੇੜਲੀ ਕਾਨੂੰਨੀ ਮਦਦ",
    all6ScreensView: "ਸਾਰੀਆਂ 6 ਸਕ੍ਰੀਨਾਂ",
    focusedView: "ਸਿੰਗਲ ਵਿਊ",
    liveVoiceBtn: "ਲਾਈਵ ਵੌਇਸ",
    aiLegalChatBtn: "AI ਕਾਨੂੰਨੀ ਚੈਟ",
    nalsaBannerTitle: "NALSA ਅਧੀਨ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ",
    nalsaBannerSub: "24×7 ਟੋਲ-ਫ੍ਰੀ ਰਾਸ਼ਟਰੀ ਹੈਲਪਲਾਈਨ 15100",
    getAidBtn: "ਮਦਦ ਲਓ →",
    heroKicker: "ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ AI ਕਾਨੂੰਨੀ ਮਾਰਗਦਰਸ਼ਨ",
    heroTitle: "ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    heroSubtitle:
      "ਆਪਣੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰਾਂ ਅਤੇ ਅਗਲੇ ਕਦਮਾਂ ਨੂੰ ਸਮਝਣ ਲਈ ਪੰਜਾਬੀ, ਹਿੰਦੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਟਾਈਪ ਕਰੋ।",
    tapToSpeakTitle: "Gemini Live Voice ਵਿੱਚ ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ",
    tapToSpeakSub: "ਪੰਜਾਬੀ ਸਮੇਤ 33 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਸਮਰਥਿਤ",
    typeProblemPlaceholder: "ਜਾਂ ਆਪਣੀ ਸਮੱਸਿਆ ਇੱਥੇ ਟਾਈਪ ਕਰੋ...",
    recordVoiceNoteTitle: "ਸਬੂਤ ਲਈ ਵੌਇਸ ਨੋਟ ਰਿਕਾਰਡ ਕਰੋ",
    recordingVoiceNoteTitle: "ਵੌਇਸ ਨੋਟ ਰਿਕਾਰਡ ਹੋ ਰਿਹਾ ਹੈ",
    recordVoiceNoteSub: "ਆਪਣਾ ਬਿਆਨ ਸੁਰੱਖਿਅਤ ਕਰੋ",
    recordNoteBtn: "ਵੌਇਸ ਨੋਟ",
    stopAndSaveBtn: "ਰੋਕੋ ਤੇ ਸੇਵ ਕਰੋ",
    commonSituationsHeader: "ਆਮ ਨਾਗਰਿਕ ਸਮੱਸਿਆਵਾਂ (ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਟੈਪ ਕਰੋ)",
    confidentialityBold: "100% ਗੁਪਤ ਅਤੇ ਮੁਫ਼ਤ ਜਾਣਕਾਰੀ:",
    confidentialityText:
      "ਭਾਰਤੀ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰ ਅਤੇ ਪ੍ਰਕਿਰਿਆਵਾਂ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਇਹ ਅਦਾਲਤੀ ਵਕੀਲ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ।",
    understandRightsHeader: "ਆਪਣੇ ਅਧਿਕਾਰ ਜਾਣੋ",
    viewAllBtn: "ਸਭ ਦੇਖੋ →",
    catPropertyTitle: "ਜਾਇਦਾਦ ਅਤੇ ਕਿਰਾਏਦਾਰੀ",
    catPropertyDesc: "ਸਿਕਿਉਰਿਟੀ ਡਿਪਾਜ਼ਿਟ, ਗੈਰ-ਕਾਨੂੰਨੀ ਬੇਦਖਲੀ, ਕਿਰਾਇਆ ਕਾਨੂੰਨ",
    catLabourTitle: "ਕਿਰਤ ਅਤੇ ਤਨਖਾਹ",
    catLabourDesc: "ਬਕਾਇਆ ਤਨਖਾਹ, ਪੀਐਫ, ਨੌਕਰੀ ਤੋਂ ਬਰਖਾਸਤਗੀ",
    catFamilyTitle: "ਪਰਿਵਾਰ ਅਤੇ ਮਹਿਲਾ ਅਧਿਕਾਰ",
    catFamilyDesc: "ਘਰੇਲੂ ਹਿੰਸਾ, ਗੁਜ਼ਾਰਾ ਭੱਤਾ, ਰਿਹਾਇਸ਼ ਦਾ ਅਧਿਕਾਰ",
    catConsumerTitle: "ਖਪਤਕਾਰ ਅਤੇ ਸਾਈਬਰ",
    catConsumerDesc: "UPI ਧੋਖਾਧੜੀ, ਖਰਾਬ ਸਾਮਾਨ, ਈ-ਦਾਖਿਲ",
    whatLawSaysTitle: "ਸਰਲ ਸ਼ਬਦਾਂ ਵਿੱਚ ਕਾਨੂੰਨ ਕੀ ਕਹਿੰਦਾ ਹੈ",
    questionsToStrengthenTitle: "ਤੁਹਾਡੇ ਕੇਸ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰਨ ਲਈ ਸਵਾਲ",
    tapToAnswerLabel: "ਜਵਾਬ ਚੁਣੋ",
    recommendedNextStepsTitle: "ਸੁਝਾਏ ਗਏ ਅਗਲੇ ਕਦਮ",
    prepareNoticeCta: "ਮੇਰਾ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਅਤੇ ਕਾਰਜ ਯੋਜਨਾ ਬਣਾਓ →",
    prepareActionHeader: "ਕਾਨੂੰਨੀ ਕਾਰਵਾਈ ਦੀ ਤਿਆਰੀ",
    askAiAssistantBtn: "AI ਸਹਾਇਕ ਨੂੰ ਪੁੱਛੋ",
    step2Of3Label: "ਕਦਮ 2 / 3 · ਸਬੂਤ ਅਤੇ ਕਾਨੂੰਨੀ ਨੋਟਿਸ",
    readyLabel: "66% ਤਿਆਰ",
    whyNoticeTitle: "ਲਿਖਤੀ ਮੰਗ ਨੋਟਿਸ ਨਾਲ ਸ਼ੁਰੂਆਤ ਕਿਉਂ ਕਰੀਏ?",
    whyNoticeBody:
      "ਤਨਖਾਹ ਅਤੇ ਕਿਰਾਇਆ ਝਗੜਿਆਂ ਵਿੱਚ ਸਹੀ ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ ਦਾ ਹਵਾਲਾ ਦੇ ਕੇ ਲਿਖਤੀ ਨੋਟਿਸ ਭੇਜਣ ਨਾਲ ਬਿਨਾਂ ਅਦਾਲਤ ਗਏ 15 ਦਿਨਾਂ ਵਿੱਚ ਹੱਲ ਨਿਕਲਦਾ ਹੈ।",
    evidenceChecklistHeader: "1. ਸਬੂਤ ਸੂਚੀ (Evidence Checklist)",
    scanDocumentBtn: "ਦਸਤਾਵੇਜ਼ ਸਕੈਨ ਕਰੋ",
    capturePhotoBtn: "ਫੋਟੋ ਖਿੱਚੋ",
    eligibilityHeader: "2. ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਯੋਗਤਾ (NALSA)",
    aiNoticeDraftHeader: "3. AI ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਡਰਾਫਟ",
    customizeWithAiBtn: "AI ਨਾਲ ਤਿਆਰ ਕਰੋ",
    draftingText: "ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ...",
    copyNoticeBtn: "ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਕਾਪੀ / ਡਾਊਨਲੋਡ ਕਰੋ",
    copiedNoticeBtn: "ਨੋਟਿਸ ਕਾਪੀ ਹੋ ਗਿਆ!",
    saveAndProceedBtn: "ਸੇਵ ਕਰੋ ਅਤੇ ਕਾਰਜ ਯੋਜਨਾ 'ਤੇ ਜਾਓ →",
    activeJurisdictionLabel: "ਸਰਗਰਮ ਅਧਿਕਾਰ ਖੇਤਰ",
    centralAndStateLabel: "ਭਾਰਤ · ਕੇਂਦਰੀ ਅਤੇ ਰਾਜ ਕਾਨੂੰਨ",
    searchLawPlaceholder: "ਕਾਨੂੰਨ ਜਾਂ ਧਾਰਾ ਖੋਜੋ (ਜਿਵੇਂ Sec 15, FIR)...",
    askAiShortBtn: "AI ਤੋਂ ਪੁੱਛੋ",
    matchingSectionsLabel: "ਸੰਬੰਧਿਤ ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ",
    explainWithAiBtn: "AI ਤੋਂ ਸਮਝੋ",
    faqHeader: "ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ",
    unsureSectionTitle: "ਕਿਹੜੀ ਧਾਰਾ ਲਾਗੂ ਹੁੰਦੀ ਹੈ, ਪੱਕਾ ਪਤਾ ਨਹੀਂ?",
    unsureSectionSub: "ਸਾਡੇ ਲੀਗਲ AI ਚੈਟਬੋਟ ਤੋਂ ਪੁੱਛੋ",
    chatNowBtn: "ਹੁਣੇ ਗੱਲਬਾਤ ਕਰੋ",
    actionPlanTab: "ਕਾਰਜ ਯੋਜਨਾ (5)",
    draftsEvidenceTab: "ਡਰਾਫਟ ਅਤੇ ਸਬੂਤ",
    caseHistoryTab: "ਕੇਸ ਇਤਿਹਾਸ",
    actionPlanStatusTitle: "ਕਾਨੂੰਨੀ ਕਾਰਜ ਯੋਜਨਾ ਦੀ ਸਥਿਤੀ",
    completeSuffix: "ਮੁਕੰਮਲ",
    completedStepsLabel: "ਪੂਰੇ ਹੋਏ ਕਦਮ",
    inProgressLabel: "ਜਾਰੀ",
    pendingActionsLabel: "ਬਾਕੀ ਕਦਮ",
    stepTimelineHeader: "ਤੁਹਾਡੀ ਕਦਮ-ਦਰ-ਕਦਮ ਸਮਾਂ-ਰੇਖਾ",
    savedNoticeHeader: "ਸੇਵ ਕੀਤਾ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਅਤੇ ਸੂਚੀ",
    editDraftBtn: "ਡਰਾਫਟ ਬਦਲੋ →",
    exportPdfBtn: "ਕਾਨੂੰਨੀ ਨੋਟਿਸ PDF ਡਾਊਨਲੋਡ ਕਰੋ",
    exportedPdfBtn: "PDF ਡਾਊਨਲੋਡ ਹੋ ਗਈ!",
    attachedEvidenceHeader: "ਨੱਥੀ ਸਬੂਤ",
    recordedVoiceNotesHeader: "ਰਿਕਾਰਡ ਕੀਤੇ ਵੌਇਸ ਨੋਟਸ",
    recordNewBtn: "+ ਨਵਾਂ ਰਿਕਾਰਡ",
    noVoiceNotesText: "ਹਾਲੇ ਕੋਈ ਵੌਇਸ ਨੋਟ ਰਿਕਾਰਡ ਨਹੀਂ ਹੈ। ਸਕ੍ਰੀਨ 1 'ਤੇ ਰਿਕਾਰਡ ਕਰੋ।",
    caseHistoryHeader: "ਕੇਸ ਇਤਿਹਾਸ ਲੌਗ (Audit Trail)",
    loggedEventsSuffix: "ਦਰਜ ਘਟਨਾਵਾਂ",
    logMilestonePlaceholder: "ਨੋਟ ਸ਼ਾਮਲ ਕਰੋ (ਜਿਵੇਂ ਸਪੀਡ ਪੋਸਟ ਭੇਜ ਦਿੱਤੀ)...",
    logBtn: "+ ਸ਼ਾਮਲ ਕਰੋ",
    limitationAlertTitle: "ਕਾਨੂੰਨੀ ਸਮਾਂ-ਸੀਮਾ ਚੇਤਾਵਨੀ",
    findAidHeader: "ਆਪਣੇ ਨੇੜੇ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲੱਭੋ",
    findAidSub: "ਪ੍ਰਮਾਣਿਤ NALSA, DLSA ਅਤੇ ਲੇਬਰ ਦਫ਼ਤਰ",
    searchCenterPlaceholder: "ਅਦਾਲਤ ਦਾ ਨਾਮ, ਇਲਾਕਾ ਜਾਂ ਪਿੰਨ ਕੋਡ ਖੋਜੋ...",
    bookTokenBtn: "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਟੋਕਨ ਬੁੱਕ ਕਰੋ →",
    emergencyHelplinesTitle: "24×7 ਐਮਰਜੈਂਸੀ ਸਰਕਾਰੀ ਹੈਲਪਲਾਈਨਾਂ",
    needTeleLawTitle: "ਟੈਲੀ-ਲਾਅ (Tele-Law) ਵੀਡੀਓ ਸਲਾਹ ਚਾਹੀਦੀ ਹੈ?",
    needTeleLawSub: "ਵਕੀਲ ਜਾਂ AI ਵੌਇਸ ਨਾਲ ਗੱਲ ਕਰੋ",
    startVoiceCallBtn: "ਵੌਇਸ ਕਾਲ ਸ਼ੁਰੂ ਕਰੋ",
  },
  "অসমীয়া (Assamese)": {
    ...TRANSLATIONS["বাংলা (Bengali)"],
    appTitle: "ন্যায় সহায়ক",
    appSubtitle: "নাগৰিক আইনী সাহায্য",
    navHome: "মূল পৃষ্ঠা",
    navExplainLaw: "আইন বুজক",
    navTrackCase: "গোচৰ ট্ৰেক",
    navFindAid: "আইনী সাহায্য",
    heroKicker: "আপোনাৰ ভাষাত AI আইনী নিৰ্দেশনা",
    heroTitle: "আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?",
    heroSubtitle:
      "আপোনাৰ আইনী অধিকাৰ আৰু পৰৱৰ্তী পদক্ষেপসমূহ বুজিবলৈ অসমীয়া, হিন্দী বা ইংৰাজীত কওক বা টাইপ কৰক।",
    tapToSpeakTitle: "Gemini Live Voice-ত কথা পাতিবলৈ টেপ কৰক",
    tapToSpeakSub: "অসমীয়াকে ধৰি ৩৩টা ভাৰতীয় ভাষা সমৰ্থিত",
    typeProblemPlaceholder: "বা আপোনাৰ সমস্যাটো ইয়াত টাইপ কৰক...",
  },
  "मैथिली (Maithili)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (मैथिली)",
    appSubtitle: "नागरिक विधिक सहायता",
    heroTitle: "आइ हम अहाँक कोना सहायता कऽ सकैत छी?",
    heroSubtitle: "अपन कानूनी अधिकार आ अगिला कदम बुझबाक लेल मैथिली, हिन्दी वा अंग्रेजी मे बाजू वा लिखू।",
    tapToSpeakTitle: "Gemini लाइव वॉइस मे बजबाक लेल टैप करू",
    typeProblemPlaceholder: "वा अपन समस्या एतय टाइप करू...",
  },
  "संस्कृतम् (Sanskrit)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्यायसहायकः",
    appSubtitle: "नागरिकविधिकसहायता",
    heroTitle: "अद्य अहं भवतः कथं साहाय्यं कर्तुं शक्नोमि?",
    heroSubtitle: "स्वविधिक-अधिकारान् अग्रे करणीयानि च ज्ञातुं संस्कृतेन, हिन्दीभाषया आङ्ग्लभाषया वा वदतु लिखतु वा।",
    tapToSpeakTitle: "Gemini Live Voice इत्यत्र वक्तुं नुदतु",
  },
  "کٲشُر / कश्मीरी (Kashmiri)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (कश्मीरी)",
    heroTitle: "अज़ क्याह हेकव असी तुहंज़ मदद करिथ? (आज हम आपकी कैसे मदद कर सकते हैं?)",
  },
  "नेपाली (Nepali)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (नेपाली)",
    appSubtitle: "नागरिक कानुनी सहायता",
    navHome: "गृहपृष्ठ",
    navExplainLaw: "कानुन बुझ्नुहोस्",
    navTrackCase: "केस ट्र्याक",
    navFindAid: "कानुनी सहायता",
    heroKicker: "तपाईंको भाषामा AI कानुनी मार्गदर्शन",
    heroTitle: "आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?",
    heroSubtitle: "आफ्नो कानुनी अधिकार र अर्को कदम बुझ्न नेपाली, हिन्दी वा अंग्रेजीमा बोल्नुहोस् वा टाइप गर्नुहोस्।",
    tapToSpeakTitle: "Gemini Live Voice मा बोल्न ट्याप गर्नुहोस्",
    typeProblemPlaceholder: "वा आफ्नो समस्या यहाँ टाइप गर्नुहोस्...",
  },
  "कोंकणी (Konkani)": {
    ...TRANSLATIONS["मराठी (Marathi)"],
    appTitle: "न्याय सहाय्यक (कोंकणी)",
    appSubtitle: "नागरिक कायदेशीर मदत",
    heroTitle: "आयज हांव तुमकां कशी मदत करूं येता?",
    typeProblemPlaceholder: "वा तुमची समस्या हांगा टायप करात...",
  },
  "सिन्धी / سنڌي (Sindhi)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (सिन्धी)",
    heroTitle: "अजु मां तव्हांजी किअं मदद करी सघां थो? (आज मैं आपकी कैसे मदद कर सकता हूँ?)",
  },
  "डोगरी (Dogri)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (डोगरी)",
    heroTitle: "अज्ज में तुंदी कि’यां मदद करी सकना आं?",
  },
  "মৈতৈলোন্ (Manipuri (Meitei))": {
    ...TRANSLATIONS["বাংলা (Bengali)"],
    appTitle: "ন্যায় সহায়ক (মৈতৈলোন্)",
    appSubtitle: "Citizen Legal Aid · Manipuri (Meitei)",
    heroTitle: "ঙসি ঐনা অদোমদা করম্না মতেং পাংবা য়াবগে?",
  },
  "बर' (Bodo)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (बर')",
    heroTitle: "दिनै आं नोंथांखौ माबोरै मदद खालामनो हागौ?",
  },
  "ᱥᱟᱱᱛᱟᱲᱤ (Santali)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "ᱱᱭᱟᱭ ᱥᱚᱦᱟᱭᱚᱠ (Santali)",
    appSubtitle: "Citizen Legal Aid · Santali",
    heroTitle: "ᱛᱮᱦᱮᱧ ᱤᱧ ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟᱧ ᱜᱚᱲᱚ ᱫᱟᱲᱮᱭᱟᱢᱟ?",
  },
  "भोजपुरी (Bhojpuri)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (भोजपुरी)",
    heroTitle: "आज हम रउआ के कइसे मदद कर सकीं ला?",
    heroSubtitle: "आपन कानूनी अधिकार आ अगला कदम जाने खातिर भोजपुरी, हिंदी भा अंग्रेजी में बोलीं भा लिखीं।",
    typeProblemPlaceholder: "भा आपन समस्या इहाँ लिखीं...",
  },
  "राजस्थानी (Rajasthani)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (राजस्थानी)",
    heroTitle: "आज म्हे आपरी काईं मदद कर सकां हां?",
    typeProblemPlaceholder: "या आपरी समस्या अठे लिखो...",
  },
  "हरियाणवी (Haryanvi)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (हरियाणवी)",
    heroTitle: "आज मैं थारी के मदद कर सकूँ सूं?",
    typeProblemPlaceholder: "या आपणी दिक्कत उरे लिखो...",
  },
  "छत्तीसगढ़ी (Chhattisgarhi)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (छत्तीसगढ़ी)",
    heroTitle: "आज मैं तुंहर का मदद कर सकत हंव?",
    typeProblemPlaceholder: "या अपन समस्या इहाँ लिखव...",
  },
  "ತುಳು (Tulu)": {
    ...TRANSLATIONS["ಕನ್ನಡ (Kannada)"],
    appTitle: "ನ್ಯಾಯ ಸಹಾಯಕ (ತುಳು)",
    appSubtitle: "ನಾಗರಿಕ ಕಾನೂನು ನೆರವು · Tulu",
    heroTitle: "ಇನಿ ಯಾನ್ ಇರೆಗ್ ಎಂಚ ಸಹಾಯ ಮಲ್ಪೊಲಿ?",
  },
  "गढ़वाली (Garhwali)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (गढ़वाली)",
    heroTitle: "आज मि तुमारी क्या मदद कर सकदु छौं?",
  },
  "कुमाऊँनी (Kumaoni)": {
    ...TRANSLATIONS["हिन्दी (Hindi)"],
    appTitle: "न्याय सहायक (कुमाऊँनी)",
    heroTitle: "आज म्यर द्वारा तुमर के मदद है सकै छ?",
  },
  "Mizo ṭawng (Mizo)": {
    ...TRANSLATIONS.English,
    appTitle: "NYAYA SAHAYAK (Mizo)",
    appSubtitle: "Dan Lam Ṭanpuina · Citizen Legal Aid",
    navHome: "In",
    navExplainLaw: "Dan Hrilhfiahna",
    navTrackCase: "Thubuai Enna",
    navFindAid: "Ṭanpuina Zawng",
    heroKicker: "I Ṭawngin AI Dan Lam Kaihhruaina",
    heroTitle: "Vawiinah engtin nge ka ṭanpui theih ang che?",
    heroSubtitle: "I dan dikna leh hmalak dan tur hriat nan Mizo ṭawngin sawi rawh le.",
    tapToSpeakTitle: "Gemini Live Voice-a biak nan hmet rawh",
    typeProblemPlaceholder: "Nge i harsatna hetah hian ziak rawh...",
  },
  "Ka Ktien Khasi (Khasi)": {
    ...TRANSLATIONS.English,
    appTitle: "NYAYA SAHAYAK (Khasi)",
    appSubtitle: "Jingiarap Aiñ · Citizen Legal Aid",
    navHome: "alade",
    navExplainLaw: "Pynshai Aiñ",
    navTrackCase: "Budien Case",
    navFindAid: "Wad Jingiarap",
    heroKicker: "Ka Jingialam Aiñ AI ha ka Ktien Jong Phi",
    heroTitle: "Kumno nga lah ban iarap ia phi mynta ka sngi?",
    heroSubtitle: "Kren ne thoh ha ka ktien Khasi ban tip ia ki hok aiñ jong phi.",
    tapToSpeakTitle: "Ñion hangne ban kren ha Gemini Live Voice",
    typeProblemPlaceholder: "Ne thoh ia ka jingeh jong phi hangne...",
  },
  "A·chik (Garo)": {
    ...TRANSLATIONS.English,
    appTitle: "NYAYA SAHAYAK (Garo)",
    appSubtitle: "Niam Dakchakani · Citizen Legal Aid",
    navHome: " Nok",
    navExplainLaw: "Niam Talatani",
    navTrackCase: "Case Sandiani",
    navFindAid: "Dakchakani",
    heroKicker: "Na·simangni Ku·sikchi AI Niam Dakchakani",
    heroTitle: "Da·alo anga na·اك maikai dakchakna man·gen?",
    heroSubtitle: "Na·simangni niam bilrangko ma·sina Garo ku·sikchi aganbo.",
    tapToSpeakTitle: "Gemini Live Voice-o aganna ia biapko dipetbo",
    typeProblemPlaceholder: "Ma na·simangni neng·nikaniko ia biapo sebo...",
  },
};

export function normalizeLanguageKey(rawLang: string): string {
  if (!rawLang) return "English";
  const clean = rawLang.trim();

  // 1. Exact match in TRANSLATIONS
  if (clean in TRANSLATIONS) return clean;

  // 2. Case-insensitive exact match in ALL_SUPPORTED_LANGUAGES
  const directMatch = ALL_SUPPORTED_LANGUAGES.find(
    (l) => l.toLowerCase() === clean.toLowerCase()
  );
  if (directMatch && directMatch in TRANSLATIONS) return directMatch;

  // 3. Match against English name inside parentheses or native script prefix
  const cleanLower = clean.toLowerCase();
  for (const item of ALL_SUPPORTED_LANGUAGES) {
    const m = item.match(/\(([^)]+)\)/);
    const engName = (m ? m[1] : item).toLowerCase();
    const nativePrefix = item.split(" ")[0].toLowerCase();
    if (
      cleanLower === engName ||
      cleanLower === nativePrefix ||
      cleanLower.includes(engName) ||
      cleanLower.includes(nativePrefix)
    ) {
      if (item in TRANSLATIONS) return item;
    }
  }

  // 4. ISO language codes & alternate spellings
  const codeMap: Record<string, string> = {
    en: "English",
    english: "English",
    hi: "हिन्दी (Hindi)",
    hindi: "हिन्दी (Hindi)",
    bn: "বাংলা (Bengali)",
    bengali: "বাংলা (Bengali)",
    bangla: "বাংলা (Bengali)",
    te: "తెలుగు (Telugu)",
    telugu: "తెలుగు (Telugu)",
    mr: "मराठी (Marathi)",
    marathi: "मराठी (Marathi)",
    ta: "தமிழ் (Tamil)",
    tamil: "தமிழ் (Tamil)",
    gu: "ગુજરાતી (Gujarati)",
    gujarati: "ગુજરાતી (Gujarati)",
    ur: "اردو (Urdu)",
    urdu: "اردو (Urdu)",
    kn: "ಕನ್ನಡ (Kannada)",
    kannada: "ಕನ್ನಡ (Kannada)",
    or: "ଓଡ଼ିଆ (Odia)",
    odia: "ଓଡ଼ିଆ (Odia)",
    oriya: "ଓଡ଼ିଆ (Odia)",
    ml: "മലയാളം (Malayalam)",
    malayalam: "മലയാളം (Malayalam)",
    pa: "ਪੰਜਾਬੀ (Punjabi)",
    punjabi: "ਪੰਜਾਬੀ (Punjabi)",
    as: "অসমীয়া (Assamese)",
    assamese: "অসমীয়া (Assamese)",
    mai: "मैथिली (Maithili)",
    maithili: "मैथिली (Maithili)",
    sa: "संस्कृतम् (Sanskrit)",
    sanskrit: "संस्कृतम् (Sanskrit)",
    ks: "کٲشُر / कश्मीरी (Kashmiri)",
    kashmiri: "کٲشُر / कश्मीरी (Kashmiri)",
    ne: "नेपाली (Nepali)",
    nepali: "नेपाली (Nepali)",
    kok: "कोंकणी (Konkani)",
    konkani: "कोंकणी (Konkani)",
    sd: "सिन्धी / سنڌي (Sindhi)",
    sindhi: "सिन्धी / سنڌي (Sindhi)",
    doi: "डोगरी (Dogri)",
    dogri: "डोगरी (Dogri)",
    mni: "মৈতৈলোন্ (Manipuri (Meitei))",
    manipuri: "মৈতৈলোন্ (Manipuri (Meitei))",
    meitei: "মৈতৈলোন্ (Manipuri (Meitei))",
    brx: "बर' (Bodo)",
    bodo: "बर' (Bodo)",
    sat: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)",
    santali: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)",
    bho: "भोजपुरी (Bhojpuri)",
    bhojpuri: "भोजपुरी (Bhojpuri)",
    raj: "राजस्थानी (Rajasthani)",
    rajasthani: "राजस्थानी (Rajasthani)",
    bgc: "हरियाणवी (Haryanvi)",
    haryanvi: "हरियाणवी (Haryanvi)",
    hne: "छत्तीसगढ़ी (Chhattisgarhi)",
    chhattisgarhi: "छत्तीसगढ़ी (Chhattisgarhi)",
    tcy: "ತುಳು (Tulu)",
    tulu: "ತುಳು (Tulu)",
    gbm: "गढ़वाली (Garhwali)",
    garhwali: "गढ़वाली (Garhwali)",
    kfy: "कुमाऊँनी (Kumaoni)",
    kumaoni: "कुमाऊँनी (Kumaoni)",
    lus: "Mizo ṭawng (Mizo)",
    mizo: "Mizo ṭawng (Mizo)",
    kha: "Ka Ktien Khasi (Khasi)",
    khasi: "Ka Ktien Khasi (Khasi)",
    grt: "A·chik (Garo)",
    garo: "A·chik (Garo)",
  };

  if (codeMap[cleanLower] && codeMap[cleanLower] in TRANSLATIONS) {
    return codeMap[cleanLower];
  }

  return "English";
}

export function getTranslationsForLanguage(rawLang: string): UITranslations {
  const normalized = normalizeLanguageKey(rawLang);
  const selected = TRANSLATIONS[normalized] || TRANSLATIONS.English;
  return {
    ...TRANSLATIONS.English,
    ...selected,
  };
}

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: UITranslations;
}

export const I18nContext = createContext<I18nContextValue>({
  language: "English",
  setLanguage: () => {},
  t: TRANSLATIONS.English,
});

export const I18nProvider: React.FC<{
  language: string;
  setLanguage: (lang: string) => void;
  children: React.ReactNode;
}> = ({ language, setLanguage, children }) => {
  const t = getTranslationsForLanguage(language);

  return React.createElement(
    I18nContext.Provider,
    {
      value: {
        language,
        setLanguage: (l) => setLanguage(l),
        t,
      },
    },
    children
  );
};

export const useI18n = () => useContext(I18nContext);
