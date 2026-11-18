import storyWageImg from "../assets/images/story_wage_recovery_1791123128182.jpg";
import storyTenantImg from "../assets/images/story_tenant_rights_1791123141267.jpg";
import lawyerAvatarImg from "../assets/images/lawyer_avatar_priya_1791123154526.jpg";

export const ASSETS = {
  storyWageImg,
  storyTenantImg,
  lawyerAvatarImg,
};

export interface LegalRightItem {
  actName: string;
  title: string;
  explanation: string;
  iconType: string;
}

export interface ClarifyingQuestion {
  id: string;
  badge: string;
  question: string;
  whyItMatters: string;
  options: string[];
}

export interface NextStepItem {
  stepNumber: number;
  tag: string;
  title: string;
  description: string;
  actionText: string;
}

export interface LegalAssessment {
  protectionLevel: string;
  caseCategory: string;
  summaryTitle: string;
  rights: LegalRightItem[];
  clarifyingQuestions: ClarifyingQuestion[];
  nextSteps: NextStepItem[];
  limitationWarning: string;
  groundingSources?: Array<{ title: string; uri: string }>;
}

export const INITIAL_SITUATION = "";

export const INITIAL_ASSESSMENT: LegalAssessment = {
  protectionLevel: "CITIZEN LEGAL AID READY",
  caseCategory: "General Citizen Legal Guidance",
  summaryTitle:
    "How may I help you today? Describe your situation in your preferred language on Screen 1 or via Live Voice to receive a tailored legal assessment.",
  rights: [
    {
      actName: "Legal Services Authorities Act, 1987 · Section 12",
      title: "Right to Free Legal Aid & Representation",
      explanation:
        "Eligible citizens—including women, children, SC/ST members, industrial workers, senior citizens, PwD, and low-income citizens—are entitled to 100% free legal representation through NALSA and DLSA.",
      iconType: "scale",
    },
    {
      actName: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 · Section 173",
      title: "Right to Zero FIR & e-FIR Registration",
      explanation:
        "Every citizen has the statutory right to register an FIR at any police station (Zero FIR) regardless of jurisdiction, or file an electronic complaint online and receive a free copy.",
      iconType: "shield",
    },
    {
      actName: "Consumer Protection Act, 2019 & Labour Codes",
      title: "Fast-Track Citizen Grievance Redressal",
      explanation:
        "Indian law provides dedicated digital portals (such as e-Daakhil, Cybercrime 1930, and Ministry portals) to resolve consumer, tenancy, family, and workplace disputes without complex litigation.",
      iconType: "file",
    },
  ],
  clarifyingQuestions: [
    {
      id: "q1",
      badge: "ISSUE CATEGORY",
      question:
        "What type of legal issue would you like assistance with today?",
      whyItMatters:
        "Identifying your dispute area helps match the exact Central & State Acts and the right statutory authority.",
      options: [
        "Property, Rent or Tenancy",
        "Workplace or Salary Issue",
        "Family, Domestic or Consumer",
        "Police FIR or Cyber Fraud",
      ],
    },
    {
      id: "q2",
      badge: "DOCUMENTATION",
      question:
        "Do you have any written documents, receipts, messages, or ID proofs related to your issue?",
      whyItMatters:
        "Written records, bank trails, or chat screenshots strengthen your formal representation or legal notice.",
      options: [
        "Yes, I have documents & messages",
        "Only verbal communication so far",
        "Need guidance on what to collect",
      ],
    },
  ],
  nextSteps: [
    {
      stepNumber: 1,
      tag: "STEP 1 · DESCRIBE & DOCUMENT",
      title: "Describe Your Issue & Prepare a Written Notice",
      description:
        "Share your situation in simple words and generate a structured formal representation or legal notice citing relevant Indian statutes.",
      actionText: "Prepare Legal Notice",
    },
    {
      stepNumber: 2,
      tag: "STEP 2 · OFFICIAL PORTAL / AUTHORITY",
      title: "Track Your Action Plan & Statutory Filings",
      description:
        "Follow a step-by-step milestone checklist to submit your grievance to the appropriate department or conciliation desk.",
      actionText: "Open Action Plan Tracker",
    },
    {
      stepNumber: 3,
      tag: "STEP 3 · FREE LEGAL AID · NALSA",
      title: "Consult a Free DLSA / Tele-Law Advocate (15100)",
      description:
        "Connect with a verified District Legal Services Authority (DLSA) or Nyaya Bandhu pro bono advocate near you.",
      actionText: "Find Nearby Legal Aid",
    },
  ],
  limitationWarning:
    "Tip: Describe your specific issue on Screen 1 or tap 'Live Voice' so Nyaya Sahayak can calculate exact statutory time limits and sections for your case.",
};

