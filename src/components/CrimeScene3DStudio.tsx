import { apiFetch } from "../api";
import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  Camera,
  Layers,
  Sun,
  Moon,
  Ruler,
  Eye,
  RotateCcw,
  Sparkles,
  Download,
  X,
  Volume2,
  Mic,
  Send,
  AlertTriangle,
  ShieldAlert,
  FileText,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Check,
  Compass,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

export interface EvidenceMarkerData {
  id: string;
  markerNumber: number;
  title: string;
  description: string;
  legalRelevance: string;
  position: [number, number, number];
  evidenceCategory: "Physical" | "Biological" | "Trace" | "Digital" | "Weapons";
}

export interface CrimeSceneElementData {
  id: string;
  type:
    | "patrol_car"
    | "damaged_sedan"
    | "pedestrian_barrier"
    | "caution_tape"
    | "street_lamp"
    | "building_facade"
    | "atm_kiosk"
    | "dumpster"
    | "broken_glass"
    | "skid_marks"
    | "flashlight"
    | "warehouse_crates";
  label: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  detail?: string;
}

export interface CrimeSceneData {
  sceneId: string;
  caseTitle: string;
  sceneType:
    | "traffic_collision"
    | "burglary_breakin"
    | "alley_assault"
    | "warehouse_theft"
    | "cyber_financial_atm"
    | "general_incident";
  environment: {
    timeOfDay: "night" | "day" | "dusk";
    weather: "clear" | "rainy" | "foggy";
    locationName: string;
    groundType: "asphalt_street" | "warehouse_concrete" | "apartment_interior" | "alleyway";
  };
  elements: CrimeSceneElementData[];
  evidenceMarkers: EvidenceMarkerData[];
  forensicAnalysis: {
    summary: string;
    statutorySections: string[];
    recommendedInvestigationSteps: string[];
  };
}

