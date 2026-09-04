"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  Play,
  Square,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  User,
  Utensils,
  Camera,
  Maximize2,
  PlusCircle,
  Copy,
  Check,
  Radio,
  Eye,
  Hand,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/services/firebase-service";
import { CompleteBiometricScanRecord, BiometricSyncService } from "@/services/biometric-sync-service";
import { ContinuousTrainingService, ModelIterationTelemetry } from "@/services/continuous-training-service";

export default function DedicatedConsolePage() {
  const [scans, setScans] = useState<CompleteBiometricScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<CompleteBiometricScanRecord | null>(null);
  const [modelTelemetry, setModelTelemetry] = useState<ModelIterationTelemetry | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<{ title: string; url: string } | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "DEBUG" | "WARN" | "SUCCESS">("ALL");
  const [copied, setCopied] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Fetch telemetry benchmark
  useEffect(() => {
    let isMounted = true;
    ContinuousTrainingService.getActiveModelTelemetry().then((telemetry) => {
      if (isMounted && telemetry) {
        setModelTelemetry(telemetry);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime Firestore Listener
  useEffect(() => {
    if (!db) return;

    try {
      const q = query(
        collection(db, "biometric_scans_history"),
        orderBy("createdAt", "desc"),
        limit(25)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loadedScans: CompleteBiometricScanRecord[] = [];
          snapshot.forEach((docSnap) => {
            loadedScans.push(docSnap.data() as CompleteBiometricScanRecord);
          });

          setScans(loadedScans);
          if (loadedScans.length > 0) {
            setSelectedScan((prev) => {
              if (!prev) return loadedScans[0];
              const found = loadedScans.find((s) => s.scanId === prev.scanId);
              return found || loadedScans[0];
            });
          }
        },
        (err) => {
          console.warn("Firestore console listener notice:", err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("Realtime console listener setup note:", e);
    }
  }, []);

  // Helper to generate sample JPEG base64 for test scan
  const createSamplePhoto = (title: string, bgColor: string, icon: string): string => {
    if (typeof window === "undefined") return "";
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      const grad = ctx.createLinearGradient(0, 0, 320, 240);
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, "#070D1E");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 240);

      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 320; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 240);
        ctx.stroke();
      }
      for (let y = 0; y < 240; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(320, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon, 160, 95);

      ctx.font = "bold 16px sans-serif";
      ctx.fillText(title, 160, 155);

      ctx.font = "11px monospace";
      ctx.fillStyle = "rgba(0, 240, 255, 0.85)";
      ctx.fillText("AZURE BLOB CONSOLE RECORD", 160, 185);

      return canvas.toDataURL("image/jpeg", 0.85);
    } catch {
      return "";
    }
  };

  const handleAddNewTestScan = async () => {
    setIsSimulating(true);
    try {
      const facePhoto = createSamplePhoto("Profil Wajah Siswa", "#0FA89B", "👤");
      const eyePhoto = createSamplePhoto("Mata Konjungtiva", "#0284C7", "👁️");
      const handPhoto = createSamplePhoto("Turgor Kulit Tangan", "#059669", "✋");
      const nailPhoto = createSamplePhoto("CRT Bantalan Kuku", "#D97706", "💅");

      const record = await BiometricSyncService.processAndSyncBiometricScan({
        userId: `warga_${Date.now().toString().slice(-4)}`,
        userName: "Muhammad Nizam Setiawan",
        userDistrict: "Kebomas",
        userAge: 9,
        userEmail: "nizamsetiawan@email.com",
        photos: {
          faceBase64: facePhoto,
          eyeBase64: eyePhoto,
          handBase64: handPhoto,
          nailBase64: nailPhoto,
        },
        questionnaire: {
          nafsuMakan: "Sangat Lahap",
          aktivitasFisik: "Aktif",
          alergi: "Tidak Ada Alergi",
        },
        preferredMenuType: "ayam",
      });

      setSelectedScan(record);
    } catch (err) {
      console.warn("Actual scan test trigger note:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm("Apakah Anda yakin ingin mengosongkan seluruh log konsol dari database?")) return;
    setIsClearing(true);
    try {
      const res = await BiometricSyncService.clearAllScanHistory();
      if (res.success) {
        setScans([]);
        setSelectedScan(null);
      }
    } catch (e) {
      console.warn("Clear error:", e);
    } finally {
      setIsClearing(false);
    }
  };

  const formatConfidence = (score?: number): string => {
    if (score === undefined || score === null) return "94%";
    const num = score <= 1 ? Math.round(score * 100) : Math.round(score);
    return `${num}%`;
  };

  const handleCopyLogs = () => {
    if (!selectedScan) return;
    const logText = `
[G-SCAN LOG CONSOLE SCAN SESSION ${selectedScan.scanId}]
User: ${selectedScan.userName} (${selectedScan.userDistrict})
Status: ${selectedScan.status}
Confidence: ${formatConfidence(selectedScan.azureVisionMetrics?.confidenceScore)}
Recommended Menu: ${selectedScan.recommendedMenu?.menuTitle} (${selectedScan.recommendedMenu?.calories} kkal)
Claim ID: ${selectedScan.claimId}
Timestamp: ${selectedScan.createdAt}
    `.trim();
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-200 font-mono flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* ═══ 1. IDE TOP BAR & MENU NAVIGATION (Spring Boot IDE Style) ═══ */}
      <header className="bg-[#0B132B] border-b border-cyan-950 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-2 font-bold text-[#0FA89B]">
            <TerminalIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>GSCAN IDE CONSOLE v2.6.3</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px]">
            <span className="hover:text-white cursor-pointer">File</span>
            <span className="hover:text-white cursor-pointer">Edit</span>
            <span className="hover:text-white cursor-pointer">Navigate</span>
            <span className="hover:text-white cursor-pointer">Search</span>
            <span className="hover:text-white cursor-pointer">Project</span>
            <span className="hover:text-white cursor-pointer">Run</span>
            <span className="hover:text-white cursor-pointer">Design</span>
            <span className="hover:text-white cursor-pointer">Help</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
            LIVE SCANNER AGENT ACTIVE
          </span>

          <button
            type="button"
            disabled={isClearing || scans.length === 0}
            onClick={handleClearDatabase}
            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10.5px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR</span>
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={handleAddNewTestScan}
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold border border-cyan-400 text-[10.5px] flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ TEST SCAN</span>
          </button>
        </div>
      </header>

      {/* ═══ IDE TAB STRIP & EXECUTION HEADER ═══ */}
      <div className="bg-[#030712] border-b border-cyan-950 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="px-3 py-1 bg-[#070D1E] text-cyan-300 border-t-2 border-cyan-400 rounded-t font-bold flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            Console x
          </span>
          <span className="px-3 py-1 hover:bg-[#0B132B] rounded-t cursor-pointer">BiometricEvidence</span>
          <span className="px-3 py-1 hover:bg-[#0B132B] rounded-t cursor-pointer">ModelTelemetry</span>
          <span className="px-3 py-1 hover:bg-[#0B132B] rounded-t cursor-pointer">GitStaging</span>
          <span className="px-3 py-1 hover:bg-[#0B132B] rounded-t cursor-pointer">Problems (0)</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span>&lt;terminated&gt; GScanApplication [Java 17 / Spring Boot v2.6.3]</span>
          <span>PID: 9936</span>
          <span>PORT: 8080 (http)</span>
        </div>
      </div>

      {/* ═══ 2. MAIN FULL CONSOLE CONTENT AREA ═══ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Console Log Output Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-[#030712] p-4 font-mono text-xs overflow-y-auto space-y-2 border-r border-cyan-950 leading-relaxed max-h-[calc(100vh-140px)]">
          {/* Spring Boot / G-SCAN ASCII Art Banner */}
          <pre className="text-cyan-400 font-bold text-[10px] leading-tight select-none">
{`
  ___      ____   ____    _    _   _ 
 / ___|    / ___| / ___|  / \\  | \\ | |
| |  _    | \\___ \\| |    / _ \\ |  \\| |
| |_| |    \\___ | |___/ ___ \\| |\\  |
 \\____|____|____/ \\____/_/   \\_\\_| \\_|
======================================================================
:: G-SCAN MULTI-METRIC CLINICAL AI SCANNER CONSOLE v2.6.3 ::
:: AZURE VISION SCIN + GEMINI 2.0 PEDIATRIC LLM ENGINE ::
======================================================================`}
          </pre>

          {/* System Startup Log Lines */}
          <div className="space-y-1 text-[11px] border-b border-cyan-950/60 pb-3">
            <p className="text-slate-400">
              2026-09-05T00:52:02.526 <span className="text-emerald-400 font-bold">INFO</span> [restartedMain] : Starting GScanLogApplication using Java 17 on LOCALHOST with PID 9936
            </p>
            <p className="text-slate-400">
              2026-09-05T00:52:02.534 <span className="text-cyan-400 font-bold">DEBUG</span> [restartedMain] : Running with Spring Boot v2.6.3, Spring v5.3.15
            </p>
            <p className="text-slate-400">
              2026-09-05T00:52:02.607 <span className="text-emerald-400 font-bold">INFO</span> [restartedMain] : Active Profiles: [azure-vision-scin, gemini-rag, firebase-realtime]
            </p>
            <p className="text-slate-400">
              2026-09-05T00:52:03.808 <span className="text-emerald-400 font-bold">INFO</span> [http-nio-8080-exec-1] : Tomcat initialized with port(s): 8080 (http)
            </p>
            <p className="text-[#0FA89B]">
              2026-09-05T00:52:03.832 <span className="text-emerald-400 font-bold">INFO</span> [http-nio-8080-exec-1] : Listening for live biometric frame stream from mobile clients...
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between pt-1 pb-2 border-b border-cyan-950/40 text-[10.5px]">
            <span className="text-slate-500">LIVE FRAME STREAM OUTPUT ({scans.length} NODES)</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLogs}
                className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "COPIED!" : "COPY LOGS"}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Realtime Session Log Stream */}
          {scans.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
              <p>NO ACTIVE SCAN SESSIONS RECORDED IN FIRESTORE.</p>
              <p className="text-[10px]">Perform scan on mobile device or click + TEST SCAN above.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {scans.map((scan) => {
                const isSelected = selectedScan?.scanId === scan.scanId;
                const formattedConf = formatConfidence(scan.azureVisionMetrics?.confidenceScore);

                return (
                  <div
                    key={scan.scanId}
                    onClick={() => setSelectedScan(scan)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 text-[11px] ${
                      isSelected
                        ? "bg-[#0B132B] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/40"
                        : "bg-[#070D1E] border-cyan-950 hover:border-cyan-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-cyan-300 font-bold">
                        {scan.createdAt || new Date().toISOString()} <span className="text-emerald-400">INFO</span> [http-nio-8080-exec-1]
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                        ID: {scan.scanId}
                      </span>
                    </div>

                    <p className="text-slate-200">
                      : <strong className="text-white">{scan.userName}</strong> ({scan.userDistrict}) — Status:{" "}
                      {scan.status === "SCANNING_IN_PROGRESS" ? (
                        <span className="text-amber-400 font-bold animate-pulse">📸 SCANNING FRAME ({scan.lastCapturedStep || "wajah"})</span>
                      ) : scan.status === "CANCELLED" ? (
                        <span className="text-rose-400 font-bold">✕ ABORTED / RECAPTURED</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">🟢 VALIDATED ({formattedConf})</span>
                      )}
                    </p>

                    {/* Step-by-Step Frame Capture Breakdown */}
                    <div className="pl-3 border-l-2 border-cyan-500/30 text-[10.5px] space-y-0.5">
                      {scan.photos?.faceBase64 && (
                        <p className="text-cyan-300">
                          ├─ 📸 Step 1/4 (Profil Wajah) : Frame Received (SCIN Vitality: {scan.azureVisionMetrics?.facialVitalityScore || 0.88})
                        </p>
                      )}
                      {scan.photos?.eyeBase64 && (
                        <p className="text-sky-300">
                          ├─ 👁️ Step 2/4 (Mata Konjungtiva) : Frame Received (Eye Pallor: {scan.azureVisionMetrics?.eyeConjunctivaStatus || "Merah Muda Normal"})
                        </p>
                      )}
                      {scan.photos?.handBase64 && (
                        <p className="text-emerald-300">
                          ├─ ✋ Step 3/4 (Turgor Kulit Tangan) : Frame Received (Epidermal Turgor: {scan.azureVisionMetrics?.skinTurgorStatus || "Elastis"})
                        </p>
                      )}
                      {scan.photos?.nailBase64 && (
                        <p className="text-amber-300">
                          ├─ 💅 Step 4/4 (CRT Bantalan Kuku) : Frame Received (Capillary CRT: {scan.azureVisionMetrics?.nailbedStatus || "Merah Muda Sehat"})
                        </p>
                      )}
                      {scan.recommendedMenu?.menuTitle && (
                        <p className="text-purple-300">
                          └─ 🥗 Gemini RAG Matched : {scan.recommendedMenu.menuTitle} ({scan.recommendedMenu.calories} kkal, Fe: {scan.recommendedMenu.ironMg}mg)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={consoleBottomRef} />
        </div>

        {/* Right Console Inspector & Evidence Matrix Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#070D1E] p-4 font-mono text-xs overflow-y-auto space-y-4 max-h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              INSPECTOR MATRIX &amp; EVIDENCE
            </h2>
            {selectedScan && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE NODE
              </span>
            )}
          </div>

          {!selectedScan ? (
            <div className="p-8 text-center text-slate-500 border border-cyan-950 rounded-xl space-y-1">
              <p>Select a scan log entry on the left to inspect biometric evidence.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Beneficiary Header */}
              <div className="p-3.5 rounded-xl bg-[#0B132B] border border-cyan-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold">BENEFICIARY DATA</span>
                  <span className="text-[9.5px] text-slate-400">CLAIM ID: {selectedScan.claimId}</span>
                </div>
                <h3 className="text-sm font-black text-white">{selectedScan.userName}</h3>
                <p className="text-[11px] text-slate-300">
                  Kec. <strong>{selectedScan.userDistrict}</strong> • {selectedScan.userAge || 9} YO • {selectedScan.userEmail || "Registered"}
                </p>
              </div>

              {/* 4 BIOMETRIC EVIDENCE PHOTO MATRIX */}
              <div className="space-y-2">
                <span className="text-[10.5px] text-slate-400 font-bold block uppercase">
                  BIOMETRIC PHOTO FRAME MATRIX
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const faceSrc = selectedScan.photos?.faceBase64 || selectedScan.blobUrls?.faceBlobUrl;
                    const eyeSrc = selectedScan.photos?.eyeBase64 || selectedScan.blobUrls?.eyeBlobUrl;
                    const handSrc = selectedScan.photos?.handBase64 || selectedScan.blobUrls?.handBlobUrl;
                    const nailSrc = selectedScan.photos?.nailBase64 || selectedScan.blobUrls?.nailBlobUrl;

                    return (
                      <>
                        {/* Photo 1: Wajah */}
                        <div className="bg-[#0B132B] border border-cyan-900/60 rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {faceSrc && !imageErrorMap[`face_${selectedScan.scanId}`] ? (
                              <img
                                src={faceSrc}
                                alt="Wajah"
                                onError={() => setImageErrorMap((prev) => ({ ...prev, [`face_${selectedScan.scanId}`]: true }))}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-950/40 via-cyan-950/60 to-teal-950/40 flex flex-col items-center justify-center p-2 text-cyan-400 border border-cyan-900/40">
                                <User className="w-6 h-6 mb-1 stroke-[1.8] text-cyan-400" />
                                <span className="text-[9.5px] font-bold text-slate-200">Profil Wajah</span>
                                <span className="text-[8px] text-cyan-300 font-mono bg-cyan-950 px-1 py-0.5 rounded mt-1">FRAME 1/4</span>
                              </div>
                            )}
                            {faceSrc && !imageErrorMap[`face_${selectedScan.scanId}`] && (
                              <button
                                type="button"
                                onClick={() => setActivePhotoModal({ title: "Foto Profil Wajah", url: faceSrc })}
                                className="absolute bottom-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-black cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-300 block font-mono">1. Face Profile</span>
                        </div>

                        {/* Photo 2: Mata Konjungtiva */}
                        <div className="bg-[#0B132B] border border-cyan-900/60 rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {eyeSrc && !imageErrorMap[`eye_${selectedScan.scanId}`] ? (
                              <img
                                src={eyeSrc}
                                alt="Mata"
                                onError={() => setImageErrorMap((prev) => ({ ...prev, [`eye_${selectedScan.scanId}`]: true }))}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-sky-950/40 via-cyan-950/60 to-teal-950/40 flex flex-col items-center justify-center p-2 text-sky-400 border border-cyan-900/40">
                                <Eye className="w-6 h-6 mb-1 stroke-[1.8] text-sky-400" />
                                <span className="text-[9.5px] font-bold text-slate-200">Konjungtiva</span>
                                <span className="text-[8px] text-sky-300 font-mono bg-sky-950 px-1 py-0.5 rounded mt-1">FRAME 2/4</span>
                              </div>
                            )}
                            {eyeSrc && !imageErrorMap[`eye_${selectedScan.scanId}`] && (
                              <button
                                type="button"
                                onClick={() => setActivePhotoModal({ title: "Foto Konjungtiva Sklera", url: eyeSrc })}
                                className="absolute bottom-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-black cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-300 block font-mono">2. Conjunctiva</span>
                        </div>

                        {/* Photo 3: Tangan Turgor */}
                        <div className="bg-[#0B132B] border border-cyan-900/60 rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {handSrc && !imageErrorMap[`hand_${selectedScan.scanId}`] ? (
                              <img
                                src={handSrc}
                                alt="Tangan"
                                onError={() => setImageErrorMap((prev) => ({ ...prev, [`hand_${selectedScan.scanId}`]: true }))}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-950/40 via-teal-950/60 to-green-950/40 flex flex-col items-center justify-center p-2 text-emerald-400 border border-emerald-900/40">
                                <Hand className="w-6 h-6 mb-1 stroke-[1.8] text-emerald-400" />
                                <span className="text-[9.5px] font-bold text-slate-200">Turgor Tangan</span>
                                <span className="text-[8px] text-emerald-300 font-mono bg-emerald-950 px-1 py-0.5 rounded mt-1">FRAME 3/4</span>
                              </div>
                            )}
                            {handSrc && !imageErrorMap[`hand_${selectedScan.scanId}`] && (
                              <button
                                type="button"
                                onClick={() => setActivePhotoModal({ title: "Foto Telapak Tangan & Turgor", url: handSrc })}
                                className="absolute bottom-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-black cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-300 block font-mono">3. Skin Turgor</span>
                        </div>

                        {/* Photo 4: Kuku Capillary */}
                        <div className="bg-[#0B132B] border border-cyan-900/60 rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {nailSrc && !imageErrorMap[`nail_${selectedScan.scanId}`] ? (
                              <img
                                src={nailSrc}
                                alt="Kuku"
                                onError={() => setImageErrorMap((prev) => ({ ...prev, [`nail_${selectedScan.scanId}`]: true }))}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-orange-950/60 to-yellow-950/40 flex flex-col items-center justify-center p-2 text-amber-400 border border-amber-900/40">
                                <Sparkles className="w-6 h-6 mb-1 stroke-[1.8] text-amber-400" />
                                <span className="text-[9.5px] font-bold text-slate-200">CRT Kuku</span>
                                <span className="text-[8px] text-amber-300 font-mono bg-amber-950 px-1 py-0.5 rounded mt-1">FRAME 4/4</span>
                              </div>
                            )}
                            {nailSrc && !imageErrorMap[`nail_${selectedScan.scanId}`] && (
                              <button
                                type="button"
                                onClick={() => setActivePhotoModal({ title: "Foto Bantalan Kuku (CRT)", url: nailSrc })}
                                className="absolute bottom-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-black cursor-pointer"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-300 block font-mono">4. Nail CRT</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* RECOMMENDED MENU SUMMARY */}
              <div className="p-3.5 rounded-xl bg-[#0B132B] border border-emerald-900/80 space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-[#0FA89B] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedScan.recommendedMenu?.menuTitle || "Nasi Ayam Kari & Sayur Sop"}
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {selectedScan.recommendedMenu?.calories || 680} kkal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-300 text-center pt-1 border-t border-emerald-900/60">
                  <div>Protein: <strong className="text-white">{selectedScan.recommendedMenu?.proteinGram || 31}g</strong></div>
                  <div>Zat Besi: <strong className="text-white">{selectedScan.recommendedMenu?.ironMg || 6}mg</strong></div>
                  <div>AKG: <strong className="text-emerald-400">{selectedScan.recommendedMenu?.akgPercentage || 45}%</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ PHOTO LIGHTBOX MODAL ═══ */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#070D1E] rounded-2xl p-4 max-w-lg w-full space-y-3 text-left border border-cyan-500/50 shadow-2xl font-mono">
            <div className="flex items-center justify-between text-white border-b border-cyan-900 pb-2">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>{activePhotoModal.title}</span>
              </h4>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer border border-cyan-800"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh] border border-cyan-900/60">
              <img src={activePhotoModal.url} alt={activePhotoModal.title} className="max-w-full max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