export const COMMON_SITUATIONS = [
  {
    id: "s1",
    label: "Employer not paying salary for 3 months",
    category: "Labour & Wages",
    prompt:
      "My employer has not paid my salary for the last 3 months (₹45,000/month) and is threatening to terminate me without relieving letter if I ask again.",
  },
  {
    id: "s2",
    label: "Landlord refusing to return security deposit",
    category: "Property & Tenancy",
    prompt:
      "I vacated my rented flat 2 months ago in good condition, but my landlord is refusing to return my ₹80,000 security deposit and not answering calls.",
  },
  {
    id: "s3",
    label: "Domestic violence & protection order rights",
    category: "Family & Protection",
    prompt:
      "I am facing physical and financial abuse from my spouse and in-laws and they are threatening to throw me out of our shared house.",
  },
  {
    id: "s4",
    label: "Police station refusing to register my FIR",
    category: "Criminal & Citizen Rights",
    prompt:
      "I went to the local police station to report a serious theft and assault, but the duty officer refused to register an FIR and asked me to come later.",
  },
];

export interface EvidenceItem {
  id: string;
  title: string;
  subtitle: string;
  selectedByDefault?: boolean;
}

export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "ev1",
    title: "Bank Account Statements",
    subtitle: "Last 6 months showing past salary credits",
    selectedByDefault: true,
  },
  {
    id: "ev2",
    title: "Appointment / Offer Letter",
    subtitle: "Contract, joining letter, or employee ID card",
    selectedByDefault: true,
  },
  {
    id: "ev3",
    title: "WhatsApp & Email Trail",
    subtitle: "Messages promising payment or work proof",
    selectedByDefault: true,
  },
  {
    id: "ev4",
    title: "Salary Slips / Form 16",
    subtitle: "Previous pay stubs or PF deduction records",
    selectedByDefault: false,
  },
  {
    id: "ev5",
    title: "Attendance / Shift Logs",
    subtitle: "Biometric screenshots, emails, or daily reports",
    selectedByDefault: false,
  },
  {
    id: "ev6",
    title: "Colleague Witness Details",
    subtitle: "Co-workers also facing unpaid salary",
    selectedByDefault: false,
  },
];

export const ELIGIBILITY_CATEGORIES = [
  {
    id: "el1",
    label: "Woman or Child",
    sub: "100% Free Aid (No income cap)",
  },
  {
    id: "el2",
    label: "Industrial Workman",
    sub: "Labour & Wage Disputes",
  },
  {
    id: "el3",
    label: "Income Below ₹3L/yr",
    sub: "General Citizen Category",
  },
  {
    id: "el4",
    label: "SC / ST Community",
    sub: "Constitutional Legal Aid",
  },
  {
    id: "el5",
    label: "Senior Citizen / PwD",
    sub: "Priority Legal Clinic",
  },
  {
    id: "el6",
    label: "Victim of Disaster/Abuse",
    sub: "Immediate Protection",
  },
];