// ============================================================================
// DEFAULT PROCEDURAL SCENE GENERATOR (ZERO-DEPENDENCY FALLBACK & INSTANT LOAD)
// ============================================================================
export function generateDefaultCrimeScene(
  description: string,
  language: string = "English"
): CrimeSceneData {
  const lower = description.toLowerCase();
  const isTraffic = /accident|car|vehicle|crash|collision|hit|road|speed|bike|truck|गाड़ी|दुर्घटना|விபத்து|ప్రమాదం/i.test(
    lower
  );
  const isBurglary = /burglary|break|theft|stole|door|window|cash|house|shop|ચોરી|चोरी|திருட்டு|దొంగతనం/i.test(
    lower
  );
  const isATM = /atm|bank|upi|fraud|money|cyber|debit|card/i.test(lower);

  if (isTraffic) {
    return {
      sceneId: `scene-${Date.now()}`,
      caseTitle: "Vehicular Collision & Hit-and-Run Investigation Scene",
      sceneType: "traffic_collision",
      environment: {
        timeOfDay: "night",
        weather: "clear",
        locationName: "Major Urban Intersection (Near Patiala House Courts)",
        groundType: "asphalt_street",
      },
      elements: [
        {
          id: "police-1",
          type: "patrol_car",
          label: "First Responder Police Patrol Unit",
          position: [-6, 0, 5],
          rotation: [0, 0.4, 0],
          color: "#1E3A8A",
          detail: "Patrol unit preserving incident perimeter with emergency beacon active",
        },
        {
          id: "sedan-1",
          type: "damaged_sedan",
          label: "Primary Impact Vehicle (Silver Sedan)",
          position: [1, 0, 0],
          rotation: [0, -0.6, 0],
          color: "#64748B",
          detail: "Front-end crumpled with displaced bumper and shattered left headlamp",
        },
        {
          id: "tape-1",
          type: "caution_tape",
          label: "Perimeter Forensic Caution Tape",
          position: [0, 0, -8],
          rotation: [0, 0, 0],
        },
        {
          id: "lamp-1",
          type: "street_lamp",
          label: "Overhead Sodium Vapor Street Light",
          position: [-8, 0, -4],
        },
        {
          id: "skid-1",
          type: "skid_marks",
          label: "High-Friction Deceleration Tire Marks",
          position: [1, 0.02, 4],
          rotation: [0, 0.2, 0],
          scale: [1, 1, 1],
        },
        {
          id: "glass-1",
          type: "broken_glass",
          label: "Tempered Windshield & Headlight Shards",
          position: [2.5, 0.03, -0.8],
        },
      ],
      evidenceMarkers: [
        {
          id: "evm-1",
          markerNumber: 1,
          title: "Point of Primary Vehicle Impact",
          description: "Crushed front bumper contact surface with paint transfer traces from opposite vehicle.",
          legalRelevance: "Bharatiya Nyaya Sanhita (BNS) 2023 · Sec 281 & 106 (Rash Driving / Causing Hurt)",
          position: [1.2, 0, -0.2],
          evidenceCategory: "Physical",
        },
        {
          id: "evm-2",
          markerNumber: 2,
          title: "18-Meter Skid & ABS Brake Impression",
          description: "Blackened rubber tire friction grooves indicating abrupt hard braking attempt prior to point of impact.",
          legalRelevance: "Motor Vehicles Act, 1988 · Sec 184 & Bharatiya Sakshya Adhiniyam (BSA) 2023 Forensic Trail",
          position: [1, 0, 3.2],
          evidenceCategory: "Trace",
        },
        {
          id: "evm-3",
          markerNumber: 3,
          title: "Shattered Safety Glass Dispersion Field",
          description: "Scattered windshield glass cluster extending over 3.4 meters indicating collision impact velocity.",
          legalRelevance: "BSA 2023 Section 6 (Relevancy of Facts Forming Part of Same Transaction / Res Gestae)",
          position: [2.8, 0, -0.7],
          evidenceCategory: "Physical",
        },
        {
          id: "evm-4",
          markerNumber: 4,
          title: "Dropped Mobile Phone with Cracked Screen",
          description: "Smartphone recovered 2 meters from passenger door; incoming call timestamps corroborating timeline.",
          legalRelevance: "Information Technology Act Sec 65B & Digital Forensic Certificate under BSA 2023",
          position: [-0.8, 0, -2.1],
          evidenceCategory: "Digital",
        },
      ],
      forensicAnalysis: {
        summary:
          "Forensic reconstruction indicates a front-quarter collision with evidence of delayed evasive braking. Impact velocity estimated at 42-48 km/h based on glass dispersal diameter and 18m skid trail.",
        statutorySections: [
          "BNS, 2023 · Section 281 (Rash Driving on Public Way)",
          "BNS, 2023 · Section 106 (Causing Death / Severe Grievance by Negligence)",
          "Motor Vehicles Act, 1988 · Section 134 (Duty of Driver in Case of Accident)",
          "Bharatiya Sakshya Adhiniyam (BSA), 2023 · Section 63 (Electronic & Forensic Evidence)",
        ],
        recommendedInvestigationSteps: [
          "Secure municipal CCTV footage from the 4 intersection surveillance cameras within 24 hours.",
          "Preserve paint transfer scrapings from bumper for chemical mass-spectrometry comparison.",
          "Obtain certified Call Detail Records (CDR) and cell-tower pings for the recovered digital device.",
          "Serve Section 133 Motor Vehicles Act statutory notice on registered vehicle owner.",
        ],
      },
    };
  }

  if (isATM) {
    return {
      sceneId: `scene-${Date.now()}`,
      caseTitle: "Commercial ATM Kiosk Fraud & Unauthorized Tampering Scene",
      sceneType: "cyber_financial_atm",
      environment: {
        timeOfDay: "night",
        weather: "clear",
        locationName: "Bank ATM Vestibule & Adjoining Arcade",
        groundType: "alleyway",
      },
      elements: [
        {
          id: "atm-1",
          type: "atm_kiosk",
          label: "Tampered Cash Dispenser Terminal",
          position: [0, 0, -3],
          rotation: [0, 0, 0],
        },
        {
          id: "lamp-1",
          type: "street_lamp",
          label: "Arcade Overhead Luminaire",
          position: [-4, 0, 0],
        },
        {
          id: "tape-1",
          type: "caution_tape",
          label: "Police Protective Cordon",
          position: [0, 0, 3],
        },
        {
          id: "police-1",
          type: "patrol_car",
          label: "Cyber & Forensic Unit Mobile Lab",
          position: [6, 0, 4],
          rotation: [0, -0.4, 0],
        },
      ],
      evidenceMarkers: [
        {
          id: "evm-1",
          markerNumber: 1,
          title: "Hardware Overlay Skimming Device",
          description: "False card reader bezel with embedded micro-camera and magnetic tape reader cloned over slot.",
          legalRelevance: "Information Technology Act, 2000 · Section 66C (Identity Theft) & 66D (Cheating by Impersonation)",
          position: [0, 1.1, -2.8],
          evidenceCategory: "Digital",
        },
        {
          id: "evm-2",
          markerNumber: 2,
          title: "Latent Fingerprints on Keypad Bezel",
          description: "Ridge impressions lifted with ninhydrin and magnetic black powder for AFIS database matching.",
          legalRelevance: "Bharatiya Sakshya Adhiniyam (BSA), 2023 · Section 45 (Expert Opinion on Fingerprints)",
          position: [0.2, 0.9, -2.8],
          evidenceCategory: "Trace",
        },
        {
          id: "evm-3",
          markerNumber: 3,
          title: "Dropped Micro-SD Memory Card",
          description: "High-capacity flash memory card containing encoded magnetic strip dump files.",
          legalRelevance: "IT Act Sec 65B & BSA 2023 Forensic Hash Integrity Chain",
          position: [-0.6, 0, -1.8],
          evidenceCategory: "Digital",
        },
      ],
      forensicAnalysis: {
        summary:
          "Targeted physical cyber skimming operation detected at ATM vestibule. Overlay reader captured magnetic track-2 data and pinhole optics recorded keypad PIN entry.",
        statutorySections: [
          "Information Technology Act, 2000 · Section 66C & 66D",
          "BNS, 2023 · Section 318 (Cheating and Dishonestly Inducing Delivery of Property)",
          "RBI Zero Liability Circular 2017 (Compensation for Unauthorized Electronic Transactions)",
        ],
        recommendedInvestigationSteps: [
          "Request immediate ATM server transaction logs and golden-hour IP address freezes from NPCI.",
          "Subpoena internal ATM pinhole camera and vestibule dome camera footage.",
          "Notify National Cyber Crime Reporting Portal (1930) to flag affected card numbers.",
        ],
      },
    };
  }

  // Default: General Crime Scene / Assault / Burglary
  return {
    sceneId: `scene-${Date.now()}`,
    caseTitle: "Incident Scene Forensic Reconstruction & Statutory Evidence Model",
    sceneType: isBurglary ? "burglary_breakin" : "alley_assault",
    environment: {
      timeOfDay: "night",
      weather: "clear",
      locationName: "Commercial / Residential Boundary Lane",
      groundType: "asphalt_street",
    },
    elements: [
      {
        id: "building-1",
        type: "building_facade",
        label: "Commercial Building Facade & Security Enclosure",
        position: [0, 0, -6],
      },
      {
        id: "police-1",
        type: "patrol_car",
        label: "Station House Officer Mobile Unit",
        position: [-6, 0, 4],
        rotation: [0, 0.3, 0],
      },
      {
        id: "lamp-1",
        type: "street_lamp",
        label: "Street Lamp Illuminating Walkway",
        position: [-5, 0, -2],
      },
      {
        id: "dumpster-1",
        type: "dumpster",
        label: "Commercial Waste Enclosure",
        position: [6, 0, -4],
      },
      {
        id: "tape-1",
        type: "caution_tape",
        label: "Barricade Caution Ribbon",
        position: [0, 0, 6],
      },
    ],
    evidenceMarkers: [
      {
        id: "evm-1",
        markerNumber: 1,
        title: "Point of Forced Entry / Altercation",
        description: "Scuff marks, displaced debris, and impact damage confirming physical interaction.",
        legalRelevance: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 · Section 173 (Cognizable Offence Inspection)",
        position: [-0.5, 0, -4.5],
        evidenceCategory: "Physical",
      },
      {
        id: "evm-2",
        markerNumber: 2,
        title: "Forensic Heavy-Duty Flashlight",
        description: "Dropped aluminum-body inspection torch with partial palm print on barrel.",
        legalRelevance: "BSA 2023 Physical Evidence Seizure Memo (Panchnama)",
        position: [1.2, 0, -2.5],
        evidenceCategory: "Physical",
      },
      {
        id: "evm-3",
        markerNumber: 3,
        title: "Footwear Outsole Impression Pattern",
        description: "Deep herringbone rubber tread imprint in soft verge matching size 9 commercial sneaker.",
        legalRelevance: "Bharatiya Sakshya Adhiniyam, 2023 · Forensic Impression Corroboration",
        position: [2.4, 0, -1.0],
        evidenceCategory: "Trace",
      },
      {
        id: "evm-4",
        markerNumber: 4,
        title: "Victim's Retained Possessions / Dispersed Documents",
        description: "Folder with employment contract, identity proofs, and cash receipt envelope.",
        legalRelevance: "NALSA Section 12 Legal Aid Evidence & Property Recovery Under BNSS Sec 497",
        position: [-2.2, 0, -0.5],
        evidenceCategory: "Physical",
      },
    ],
    forensicAnalysis: {
      summary:
        "Physical scene inspection reveals signs of confrontation with clear directional egress trail towards the north-east lane. 4 physical evidence points catalogued with spatial coordinate offsets.",
      statutorySections: [
        "BNSS, 2023 · Section 173 (Mandatory FIR Registration)",
        "BNSS, 2023 · Section 105 (Mandatory Videography of Crime Scene Inspection)",
        "BNS, 2023 · Sections 303 & 351 (Theft & Criminal Trespass)",
        "Bharatiya Sakshya Adhiniyam, 2023 · Section 22 (Documentary & Real Evidence)",
      ],
      recommendedInvestigationSteps: [
        "Conduct mandatory videography of the scene under BNSS Section 105 with 2 independent panchas.",
        "Draw formal scale map of the crime scene for attachment to the police charge-sheet.",
        "Forward lifted latent prints and shoe sole impressions to State Forensic Science Laboratory (SFSL).",
        "Issue written preservation notice to nearby property owners for digital camera archives.",
      ],
    },
  };
}

// ============================================================================
// PROCEDURAL 3D ASSET BUILDERS (COMPOSITE 3-12 PART THREE.GROUP MODELS)
// ============================================================================

// Procedural Canvas Texture Generator: Road Asphalt with Lane Markings
function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1E242B";
  ctx.fillRect(0, 0, 1024, 1024);

  // Noise specks
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const shade = Math.floor(25 + Math.random() * 25);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Crosswalk / Dashed Center Lines
  ctx.strokeStyle = "#F1C40F";
  ctx.lineWidth = 14;
  ctx.setLineDash([48, 36]);
  ctx.beginPath();
  ctx.moveTo(512, 0);
  ctx.lineTo(512, 1024);
  ctx.stroke();

  // White lane boundaries
  ctx.strokeStyle = "#ECEFF1";
  ctx.lineWidth = 10;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, 1024);
  ctx.moveTo(944, 0);
  ctx.lineTo(944, 1024);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Caution Tape Hazard Stripes Texture
function createCautionTapeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(0, 0, 512, 64);

  // Black diagonal hazard stripes
  ctx.fillStyle = "#111827";
  const stripeW = 32;
  for (let x = -64; x < 576; x += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeW, 0);
    ctx.lineTo(x + stripeW - 24, 64);
    ctx.lineTo(x - 24, 64);
    ctx.closePath();
    ctx.fill();
  }

  // Bold text
  ctx.fillStyle = "#111827";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POLICE LINE DO NOT CROSS · अपराध स्थल", 256, 38);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Numbered Evidence Marker Texture (Tent Number #1..6)
function createMarkerTexture(markerNum: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#FACC15";
  ctx.fillRect(0, 0, 256, 256);

  // Black border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 244, 244);

  // Top header
  ctx.fillStyle = "#000000";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("EVIDENCE", 128, 48);

  // Big number
  ctx.font = "bold 118px sans-serif";
  ctx.fillText(String(markerNum), 128, 168);

  // Bottom metric scale bars
  ctx.fillStyle = "#000000";
  for (let i = 24; i < 232; i += 16) {
    ctx.fillRect(i, 214, 8, 20);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 1. Composite Police Patrol Cruiser (7-Part THREE.Group)
function createPoliceCruiserGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = "police_cruiser";

  // Part 1: Main Chassis Lower Hull
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });
  const chassisGeo = new THREE.BoxGeometry(2.1, 0.65, 4.4);
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Part 2: White Police Door Panels (Distinctive Dual-Tone)
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.3,
    roughness: 0.4,
  });
  const sidePanelGeo = new THREE.BoxGeometry(2.12, 0.5, 1.8);
  const sidePanel = new THREE.Mesh(sidePanelGeo, whiteMat);
  sidePanel.position.set(0, 0.58, 0);
  group.add(sidePanel);

  // Part 3: Upper Cabin & Tinted Windows
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.1,
  });
  const cabinGeo = new THREE.BoxGeometry(1.7, 0.55, 2.2);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.1, -0.2);
  cabin.castShadow = true;
  group.add(cabin);

  // Part 4: 4 Detailed Rubber Wheels with Silver Rim Hubcaps
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.8,
    roughness: 0.2,
  });
  const wheelPositions = [
    [-1.05, 0.35, 1.3],
    [1.05, 0.35, 1.3],
    [-1.05, 0.35, -1.3],
    [1.05, 0.35, -1.3],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.24, 16),
      wheelMat
    );
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    tire.castShadow = true;

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.26, 12),
      rimMat
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);
    group.add(tire);
    group.add(rim);
  });

  // Part 5: Roof Emergency Lightbar (Dual Red & Blue Strobe Blocks)
  const lightbarFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.08, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
  );
  lightbarFrame.position.set(0, 1.42, -0.2);
  group.add(lightbarFrame);

  const redStrobe = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.12, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    })
  );
  redStrobe.position.set(-0.25, 1.48, -0.2);
  redStrobe.name = "strobe_red";
  group.add(redStrobe);

  const blueStrobe = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.12, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    })
  );
  blueStrobe.position.set(0.25, 1.48, -0.2);
  blueStrobe.name = "strobe_blue";
  group.add(blueStrobe);

  // Part 6: Front Push Bumper / Bull Bar
  const bullBarMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.7,
    roughness: 0.5,
  });
  const bullBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.45, 0.15),
    bullBarMat
  );
  bullBar.position.set(0, 0.5, 2.25);
  group.add(bullBar);

  // Part 7: Headlights
  const headLightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.05), headLightMat);
  hlLeft.position.set(-0.7, 0.65, 2.22);
  const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.05), headLightMat);
  hlRight.position.set(0.7, 0.65, 2.22);
  group.add(hlLeft);
  group.add(hlRight);

  // Radial Soft Contact Shadow
  const shadowGeo = new THREE.PlaneGeometry(2.6, 4.8);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.55,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  return group;
}