export const LAW_LIBRARY_TOPICS = [
  {
    id: "law1",
    category: "Labour & Work",
    title: "Unpaid Salary & Full-and-Final Recovery",
    section: "Payment of Wages Act · Sec 15 & Code on Wages",
    summary:
      "Employers must release wages within 7–10 days. Employees can file online on SAMADHAN and claim up to 10x compensation.",
    readTime: "3 min guide",
  },
  {
    id: "law2",
    category: "Property & Rent",
    title: "Security Deposit & Illegal Eviction Rules",
    section: "Model Tenancy Act & State Rent Control Acts",
    summary:
      "Landlords cannot cut water/electricity or lock out tenants without a Rent Authority eviction order. Unlawful deduction from deposit carries interest.",
    readTime: "4 min guide",
  },
  {
    id: "law3",
    category: "Family & Women",
    title: "Domestic Violence & Right to Residence",
    section: "PWDVA, 2005 · Sec 12, 17, 18 & 20",
    summary:
      "Every woman has the legal right to reside in the shared household regardless of ownership, plus immediate Protection and Maintenance Orders.",
    readTime: "4 min guide",
  },
  {
    id: "law4",
    category: "Criminal & FIR",
    title: "When Police Refuse to Register an FIR",
    section: "BNSS 2023 · Sec 173 (Formerly CrPC Sec 154)",
    summary:
      "Citizens have the right to Zero FIR at any police station, e-FIR for eligible offences, or sending complaint via Registered Post to the SP.",
    readTime: "3 min guide",
  },
  {
    id: "law5",
    category: "Consumer & Cyber",
    title: "UPI Fraud, Unauthorized Debit & Refunds",
    section: "RBI Zero Liability Circular & IT Act Sec 66D",
    summary:
      "Report cyber financial fraud on 1930 or cybercrime.gov.in within the golden hour to freeze fraudulent beneficiary accounts.",
    readTime: "3 min guide",
  },
  {
    id: "law6",
    category: "Labour & Work",
    title: "Maternity Leave & POSH Workplace Safety",
    section: "Maternity Benefit Act, 1961 & POSH Act, 2013",
    summary:
      "Guarantees 26 weeks paid maternity leave and prohibits dismissal during pregnancy. Mandatory Internal Complaints Committee (ICC).",
    readTime: "5 min guide",
  },
];

export interface StatutoryActSection {
  id: string;
  sectionCode: string;
  actName: string;
  title: string;
  category: string;
  keywords: string[];
  quickSummary: string;
}