// 2. Composite Damaged Sedan (Crumpled Impact Vehicle)
function createDamagedSedanGroup(colorHex: string = "#64748B"): THREE.Group {
  const group = new THREE.Group();
  group.name = "damaged_sedan";

  const carColor = parseInt(colorHex.replace("#", "0x"), 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: carColor,
    metalness: 0.7,
    roughness: 0.35,
  });

  // Main Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 4.2), bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // Damaged / Crumpled Front Hood (Tilted downwards)
  const hoodMat = new THREE.MeshStandardMaterial({
    color: carColor,
    metalness: 0.75,
    roughness: 0.6,
  });
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 1.4), hoodMat);
  hood.position.set(0, 0.62, 1.5);
  hood.rotation.x = 0.18; // bent from front impact
  hood.rotation.z = -0.08;
  hood.castShadow = true;
  group.add(hood);

  // Cabin with shattered windshield
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.55, 2.0),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    })
  );
  cabin.position.set(0, 1.05, -0.3);
  cabin.castShadow = true;
  group.add(cabin);

  // 4 Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 });
  const wheelPositions = [
    [-1.0, 0.32, 1.2],
    [1.0, 0.32, 1.2],
    [-1.0, 0.32, -1.2],
    [1.0, 0.32, -1.2],
  ];
  wheelPositions.forEach(([x, y, z], idx) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14),
      wheelMat
    );
    wheel.rotation.z = Math.PI / 2;
    if (idx === 0) wheel.rotation.y = 0.4; // Front-left wheel turned/skewed from crash
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // Hanging bumper
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(1.95, 0.2, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
  );
  bumper.position.set(0.1, 0.28, 2.15);
  bumper.rotation.z = 0.12;
  group.add(bumper);

  // Contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 4.6),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  return group;
}

// 3. Composite Forensic Street Light Post with Downward Spotlight
function createStreetLampGroup(isNight: boolean = true): {
  group: THREE.Group;
  spotLight?: THREE.SpotLight;
} {
  const group = new THREE.Group();
  group.name = "street_lamp";

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.9,
    roughness: 0.3,
  });

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8), metalMat);
  base.position.y = 0.3;
  base.castShadow = true;
  group.add(base);

  // Main Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.0, 12), metalMat);
  pole.position.y = 3.3;
  pole.castShadow = true;
  group.add(pole);

  // Curved Top Arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.8), metalMat);
  arm.position.set(0, 6.2, 0.8);
  arm.rotation.x = 0.15;
  group.add(arm);

  // Lamp Luminaire Head
  const lampHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.2, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95 })
  );
  lampHead.position.set(0, 6.1, 1.6);
  group.add(lampHead);

  // Glowing Bulb Lens
  const bulbMat = new THREE.MeshStandardMaterial({
    color: isNight ? 0xfff7ed : 0xd1d5db,
    emissive: isNight ? 0xf59e0b : 0x000000,
    emissiveIntensity: isNight ? 2.5 : 0,
    roughness: 0.1,
  });
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.5), bulbMat);
  bulb.position.set(0, 6.0, 1.6);
  group.add(bulb);

  let spotLight: THREE.SpotLight | undefined;
  if (isNight) {
    spotLight = new THREE.SpotLight(0xffedd5, 45, 18, Math.PI / 4, 0.45, 1.2);
    spotLight.position.set(0, 6.0, 1.6);
    const target = new THREE.Object3D();
    target.position.set(0, 0, 1.6);
    group.add(target);
    spotLight.target = target;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    group.add(spotLight);
  }

  return { group, spotLight };
}

// 4. Composite Caution Tape Barrier (Two Poles with Ribbon)
function createCautionTapeGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = "caution_tape_barrier";

  const stanchionMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Pole A & B
  [-3.5, 3.5].forEach((x) => {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.12, 16),
      stanchionMat
    );
    base.position.set(x, 0.06, 0);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12),
      stanchionMat
    );
    post.position.set(x, 0.66, 0);
    post.castShadow = true;
    group.add(base);
    group.add(post);
  });

  // Hazard Ribbon with canvas texture
  const ribbonTex = createCautionTapeTexture();
  const ribbonMat = new THREE.MeshStandardMaterial({
    map: ribbonTex,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const ribbonGeo = new THREE.PlaneGeometry(7.0, 0.18);
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.set(0, 1.05, 0);
  ribbon.castShadow = true;
  group.add(ribbon);

  // Lower second ribbon for realism
  const ribbon2 = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon2.position.set(0, 0.55, 0);
  group.add(ribbon2);

  return group;
}

// 5. Composite Triangular Evidence Tent Marker (#1..6)
function createEvidenceMarkerMesh(markerNum: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `marker_tent_${markerNum}`;

  const markerTex = createMarkerTexture(markerNum);
  const tentMat = new THREE.MeshStandardMaterial({
    map: markerTex,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // A-frame tent geometry: two sloped faces
  const faceGeo = new THREE.PlaneGeometry(0.38, 0.45);

  const faceA = new THREE.Mesh(faceGeo, tentMat);
  faceA.position.set(0, 0.2, 0.1);
  faceA.rotation.x = 0.45;
  faceA.castShadow = true;

  const faceB = new THREE.Mesh(faceGeo, tentMat);
  faceB.position.set(0, 0.2, -0.1);
  faceB.rotation.x = -0.45;
  faceB.rotation.y = Math.PI;
  faceB.castShadow = true;

  group.add(faceA);
  group.add(faceB);

  // Base ridge plate
  const baseRidge = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.02, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xca8a04 })
  );
  baseRidge.position.y = 0.01;
  group.add(baseRidge);

  // Pulsing Halo Glow Disc on ground for easy tapping/interaction
  const haloGeo = new THREE.RingGeometry(0.3, 0.45, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.015;
  halo.name = `halo_${markerNum}`;
  group.add(halo);

  return group;
}

// 6. ATM Kiosk & Alcove Unit (7-Part Composite)
function createAtmKioskGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = "atm_kiosk";

  // Wall Alcove
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.8, 0.5), wallMat);
  wall.position.set(0, 1.9, -0.25);
  group.add(wall);

  // ATM Cabinet
  const cabinetMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.8,
    roughness: 0.25,
  });
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.8), cabinetMat);
  cabinet.position.set(0, 1.05, 0.4);
  cabinet.castShadow = true;
  group.add(cabinet);

  // Screen
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.2,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), screenMat);
  screen.position.set(0, 1.45, 0.81);
  group.add(screen);

  // Keypad shelf
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.1, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
  );
  shelf.position.set(0, 1.0, 0.9);
  group.add(shelf);

  // Overhead Security Camera with red LED
  const cameraBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  cameraBracket.position.set(1.1, 2.7, 0.2);
  group.add(cameraBracket);

  const redLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  redLed.position.set(1.1, 2.65, 0.35);
  group.add(redLed);

  return group;
}