export const STATUTORY_ACT_SECTIONS: StatutoryActSection[] = [
  {
    id: "sec-pwa-5",
    sectionCode: "Section 5 · Payment of Wages Act, 1936",
    actName: "Payment of Wages Act, 1936",
    title: "Mandatory Time of Payment of Wages (Within 7–10 Days)",
    category: "Labour & Work",
    keywords: ["salary", "wages", "delayed", "unpaid", "month", "employer", "sec 5"],
    quickSummary: "Mandates payment of earned wages within 7 to 10 days after the wage period ends.",
  },
  {
    id: "sec-pwa-15",
    sectionCode: "Section 15(3) · Payment of Wages Act, 1936",
    actName: "Payment of Wages Act, 1936",
    title: "Claims for Unpaid Wages & Up to 10x Compensation",
    category: "Labour & Work",
    keywords: ["compensation", "10x", "recovery", "authority", "unpaid salary", "sec 15"],
    quickSummary: "Authorizes Labour Commissioner/Authority to order payment of delayed wages plus up to 10 times compensation.",
  },
  {
    id: "sec-ida-25f",
    sectionCode: "Section 25F · Industrial Disputes Act, 1947",
    actName: "Industrial Disputes Act, 1947",
    title: "Conditions Precedent to Retrenchment & Wrongful Dismissal",
    category: "Labour & Work",
    keywords: ["fired", "termination", "notice pay", "retrenchment", "relieving letter", "25f"],
    quickSummary: "Requires 1 month notice or pay in lieu and retrenchment compensation before terminating a workman.",
  },
  {
    id: "sec-mta-11",
    sectionCode: "Section 11 · Model Tenancy Act, 2021 & Rent Control",
    actName: "Model Tenancy Act & State Rent Control Acts",
    title: "Refund of Security Deposit & Prohibition on Utility Disconnection",
    category: "Property & Rent",
    keywords: ["deposit", "landlord", "rent", "eviction", "electricity", "water", "tenant"],
    quickSummary: "Requires landlord to refund security deposit upon vacating and bars cutting essential water/power supplies.",
  },
  {
    id: "sec-pwdva-12",
    sectionCode: "Sections 12, 17 & 18 · PWDVA, 2005",
    actName: "Protection of Women from Domestic Violence Act, 2005",
    title: "Right to Reside in Shared Household & Protection Orders",
    category: "Family & Women",
    keywords: ["domestic violence", "residence", "protection order", "maintenance", "abuse", "pwdva"],
    quickSummary: "Guarantees right to reside in the shared household and immediate Magistrate protection/maintenance orders.",
  },
  {
    id: "sec-bnss-173",
    sectionCode: "Section 173 · BNSS, 2023 (Formerly CrPC Sec 154)",
    actName: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023",
    title: "Mandatory Registration of Cognizable FIR, Zero FIR & e-FIR",
    category: "Criminal & FIR",
    keywords: ["fir", "police", "zero fir", "efir", "bnss", "173", "154", "complaint", "sp"],
    quickSummary: "Mandates police to register FIR irrespective of jurisdiction (Zero FIR) and provides remedy via SP/Magistrate if refused.",
  },
  {
    id: "sec-it-66d",
    sectionCode: "Section 66D · IT Act & RBI Zero Liability Circular",
    actName: "Information Technology Act, 2000 & RBI Guidelines",
    title: "Online UPI Fraud, Cyber Cheating & Bank Refund Liability",
    category: "Consumer & Cyber",
    keywords: ["upi", "cyber", "scam", "fraud", "1930", "bank", "unauthorized", "66d"],
    quickSummary: "Protects consumers reporting unauthorized electronic transactions within 3 days and punishes cyber impersonation fraud.",
  },
  {
    id: "sec-cpa-35",
    sectionCode: "Section 35 · Consumer Protection Act, 2019",
    actName: "Consumer Protection Act, 2019",
    title: "Filing Consumer Complaint on e-Daakhil for Defective Goods/Services",
    category: "Consumer & Cyber",
    keywords: ["consumer", "refund", "defective", "edaakhil", "deficiency", "ecommerce"],
    quickSummary: "Allows consumers to file complaints online from home for defective products, unfair trade practices, or service deficiency.",
  },
  {
    id: "sec-mba-5",
    sectionCode: "Sections 5 & 12 · Maternity Benefit Act & POSH Act",
    actName: "Maternity Benefit Act, 1961 & POSH Act, 2013",
    title: "26 Weeks Paid Maternity Leave & Protection Against Dismissal",
    category: "Labour & Work",
    keywords: ["maternity", "pregnancy", "posh", "harassment", "icc", "leave"],
    quickSummary: "Entitles women employees to 26 weeks paid maternity benefit and makes discharge or dismissal during maternity unlawful.",
  },
  {
    id: "sec-lalsa-12",
    sectionCode: "Section 12 · Legal Services Authorities Act, 1987",
    actName: "Legal Services Authorities Act, 1987 (NALSA)",
    title: "Entitlement to Free Legal Aid & Court Representation",
    category: "All Topics",
    keywords: ["nalsa", "dlsa", "free lawyer", "legal aid", "15100", "section 12"],
    quickSummary: "Grants free legal services to women, children, SC/ST members, industrial workmen, PwD, and low-income citizens.",
  },
];