// 7. Broken Glass Shard Cluster
function createBrokenGlassGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = "broken_glass";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.75,
    opacity: 0.9,
    transparent: true,
    roughness: 0.05,
    ior: 1.5,
  });

  for (let i = 0; i < 24; i++) {
    const w = 0.08 + Math.random() * 0.15;
    const h = 0.08 + Math.random() * 0.15;
    const shard = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
    shard.rotation.x = -Math.PI / 2;
    shard.rotation.z = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.9;
    const theta = Math.random() * Math.PI * 2;
    shard.position.set(Math.cos(theta) * r, 0.02 + Math.random() * 0.01, Math.sin(theta) * r);
    group.add(shard);
  }

  return group;
}

// 8. Skid Marks (Tire Decal on road)
function createSkidMarksMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = "skid_marks";

  const skidMat = new THREE.MeshBasicMaterial({
    color: 0x05070a,
    transparent: true,
    opacity: 0.65,
  });

  [-0.6, 0.6].forEach((xOffset) => {
    const track = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 6.0), skidMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(xOffset, 0.012, 0);
    group.add(track);
  });

  return group;
}

// ============================================================================
// MAIN 3D CRIME SCENE STUDIO COMPONENT
// ============================================================================
interface CrimeScene3DStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialDescription?: string;
  language: string;
  onIntegrateWithCase?: (crimeData: CrimeSceneData) => void;
  onOpenGeminiLive?: () => void;
}

export const CrimeScene3DStudio: React.FC<CrimeScene3DStudioProps> = ({
  isOpen,
  onClose,
  initialDescription = "",
  language = "English",
  onIntegrateWithCase,
  onOpenGeminiLive,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scene state
  const [descriptionInput, setDescriptionInput] = useState<string>(
    initialDescription ||
      "A late-night car collision at an urban intersection with heavy front bumper damage, 18-meter skid marks, and scattered broken headlight glass near a street lamp."
  );
  const [sceneData, setSceneData] = useState<CrimeSceneData>(() =>
    generateDefaultCrimeScene(initialDescription, language)
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>("evm-1");
  const [cameraView, setCameraView] = useState<"drone" | "eye" | "evidence" | "blueprint">("drone");
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string>("");
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Three.js instances ref
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;
    animationFrameId: number | null;
    markerMeshes: Map<string, THREE.Group>;
    strobeLights: { red: THREE.PointLight; blue: THREE.PointLight } | null;
    measurementLine: THREE.Line | null;
    asphaltPlane: THREE.Mesh | null;
    ambientLight: THREE.AmbientLight | null;
    directionalLight: THREE.DirectionalLight | null;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    animationFrameId: null,
    markerMeshes: new Map(),
    strobeLights: null,
    measurementLine: null,
    asphaltPlane: null,
    ambientLight: null,
    directionalLight: null,
  });

  // Reconstruct Scene from AI Endpoint or Fallback
  const handleReconstructScene = async (customPrompt?: string) => {
    const promptToUse = (customPrompt ?? descriptionInput).trim();
    if (!promptToUse) return;

    setIsGenerating(true);
    setExportNotice("");
    try {
      const res = await apifetch("/api/reconstruct-crime-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: promptToUse,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("API call fallback");
      }
      const data: CrimeSceneData = await res.json();
      setSceneData(data);
      if (data.evidenceMarkers[0]) {
        setSelectedMarkerId(data.evidenceMarkers[0].id);
      }
    } catch {
      // Offline / Quota Fallback: generate instant rich procedural scene
      const fallback = generateDefaultCrimeScene(promptToUse, language);
      setSceneData(fallback);
      if (fallback.evidenceMarkers[0]) {
        setSelectedMarkerId(fallback.evidenceMarkers[0].id);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync initial description when modal opens or when description updates from Gemini Live
  useEffect(() => {
    if (isOpen && initialDescription && initialDescription.trim().length > 5) {
      setDescriptionInput(initialDescription);
      handleReconstructScene(initialDescription);
    }
  }, [isOpen, initialDescription]);

  // Selected Evidence details
  const activeMarker = useMemo(() => {
    return sceneData.evidenceMarkers.find((m) => m.id === selectedMarkerId) || sceneData.evidenceMarkers[0];
  }, [sceneData, selectedMarkerId]);

  // Initialize Three.js Canvas & Scene
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x070b14 : 0xe2e8f0);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x070b14 : 0xe2e8f0, 0.035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    camera.position.set(0, 12, 18);

    // 3. Renderer setup (Three.js studio PBR standards)
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNightMode ? 1.25 : 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Room Environment Reflection
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Ignore if fallback
    }

    // 5. OrbitControls with Damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip under ground
    controls.minDistance = 2.0;
    controls.maxDistance = 45.0;
    controls.target.set(0, 0.5, 0);

    // 6. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(
      isNightMode ? 0x1e293b : 0xffffff,
      isNightMode ? 0.7 : 1.2
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      isNightMode ? 0x93c5fd : 0xffedd5,
      isNightMode ? 0.8 : 2.2
    );
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = !isSoftwareGl;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);

    // Strobe Point Lights for Police Siren (Flashing Red and Blue)
    const redStrobeLight = new THREE.PointLight(0xef4444, 0, 14);
    const blueStrobeLight = new THREE.PointLight(0x3b82f6, 0, 14);
    scene.add(redStrobeLight);
    scene.add(blueStrobeLight);

    // 7. Ground Plane with Procedural Asphalt & Road Grid
    const asphaltTex = createAsphaltTexture();
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.88,
      metalness: 0.12,
    });
    const asphaltPlane = new THREE.Mesh(groundGeo, groundMat);
    asphaltPlane.rotation.x = -Math.PI / 2;
    asphaltPlane.receiveShadow = true;
    scene.add(asphaltPlane);

    // Save references
    threeRef.current = {
      renderer,
      scene,
      camera,
      controls,
      animationFrameId: null,
      markerMeshes: new Map(),
      strobeLights: { red: redStrobeLight, blue: blueStrobeLight },
      measurementLine: null,
      asphaltPlane,
      ambientLight,
      directionalLight,
    };

    // 8. Build 3D Objects from sceneData
    populateSceneObjects(scene, sceneData, threeRef.current.markerMeshes, isNightMode);

    // 9. Animation & Render Loop
    let clock = new THREE.Clock();
    let strobeTimer = 0;

    const animate = () => {
      const delta = clock.getDelta();
      controls.update();

      // Police Strobe Flashing effect at night
      if (isNightMode && redStrobeLight && blueStrobeLight) {
        strobeTimer += delta * 6;
        const phase = Math.floor(strobeTimer) % 2;
        redStrobeLight.intensity = phase === 0 ? 12 : 0;
        blueStrobeLight.intensity = phase === 1 ? 12 : 0;
      }

      // Gentle pulsing of evidence marker halo rings
      threeRef.current.markerMeshes.forEach((meshGroup, markerId) => {
        const halo = meshGroup.getObjectByName(`halo_${meshGroup.userData.markerNum}`);
        if (halo && halo instanceof THREE.Mesh) {
          const isSelected = markerId === selectedMarkerId;
          const scale = isSelected
            ? 1.0 + Math.sin(clock.getElapsedTime() * 5) * 0.12
            : 1.0;
          halo.scale.set(scale, scale, 1);
        }
      });

      renderer.render(scene, camera);
      threeRef.current.animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler with ResizeObserver for mobile devices
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener("resize", handleResize);
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    ro.observe(container);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      if (threeRef.current.animationFrameId) {
        cancelAnimationFrame(threeRef.current.animationFrameId);
      }
      controls.dispose();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [isOpen, isNightMode]);

  // Re-populate objects when sceneData updates
  useEffect(() => {
    if (!threeRef.current.scene) return;
    const { scene, markerMeshes } = threeRef.current;

    // Clear old elements & markers
    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach((child) => {
      if (
        child.name.startsWith("elem_") ||
        child.name.startsWith("marker_") ||
        child.name === "police_cruiser" ||
        child.name === "damaged_sedan" ||
        child.name === "caution_tape_barrier" ||
        child.name === "street_lamp" ||
        child.name === "atm_kiosk" ||
        child.name === "broken_glass" ||
        child.name === "skid_marks"
      ) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => scene.remove(obj));
    markerMeshes.clear();

    populateSceneObjects(scene, sceneData, markerMeshes, isNightMode);
  }, [sceneData, isNightMode]);

  // Helper function to populate objects into scene
  function populateSceneObjects(
    scene: THREE.Scene,
    data: CrimeSceneData,
    markerMeshesMap: Map<string, THREE.Group>,
    night: boolean
  ) {
    // 1. Elements
    data.elements.forEach((elem) => {
      let meshGroup: THREE.Group | null = null;

      switch (elem.type) {
        case "patrol_car":
          meshGroup = createPoliceCruiserGroup();
          // Position strobe lights
          if (threeRef.current.strobeLights) {
            threeRef.current.strobeLights.red.position.set(
              elem.position[0] - 0.4,
              elem.position[1] + 1.6,
              elem.position[2]
            );
            threeRef.current.strobeLights.blue.position.set(
              elem.position[0] + 0.4,
              elem.position[1] + 1.6,
              elem.position[2]
            );
          }
          break;
        case "damaged_sedan":
          meshGroup = createDamagedSedanGroup(elem.color || "#64748B");
          break;
        case "street_lamp": {
          const lampResult = createStreetLampGroup(night);
          meshGroup = lampResult.group;
          break;
        }
        case "caution_tape":
          meshGroup = createCautionTapeGroup();
          break;
        case "atm_kiosk":
          meshGroup = createAtmKioskGroup();
          break;
        case "broken_glass":
          meshGroup = createBrokenGlassGroup();
          break;
        case "skid_marks":
          meshGroup = createSkidMarksMesh();
          break;
        default:
          meshGroup = createCautionTapeGroup();
          break;
      }

      if (meshGroup) {
        meshGroup.position.set(...elem.position);
        if (elem.rotation) meshGroup.rotation.set(...elem.rotation);
        if (elem.scale) meshGroup.scale.set(...elem.scale);
        meshGroup.name = `elem_${elem.id}`;
        scene.add(meshGroup);
      }
    });

    // 2. Evidence Tent Markers (#1..6)
    data.evidenceMarkers.forEach((marker) => {
      const markerGroup = createEvidenceMarkerMesh(marker.markerNumber);
      markerGroup.position.set(...marker.position);
      markerGroup.userData = { markerId: marker.id, markerNum: marker.markerNumber };
      markerGroup.name = `marker_${marker.id}`;
      scene.add(markerGroup);
      markerMeshesMap.set(marker.id, markerGroup);
    });
  }

  // Start Voice Recognition for Mobile Speech Description
  const handleStartVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setExportNotice("Speech recognition is not supported in this browser. Please type below.");
      setTimeout(() => setExportNotice(""), 3500);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0]?.[0]?.transcript;
        if (transcript) {
          setDescriptionInput(transcript);
          handleReconstructScene(transcript);
        }
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  // Handle Mobile Touch / Mouse Tap (Disambiguated from Camera Drag & Orbit)
  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartPosRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartPosRef.current) return;
    const dx = Math.abs(event.clientX - pointerStartPosRef.current.x);
    const dy = Math.abs(event.clientY - pointerStartPosRef.current.y);
    pointerStartPosRef.current = null;

    // If user dragged finger/pointer more than 7px, it was a 3D orbit rotation or pinch, not a tap
    if (dx > 7 || dy > 7) return;

    if (!containerRef.current || !threeRef.current.camera || !threeRef.current.scene) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), threeRef.current.camera);

    const intersects = raycaster.intersectObjects(threeRef.current.scene.children, true);

    if (intersects.length > 0) {
      // Check if tapped an evidence marker
      let markerHitGroup: THREE.Group | null = null;
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent) {
          if (parent.userData?.markerId) {
            markerHitGroup = parent as THREE.Group;
            break;
          }
          parent = parent.parent;
        }
        if (markerHitGroup) break;
      }

      if (markerHitGroup) {
        const markerId = markerHitGroup.userData.markerId;
        setSelectedMarkerId(markerId);
        setIsEvidenceDrawerOpen(true);

        // Smoothly focus camera on this marker
        focusCameraOnPoint(markerHitGroup.position);
        return;
      }

      // If measuring tool is active, record points
      if (isMeasuring && intersects[0].point) {
        const clickPoint = intersects[0].point;
        if (measurementPoints.length === 0) {
          setMeasurementPoints([clickPoint]);
          setMeasuredDistance(null);
        } else if (measurementPoints.length === 1) {
          const ptA = measurementPoints[0];
          const ptB = clickPoint;
          const dist = ptA.distanceTo(ptB);
          setMeasurementPoints([ptA, ptB]);
          setMeasuredDistance(parseFloat(dist.toFixed(2)));

          // Draw 3D Measurement line
          if (threeRef.current.scene) {
            if (threeRef.current.measurementLine) {
              threeRef.current.scene.remove(threeRef.current.measurementLine);
            }
            const lineGeo = new THREE.BufferGeometry().setFromPoints([ptA, ptB]);
            const lineMat = new THREE.LineDashedMaterial({
              color: 0xef4444,
              dashSize: 0.3,
              gapSize: 0.15,
              linewidth: 3,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            line.computeLineDistances();
            threeRef.current.scene.add(line);
            threeRef.current.measurementLine = line;
          }
        } else {
          // Reset on 3rd click
          setMeasurementPoints([clickPoint]);
          setMeasuredDistance(null);
          if (threeRef.current.measurementLine && threeRef.current.scene) {
            threeRef.current.scene.remove(threeRef.current.measurementLine);
            threeRef.current.measurementLine = null;
          }
        }
      }
    }
  };

  // Smooth Camera Focus
  const focusCameraOnPoint = (targetPos: THREE.Vector3) => {
    if (!threeRef.current.camera || !threeRef.current.controls) return;
    const { camera, controls } = threeRef.current;

    controls.target.set(targetPos.x, targetPos.y + 0.3, targetPos.z);
    camera.position.set(targetPos.x + 2.5, targetPos.y + 2.0, targetPos.z + 3.0);
    controls.update();
  };

  // Preset Camera Angles
  const handleSetCameraPreset = (preset: "drone" | "eye" | "evidence" | "blueprint") => {
    if (!threeRef.current.camera || !threeRef.current.controls) return;
    const { camera, controls } = threeRef.current;
    setCameraView(preset);

    switch (preset) {
      case "drone":
        camera.position.set(0, 14, 16);
        controls.target.set(0, 0, 0);
        break;
      case "eye":
        camera.position.set(0, 1.7, 7.5);
        controls.target.set(0, 1.2, -1.0);
        break;
      case "evidence":
        if (activeMarker) {
          focusCameraOnPoint(new THREE.Vector3(...activeMarker.position));
        } else {
          camera.position.set(2, 3, 4);
          controls.target.set(0, 0.5, 0);
        }
        break;
      case "blueprint":
        camera.position.set(0, 24, 0.1);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  };

  // Export 3D Crime Scene Forensic Snapshot
  const handleExportForensicSnapshot = () => {
    if (!threeRef.current.renderer) return;
    setIsExporting(true);

    try {
      const dataUrl = threeRef.current.renderer.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Nyaya_Sahayak_3D_Crime_Scene_${sceneData.sceneType}.png`;
      a.click();
      setExportNotice("High-resolution 3D Crime Scene Snapshot exported for court / FIR representation!");
      setTimeout(() => setExportNotice(""), 4000);
    } catch {
      setExportNotice("Could not export canvas snapshot.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-3 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] h-[100dvh] sm:h-[calc(100dvh-24px)] sm:max-h-[900px] bg-[#0A0E1A] text-white sm:rounded-[38px] sm:border-[6px] sm:border-[#1E293B] shadow-2xl overflow-hidden flex flex-col relative select-none"
      >
        {/* Mobile Grab Bar / Notch */}
        <div className="pt-2 pb-1 px-4 bg-[#0F1523] flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-amber-300 text-[11px]">3D Crime Scene Studio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[9px]">
              Three.js PBR
            </span>
            <div className="w-8 h-1 rounded-full bg-white/20 sm:hidden ml-1" />
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div className="px-3 py-2 bg-[#0F1523]/95 border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 transition-all"
              aria-label="Back to Case"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white tracking-wide truncate">
                {sceneData.caseTitle || "Forensic Crime Scene"}
              </h2>
              <p className="text-[10px] text-slate-400 truncate">
                {sceneData.environment.locationName} · {isNightMode ? "Night Strobe" : "Daylight"}
              </p>
            </div>
          </div>

          {/* Quick Action Tools for Mobile */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Night / Day Toggle */}
            <button
              type="button"
              onClick={() => setIsNightMode((prev) => !prev)}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                isNightMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                  : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/15"
              }`}
              title={isNightMode ? "Switch to Day" : "Switch to Night"}
            >
              {isNightMode ? <Moon className="w-3.5 h-3.5 shrink-0" /> : <Sun className="w-3.5 h-3.5 shrink-0" />}
            </button>

            {/* Tape Distance Measure Tool */}
            <button
              type="button"
              onClick={() => {
                setIsMeasuring((m) => !m);
                setMeasurementPoints([]);
                setMeasuredDistance(null);
              }}
              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                isMeasuring
                  ? "bg-red-500/30 text-red-300 border-red-400/60"
                  : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/15"
              }`}
              title="Tape Measure Tool"
            >
              <Ruler className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* Export Snapshot */}
            <button
              type="button"
              onClick={handleExportForensicSnapshot}
              disabled={isExporting}
              className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all shrink-0"
              title="Export Snapshot"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            </button>

            {/* Attach to Case Button */}
            {onIntegrateWithCase && (
              <button
                type="button"
                onClick={() => {
                  onIntegrateWithCase(sceneData);
                  onClose();
                }}
                className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs shrink-0"
                title="Attach evidence markers to case store"
              >
                <Check className="w-3 h-3 shrink-0" />
                <span>Attach</span>
              </button>
            )}
          </div>
        </div>

        {/* Main 3D Viewport Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden min-h-0">
          {/* Three.js Canvas Container */}
          <div
            ref={containerRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerUp={handleCanvasPointerUp}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
          />

          {/* Floating Export Notice Banner */}
          {exportNotice && (
            <div className="absolute top-12 left-3 right-3 z-30 px-3 py-2 rounded-xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-[11px] font-semibold shadow-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{exportNotice}</span>
            </div>
          )}

          {/* Distance Measuring Overlay Banner */}
          {isMeasuring && (
            <div className="absolute top-2 left-2 right-2 z-20 px-3 py-1.5 rounded-xl bg-[#141B2D]/95 border border-amber-400/50 text-[11px] font-bold shadow-lg flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-1.5 truncate">
                <Ruler className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {measuredDistance !== null
                    ? `Distance: ${measuredDistance} m`
                    : measurementPoints.length === 0
                    ? "Tap Point 1 on ground..."
                    : "Tap Point 2 to measure..."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMeasuring(false);
                  setMeasurementPoints([]);
                  setMeasuredDistance(null);
                }}
                className="text-[10px] text-red-300 hover:text-white px-2 py-0.5 rounded bg-red-950/60 ml-2 shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Top Horizontal Evidence Markers Strip */}
          <div className="absolute left-2 right-2 top-2 z-20 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[9px] font-bold text-amber-300 bg-[#0F1523]/90 border border-white/10 px-2 py-1 rounded-xl shrink-0 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Markers:</span>
            </span>
            {sceneData.evidenceMarkers.map((m) => {
              const isSelected = selectedMarkerId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMarkerId(m.id);
                    setIsEvidenceDrawerOpen(true);
                    focusCameraOnPoint(new THREE.Vector3(...m.position));
                  }}
                  className={`h-7 px-2.5 rounded-xl text-[11px] font-black flex items-center gap-1 shrink-0 transition-all active:scale-95 ${
                    isSelected
                      ? "bg-[#FACC15] text-black shadow-lg scale-105"
                      : "bg-[#0F1523]/90 hover:bg-white/20 text-white border border-white/15"
                  }`}
                >
                  <span>#{m.markerNumber}</span>
                  <span className="text-[9px] font-semibold opacity-85 truncate max-w-[85px]">
                    {m.title.replace(/^Marker\s*#?\d+:?\s*/i, "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Camera Angles Dock for Mobile (Floating Pills) */}
          <div className="absolute left-2.5 bottom-16 z-20 flex items-center gap-1 bg-[#0F1523]/90 border border-white/15 p-1 rounded-xl shadow-xl backdrop-blur-sm max-w-[calc(100%-20px)] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSetCameraPreset("drone")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors ${
                cameraView === "drone" ? "bg-[#C86D1F] text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <Eye className="w-3 h-3 shrink-0" />
              <span>Drone</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetCameraPreset("eye")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
                cameraView === "eye" ? "bg-[#C86D1F] text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>Eye</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetCameraPreset("evidence")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
                cameraView === "evidence" ? "bg-[#C86D1F] text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>Close-Up</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetCameraPreset("blueprint")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
                cameraView === "blueprint" ? "bg-[#C86D1F] text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>Top 2D</span>
            </button>
            <button
              type="button"
              onClick={() => focusCameraOnPoint(new THREE.Vector3(0, 0.5, 0))}
              className="px-1.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-white/10 shrink-0 flex items-center justify-center"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
            </button>
          </div>

          {/* Touch Helper Hint Badge */}
          <div className="absolute right-2.5 bottom-16 z-10 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[9px] text-slate-300 pointer-events-none backdrop-blur-xs">
            Touch: Rotate · Pinch: Zoom
          </div>

          {/* Collapsed Peek Bar for Selected Marker (When drawer is closed) */}
          {activeMarker && !isEvidenceDrawerOpen && (
            <div
              onClick={() => setIsEvidenceDrawerOpen(true)}
              className="absolute left-2.5 right-2.5 bottom-1 z-20 bg-[#0F1523]/95 border border-white/20 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform backdrop-blur-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-6 w-6 rounded-lg bg-[#FACC15] text-black text-xs font-black flex items-center justify-center shrink-0">
                  #{activeMarker.markerNumber}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {activeMarker.title}
                  </span>
                  <span className="text-[10px] text-amber-300 truncate block">
                    {activeMarker.evidenceCategory} Evidence · Tap for BNS / BSA Law
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 shrink-0"
                aria-label="Expand Evidence Details"
              >
                <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            </div>
          )}

          {/* Slide-Up Mobile Evidence Inspection Bottom Sheet */}
          {activeMarker && isEvidenceDrawerOpen && (
            <div className="absolute inset-x-0 bottom-0 max-h-[72%] z-30 bg-[#0F1523] border-t border-white/20 rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
              {/* Grab Handle */}
              <div
                onClick={() => setIsEvidenceDrawerOpen(false)}
                className="pt-2 pb-1 flex justify-center cursor-pointer shrink-0"
              >
                <div className="w-10 h-1.5 rounded-full bg-white/25" />
              </div>

              {/* Sheet Header */}
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-6 w-6 rounded-lg bg-[#FACC15] text-black text-xs font-black flex items-center justify-center shrink-0">
                    #{activeMarker.markerNumber}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">
                      {activeMarker.title}
                    </h3>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {activeMarker.evidenceCategory} Forensic Evidence
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEvidenceDrawerOpen(false)}
                  className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:text-white shrink-0"
                  aria-label="Collapse Evidence Sheet"
                >
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Scrollable Forensic & Statutory Content */}
              <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
                {/* Forensic Observation */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Forensic Spatial Observation
                  </span>
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {activeMarker.description}
                  </p>
                </div>

                {/* Indian Statutory Grounding (BNS / BSA 2023) */}
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Statutory Grounding (BNS / BSA 2023)</span>
                  </span>
                  <p className="text-blue-100 font-medium leading-relaxed text-[11px]">
                    {activeMarker.legalRelevance}
                  </p>
                </div>

                {/* Applicable Central Acts & Sections */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Applicable Central Acts & Sections
                  </span>
                  <div className="space-y-1">
                    {sceneData.forensicAnalysis.statutorySections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 font-medium"
                      >
                        {sec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Investigation Steps */}
                <div className="space-y-1.5 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recommended Police Investigation Steps
                  </span>
                  <ul className="space-y-1 pl-4 list-disc text-slate-300 text-[11px]">
                    {sceneData.forensicAnalysis.recommendedInvestigationSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Speech & Prompt Revision Dock */}
        <div className="p-2.5 bg-[#0F1523] border-t border-white/10 shrink-0 z-20 space-y-2">
          {/* Quick Scene Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { label: "+ Car Crash", prompt: "A car crash collision with damaged sedan, skid marks and broken glass" },
              { label: "+ Burglary Break-in", prompt: "A nighttime shop burglary with shattered front window and tire tracks" },
              { label: "+ ATM Skimming", prompt: "An ATM kiosk robbery with digital skimming device and physical evidence markers" },
              { label: "+ Night Assault", prompt: "An alleyway night incident with police cruiser siren strobes and barricade tape" },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDescriptionInput(preset.prompt);
                  handleReconstructScene(preset.prompt);
                }}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold whitespace-nowrap border border-white/10 transition-colors shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Input & Voice Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleReconstructScene();
            }}
            className="flex items-center gap-1.5"
          >
            {/* Gemini Live Voice Input Button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenGeminiLive) {
                  onOpenGeminiLive();
                } else {
                  handleStartVoice();
                }
              }}
              className="h-9 px-2.5 rounded-xl bg-[#D92D20] hover:bg-red-700 active:scale-95 text-white flex items-center gap-1.5 text-xs font-bold shrink-0 transition-transform shadow-sm"
              title="Describe scene in Gemini Live voice (speaks in any Indian language)"
            >
              <Mic className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="hidden xs:inline">Gemini Live</span>
            </button>

            <input
              type="text"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Describe scene or revisions in any language..."
              className="flex-1 bg-white/10 text-white placeholder-slate-400 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C86D1F] border border-white/10"
            />

            <button
              type="submit"
              disabled={isGenerating}
              className="h-9 px-3 rounded-xl bg-[#C86D1F] hover:bg-[#b55f17] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition-all shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{isGenerating ? "Reconstructing..." : "Reconstruct"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