export const CITIZEN_FAQS = [
  {
    q: "Can my company hold my relieving letter if I demand unpaid salary?",
    a: "No. Indian courts and Labour Commissioners treat withholding experience or relieving letters as coercive unfair practice. You can include a demand for your relieving certificate in the same SAMADHAN complaint.",
  },
  {
    q: "Do I have to pay court fees to approach the Labour Commissioner or DLSA?",
    a: "Filing a conciliation complaint on the SAMADHAN portal is completely free. If your case goes to Labour Court, DLSA provides a free legal aid advocate under Section 12 of the Legal Services Authorities Act.",
  },
  {
    q: "What if I worked without a written appointment letter?",
    a: "Bank statements showing monthly salary transfers, UPI records, WhatsApp instructions from your manager, or colleague testimony are legally accepted to prove employment.",
  },
];

export interface MilestoneItem {
  id: string;
  step: number;
  status: "COMPLETED" | "IN PROGRESS" | "PENDING" | "UPCOMING";
  title: string;
  dateLabel: string;
  description: string;
  ctaLabel?: string;
  targetScreen?: number;
}

export const INITIAL_MILESTONES: MilestoneItem[] = [
  {
    id: "m1",
    step: 1,
    status: "IN PROGRESS",
    title: "1. Describe Your Legal Situation & Verify Rights",
    dateLabel: "Step 1 · AI Statutory Assessment",
    description:
      "Share your issue via text or Live Voice in any of 33 Indian languages to identify applicable Central & State Acts.",
    ctaLabel: "Describe Your Situation →",
    targetScreen: 1,
  },
  {
    id: "m2",
    step: 2,
    status: "PENDING",
    title: "2. Gather & Review Supporting Documents",
    dateLabel: "Step 2 · Evidence Checklist & AI Review",
    description:
      "Select and scan relevant agreements, receipts, ID proofs, or message trails to build a verifiable case file.",
    ctaLabel: "Review Evidence & Draft Notice →",
    targetScreen: 3,
  },
  {
    id: "m3",
    step: 3,
    status: "PENDING",
    title: "3. Draft & Dispatch Formal Written Notice / Representation",
    dateLabel: "Step 3 · 15-Day Statutory Notice Period",
    description:
      "Generate a customized formal legal notice or police/authority complaint draft and send via email or Registered Post A.D.",
    ctaLabel: "Open Notice Generator →",
    targetScreen: 3,
  },
  {
    id: "m4",
    step: 4,
    status: "UPCOMING",
    title: "4. File Grievance on Official Citizen Portal",
    dateLabel: "Step 4 · Statutory Authority / Portal Filing",
    description:
      "Submit your application on the relevant official portal (e-Daakhil, Cybercrime 1930, SAMADHAN, or State Grievance Portal).",
  },
  {
    id: "m5",
    step: 5,
    status: "UPCOMING",
    title: "5. Connect with Free DLSA Legal Aid Advocate",
    dateLabel: "NALSA Representation · Zero Legal Fees",
    description:
      "Book a free consultation with the District Legal Services Authority (DLSA) or Tele-Law advocate for formal representation.",
    ctaLabel: "Find Nearby DLSA Center →",
    targetScreen: 6,
  },
];

export interface LegalAidCenter {
  id: string;
  name: string;
  type: "DLSA Offices" | "Legal Aid Clinics" | "Pro Bono Lawyers";
  badge: string;
  distance: string;
  statusText: string;
  address: string;
  phone: string;
  services: string[];
  eligibilityNote: string;
  mapX: number; // percentage on interactive SVG map
  mapY: number;
  acceptingProBono: boolean;
  proBonoCategories: string[];
  proBonoSlotsAvailable: number;
  assignedAdvocate?: string;
}

export const LEGAL_AID_CENTERS: LegalAidCenter[] = [
  {
    id: "c1",
    name: "District Legal Services Authority (DLSA) — Central Courts",
    type: "DLSA Offices",
    badge: "VERIFIED GOVT · NALSA",
    distance: "1.8 km away",
    statusText: "Open Now · Closes 5:00 PM",
    address: "Room No. 12, Ground Floor, Patiala House Court Complex, New Delhi",
    phone: "15100",
    services: [
      "Free Legal Aid Lawyer",
      "Notice Drafting",
      "Lok Adalat Settlement",
      "Mediation Center",
    ],
    eligibilityNote:
      "Free for Women, Children, Industrial Workers, SC/ST & Income < ₹3L/yr",
    mapX: 46,
    mapY: 42,
    acceptingProBono: true,
    proBonoCategories: [
      "Unpaid Salary & Wage Dispute",
      "Labour & Work",
      "Tenant & Housing",
      "Women & Family",
      "Consumer & Cyber",
    ],
    proBonoSlotsAvailable: 4,
    assignedAdvocate: "Adv. R. K. Sharma (NALSA Panel Counsel)",
  },
  {
    id: "c2",
    name: "Office of the Deputy Labour Commissioner (Conciliation)",
    type: "Legal Aid Clinics",
    badge: "LABOUR DEPT",
    distance: "2.6 km away",
    statusText: "Open Now · Walk-in Helpdesk",
    address: "Employment Exchange Building, Pusa Road, Institutional Area",
    phone: "011-25843120",
    services: [
      "Unpaid Salary Conciliation",
      "SAMADHAN Portal Helpdesk",
      "Gratuity & PF Claims",
    ],
    eligibilityNote:
      "Open to all salaried employees, contract staff & industrial workmen",
    mapX: 68,
    mapY: 58,
    acceptingProBono: false,
    proBonoCategories: ["Labour & Work"],
    proBonoSlotsAvailable: 0,
    assignedAdvocate: "Conciliation Officer Desk (Waitlist Only)",
  },
  {
    id: "c3",
    name: "Nyaya Bandhu Pro Bono Legal Aid Clinic & Tele-Law Center",
    type: "Pro Bono Lawyers",
    badge: "DEPT OF JUSTICE",
    distance: "3.4 km away",
    statusText: "Video & In-Person Slots Available",
    address: "Common Service Centre (CSC) Legal Wing, Block B, Connaught Place",
    phone: "14454",
    services: [
      "Pro Bono High Court Advocates",
      "Hindi & Regional Language Aid",
      "Document Verification",
    ],
    eligibilityNote: "Free Tele-Law video consultation for registered citizens",
    mapX: 28,
    mapY: 64,
    acceptingProBono: true,
    proBonoCategories: [
      "Unpaid Salary & Wage Dispute",
      "Labour & Work",
      "Consumer & Cyber",
      "Tenant & Housing",
    ],
    proBonoSlotsAvailable: 6,
    assignedAdvocate: "Adv. Priya Nair & Panel (Nyaya Bandhu Pro Bono)",
  },
  {
    id: "c4",
    name: "Adv. Meenakshi Iyer — Labour & Employment Pro Bono Chamber",
    type: "Pro Bono Lawyers",
    badge: "NYAYA BANDHU ADVOCATE",
    distance: "4.1 km away",
    statusText: "Accepting New Cases Today",
    address: "Chamber 204, Lawyers Block, Tis Hazari Courts, Delhi",
    phone: "011-23914480",
    services: [
      "Section 15 Wage Recovery Petitions",
      "Wrongful Termination Defense",
      "Free Legal Demand Notices",
    ],
    eligibilityNote:
      "Verified Pro Bono Panel Advocate · 100% Free for Unpaid Wage Claims",
    mapX: 76,
    mapY: 32,
    acceptingProBono: true,
    proBonoCategories: [
      "Unpaid Salary & Wage Dispute",
      "Labour & Work",
      "Women & Family",
    ],
    proBonoSlotsAvailable: 3,
    assignedAdvocate: "Adv. Meenakshi Iyer (12 Yrs Labour Court Exp.)",
  },
];

import {
  getCompleteLocalizedLegalData,
  getAllPresetSituationPrompts,
  getPresetIndex,
} from "./localizedLegalContent";

export { getAllPresetSituationPrompts, getPresetIndex };

export function getLocalizedLegalData(language: string) {
  return getCompleteLocalizedLegalData(language);
}

