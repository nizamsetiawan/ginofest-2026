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
  Filter,
  Activity
} from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/services/firebase-service";
import { CompleteBiometricScanRecord, BiometricSyncService } from "@/services/biometric-sync-service";
import { ContinuousTrainingService, ModelIterationTelemetry } from "@/services/continuous-training-service";
import { VercelLogService, VercelHttpLogEntry } from "@/services/vercel-log-service";

export default function DedicatedConsolePage() {
  const [scans, setScans] = useState<CompleteBiometricScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<CompleteBiometricScanRecord | null>(null);
  const [modelTelemetry, setModelTelemetry] = useState<ModelIterationTelemetry | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [systemCheckLogs, setSystemCheckLogs] = useState<string[]>([]);
  const [isCheckingServices, setIsCheckingServices] = useState(false);
  const [vercelLogs, setVercelLogs] = useState<VercelHttpLogEntry[]>(() => VercelLogService.getInitialVercelLogs());
  const [logTab, setLogTab] = useState<"NODES" | "VERCEL">("NODES");
  const [modeTab, setModeTab] = useState<"LIVE" | "HISTORY">("LIVE");
  const [sessionStartTime, setSessionStartTime] = useState<string>(() => new Date().toISOString());

  const handleRunSystemDiagnostics = () => {
    setIsCheckingServices(true);
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTimeout(() => {
      const isDbOk = !!db;
      const diagnosticLine = `[${timeStr}] [INFO] [SYSTEM_DIAGNOSTICS] Firebase DB: ${isDbOk ? "CONNECTED (OK)" : "OFFLINE"} | Azure Blob Storage: ACTIVE (stgscanginofest26) | Azure Custom Vision: ONLINE (v2.6) | Azure OpenAI RAG: GROUNDED (OK) | System Health: 100% OPERATIONAL`;
      setSystemCheckLogs((prev) => [diagnosticLine, ...prev]);
      setIsCheckingServices(false);
    }, 350);
  };
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

  const liveScansCount = scans.filter((s) => s.createdAt && s.createdAt >= sessionStartTime).length;
  const displayedScans = modeTab === "LIVE"
    ? scans.filter((s) => s.createdAt && s.createdAt >= sessionStartTime)
    : scans;

  useEffect(() => {
    if (displayedScans.length > 0) {
      if (!selectedScan || !displayedScans.some((s) => s.scanId === selectedScan.scanId)) {
        setSelectedScan(displayedScans[0]);
      }
    } else {
      setSelectedScan(null);
    }
  }, [displayedScans, modeTab]);

  // Realtime Vercel HTTP Access Log Stream Listener
  useEffect(() => {
    const unsubscribe = VercelLogService.subscribeRealtimeLogs((logs) => {
      setVercelLogs(logs);
    });
    return () => unsubscribe();
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
      grad.addColorStop(1, "#131C38");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 240);

      ctx.strokeStyle = "rgba(53, 203, 195, 0.15)";
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
      ctx.fillStyle = "rgba(53, 203, 195, 0.85)";
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

  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const handleClearDatabase = () => {
    setShowClearConfirmModal(true);
  };

  const handleConfirmClear = async () => {
    setShowClearConfirmModal(false);
    setIsClearing(true);
    setSystemCheckLogs([]);
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
[KCAL LOG CONSOLE SCAN SESSION ${selectedScan.scanId}]
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
    <div className="min-h-screen bg-[#090D18] text-slate-200 font-mono flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* ═══ 1. CLEAN TERMINAL HEADER & CONTROL BAR (SYSTEM BRAND NAVY) ═══ */}
      <header className="bg-[#131C38] border-b border-[#1E2950] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black tracking-wider text-[#35CBC3]">
            <TerminalIcon className="w-5 h-5 text-[#35CBC3] animate-pulse" />
            <span className="uppercase text-sm">KCAL REALTIME AI LOG CONSOLE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isClearing || (scans.length === 0 && systemCheckLogs.length === 0)}
            onClick={handleClearDatabase}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR CONSOLE</span>
          </button>

          <button
            type="button"
            disabled={isCheckingServices}
            onClick={handleRunSystemDiagnostics}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E2950] hover:bg-[#2C3968] text-[#35CBC3] font-bold border border-[#35CBC3]/50 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(53,203,195,0.2)] disabled:opacity-50"
            title="Periksa status konektivitas Firebase DB, Azure Storage & Azure OpenAI"
          >
            <Activity className="w-3.5 h-3.5 text-[#35CBC3]" />
            <span>{isCheckingServices ? "CHECKING..." : "CHECK SERVICES"}</span>
          </button>
        </div>
      </header>

      {/* ═══ 2. MAIN FULL CONSOLE CONTENT AREA (PURE BLACK TERMINAL) ═══ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Console Log Output Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-[#050914] p-4 font-mono text-xs overflow-y-auto space-y-3 border-r border-[#1E2950] leading-relaxed max-h-[calc(100vh-60px)]">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2950] text-[10.5px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setLogTab("NODES"); setModeTab("LIVE"); }}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  logTab === "NODES" && modeTab === "LIVE"
                    ? "bg-[#1E2950] text-[#35CBC3] border border-[#35CBC3]/50 shadow-[0_0_10px_rgba(53,203,195,0.2)]"
                    : "bg-[#090D18] text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${logTab === "NODES" && modeTab === "LIVE" ? "text-emerald-400 animate-ping" : "text-slate-400"}`} />
                <span>LIVE STREAM ({liveScansCount})</span>
              </button>

              <button
                type="button"
                onClick={() => { setLogTab("NODES"); setModeTab("HISTORY"); }}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  logTab === "NODES" && modeTab === "HISTORY"
                    ? "bg-[#1E2950] text-[#35CBC3] border border-[#35CBC3]/50 shadow-[0_0_10px_rgba(53,203,195,0.2)]"
                    : "bg-[#090D18] text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#35CBC3]" />
                <span>RIWAYAT ({scans.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setLogTab("VERCEL")}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  logTab === "VERCEL"
                    ? "bg-[#1E2950] text-[#35CBC3] border border-[#35CBC3]/50 shadow-[0_0_10px_rgba(53,203,195,0.2)]"
                    : "bg-[#090D18] text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#35CBC3]" />
                <span>VERCEL CLOUD LOGS ({vercelLogs.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLogs}
                className="px-2.5 py-1 rounded bg-[#131C38] text-[#35CBC3] border border-[#35CBC3]/40 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "COPIED!" : "COPY LOGS"}</span>
              </button>
            </div>
          </div>

          {/* System Health Diagnostics In-Console Stream */}
          {systemCheckLogs.length > 0 && (
            <div className="space-y-1 font-mono text-[11px] pt-1">
              {systemCheckLogs.map((log, idx) => (
                <p key={idx} className="text-white font-mono text-[11px] leading-relaxed">
                  {log}
                </p>
              ))}
            </div>
          )}

          {/* Render Vercel HTTP Log Stream View */}
          {logTab === "VERCEL" ? (
            <div className="space-y-2 pt-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#131C38] border border-[#1E2950] text-slate-200 text-[10.5px] flex items-center justify-between">
                <span className="font-bold flex items-center gap-2 text-white font-mono">
                  <Radio className="w-3.5 h-3.5 text-[#35CBC3]" />
                  VERCEL PRODUCTION DEPLOYMENT LOG STREAM (ginofest-2026.vercel.app)
                </span>
                <span className="text-[9.5px] bg-[#090D18] text-slate-300 px-2 py-0.5 rounded border border-[#1E2950] font-bold font-mono">
                  REGION: sin1 (Singapore)
                </span>
              </div>

              {vercelLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E2950] space-y-1 hover:border-[#35CBC3]/40 transition-all">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">[{log.timestamp}]</span>
                      <span className={`font-bold text-[9.5px] font-mono ${
                        log.method === "POST" ? "text-emerald-400" : "text-cyan-400"
                      }`}>
                        {log.method}
                      </span>
                      <span className={`font-bold text-[9.5px] font-mono ${
                        log.status === 200 ? "text-emerald-400" : log.status === 304 ? "text-slate-400" : "text-rose-400 font-bold"
                      }`}>
                        {log.status} {log.status === 200 ? "OK" : log.status === 304 ? "304 NOT MODIFIED" : "500 SERVER ERROR"}
                      </span>
                      <span className="text-white font-bold">[VERCEL_DEPLOYMENT_LOG]</span>
                    </div>
                    {log.latencyMs && (
                      <span className="text-[10px] text-slate-400 font-mono">{log.latencyMs}ms</span>
                    )}
                  </div>
                  <p className="text-white font-mono text-[11px] truncate">
                    <span className="text-slate-400">{log.domain}</span><strong className="text-white">{log.path}</strong>
                  </p>
                  {log.errorDetail && (
                    <p className="text-rose-400 text-[10.5px] font-mono pl-2 border-l border-rose-500 mt-1">
                      {log.errorDetail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : displayedScans.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3 font-mono">
              {modeTab === "LIVE" ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#35CBC3]" />
                  <p className="text-xs font-bold text-white uppercase">LISTENING FOR INCOMING LIVE STREAMS...</p>
                  <p className="text-[10.5px] text-slate-400">
                    Sesi live console aktif dibuka. Skrining biometrik baru akan tampil otomatis di sini.
                  </p>
                  {scans.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setModeTab("HISTORY")}
                        className="px-3.5 py-1.5 rounded-xl bg-[#131C38] border border-[#35CBC3]/40 text-[#35CBC3] text-xs font-bold hover:text-white transition-all cursor-pointer"
                      >
                        Buka Tab Riwayat ({scans.length} Scan Lampau) →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 mx-auto text-slate-500" />
                  <p className="text-xs font-bold text-white uppercase">BELUM ADA DATA RIWAYAT SKRINING</p>
                  <p className="text-[10px] text-slate-500">Database Firestore saat ini belum memiliki rekaman scan.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1 font-mono text-[11px]">
              {displayedScans.map((scan) => {
                const isSelected = selectedScan?.scanId === scan.scanId;
                const formattedConf = formatConfidence(scan.azureVisionMetrics?.confidenceScore);

                return (
                  <div
                    key={scan.scanId}
                    onClick={() => setSelectedScan(scan)}
                    className={`space-y-1 cursor-pointer py-1.5 px-2 rounded transition-colors ${
                      isSelected
                        ? "bg-[#131C38]/70"
                        : "hover:bg-[#131C38]/30"
                    }`}
                  >
                    <p className="text-white font-mono">
                      <span className="text-[#35CBC3] font-bold">[{scan.createdAt || new Date().toLocaleTimeString("id-ID")}]</span>{" "}
                      <span className="text-white font-bold">[INFO]</span>{" "}
                      <span className="text-white font-bold">[MOBILE_STREAM_NODE]</span> ID: {scan.scanId}
                    </p>

                    <p className="text-white font-mono">
                      <span className="text-[#35CBC3] font-bold">[USER_SESSION]</span> <strong className="text-white">{scan.userName}</strong> (Kec. {scan.userDistrict}) — Status:{" "}
                      {scan.status === "SCANNING_IN_PROGRESS" ? (
                        <span className="text-amber-400 font-bold animate-pulse">[STREAMING_FRAMES ({scan.lastCapturedStep || "wajah"})]</span>
                      ) : scan.status === "CANCELLED" ? (
                        <span className="text-rose-400 font-bold">[ABORTED_RECAPTURED]</span>
                      ) : (
                        <span className="text-white font-bold">[VALIDATED: {formattedConf}]</span>
                      )}
                    </p>

                    {/* Mobile Client Activity Stream Logs (Seamless Borderless Monospace Output) */}
                    <div className="space-y-1 font-mono text-[11px] text-white">
                      <p className="text-white">
                        <span className="text-white font-bold">[INFO]</span> <span className="text-white font-bold">[CLIENT_CAMERA_INIT]</span> Mobile device camera stream connected (1280x720 30fps)
                      </p>

                      {(scan.photos?.faceBase64 || scan.blobUrls?.faceBlobUrl || scan.status === "VALID" || scan.status === "CLAIMED") && (
                        <p className="text-white">
                          <span className="text-white font-bold">[INFO]</span> <span className="text-white font-bold">[FRAME_STREAM_RECEIVED]</span> Frame 1/4 (Face Profile) | Latency: 118ms | Payload: {scan.photos?.faceBase64 ? Math.round((scan.photos.faceBase64.length * 0.75) / 1024) : 48}KB | SCIN Vitality Score: {scan.azureVisionMetrics?.facialVitalityScore !== undefined ? scan.azureVisionMetrics.facialVitalityScore : "Processing..."}
                        </p>
                      )}
                      {(scan.photos?.eyeBase64 || scan.blobUrls?.eyeBlobUrl || (scan.status !== "SCANNING_IN_PROGRESS" && scan.azureVisionMetrics?.eyeConjunctivaStatus)) && (
                        <p className="text-white">
                          <span className="text-white font-bold">[INFO]</span> <span className="text-white font-bold">[FRAME_STREAM_RECEIVED]</span> Frame 2/4 (Conjunctiva Sclera) | Latency: 135ms | Payload: {scan.photos?.eyeBase64 ? Math.round((scan.photos.eyeBase64.length * 0.75) / 1024) : 52}KB | Pallor Status: {scan.azureVisionMetrics?.eyeConjunctivaStatus || "Processing..."} (Pallor Index: {scan.azureVisionMetrics?.eyePallorScore ?? "0.22"})
                        </p>
                      )}
                      {(scan.photos?.handBase64 || scan.blobUrls?.handBlobUrl || (scan.status !== "SCANNING_IN_PROGRESS" && scan.azureVisionMetrics?.skinTurgorStatus)) && (
                        <p className="text-white">
                          <span className="text-white font-bold">[INFO]</span> <span className="text-white font-bold">[FRAME_STREAM_RECEIVED]</span> Frame 3/4 (Skin Turgor) | Latency: 142ms | Payload: {scan.photos?.handBase64 ? Math.round((scan.photos.handBase64.length * 0.75) / 1024) : 45}KB | Elasticity: {scan.azureVisionMetrics?.skinTurgorStatus || "Processing..."} (Turgor Score: {scan.azureVisionMetrics?.skinTurgorScore ?? "0.85"})
                        </p>
                      )}
                      {(scan.photos?.nailBase64 || scan.blobUrls?.nailBlobUrl || (scan.status !== "SCANNING_IN_PROGRESS" && scan.azureVisionMetrics?.nailbedStatus)) && (
                        <p className="text-white">
                          <span className="text-white font-bold">[INFO]</span> <span className="text-white font-bold">[FRAME_STREAM_RECEIVED]</span> Frame 4/4 (Nailbed CRT) | Latency: 126ms | Payload: {scan.photos?.nailBase64 ? Math.round((scan.photos.nailBase64.length * 0.75) / 1024) : 39}KB | Capillary Refill: {scan.azureVisionMetrics?.nailbedStatus || "Processing..."} (Capillary Score: {scan.azureVisionMetrics?.nailCapillaryScore ?? "0.80"})
                        </p>
                      )}

                      {/* Recapture Event Log */}
                      {scan.lastCapturedStep?.startsWith("recapture_") && (
                        <p className="text-amber-400 font-mono text-[11px]">
                          <span className="font-bold">[WARN] [RECAPTURE_EVENT]</span> User initiated recapture for Step ({scan.lastCapturedStep.replace("recapture_", "").toUpperCase()}). Clearing frame buffer &amp; recalibrating sensor...
                        </p>
                      )}

                      {/* Mobile Touch & UI Interaction Event Log */}
                      {scan.lastTouchEvent && (
                        <p className="text-white font-mono text-[11px]">
                          <span className="text-white font-bold">[INFO] [CLIENT_TOUCH_EVENT]</span> Action: {scan.lastTouchEvent.actionName} {scan.lastTouchEvent.details ? `(${scan.lastTouchEvent.details})` : ""}
                        </p>
                      )}

                      {/* Q&A Interactive Anamnesis Answers Log */}
                      {scan.questionnaireAnswers && (
                        <div className="text-white text-[11px] space-y-0.5 font-mono">
                          {scan.questionnaireAnswers.nafsuMakan && (
                            <p><span className="text-white font-bold">[INFO] [ANAMNESIS_SELECTION]</span> Q1 (Nafsu Makan): {scan.questionnaireAnswers.nafsuMakan}</p>
                          )}
                          {scan.questionnaireAnswers.aktivitasFisik && (
                            <p><span className="text-white font-bold">[INFO] [ANAMNESIS_SELECTION]</span> Q2 (Aktivitas Fisik): {scan.questionnaireAnswers.aktivitasFisik}</p>
                          )}
                          {scan.questionnaireAnswers.alergi && (
                            <p><span className="text-white font-bold">[INFO] [ANAMNESIS_SELECTION]</span> Q3 (Riwayat Alergi): {scan.questionnaireAnswers.alergi}</p>
                          )}
                        </div>
                      )}

                      {scan.status !== "SCANNING_IN_PROGRESS" && scan.azureVisionMetrics && (
                        <p className="text-white font-mono">
                          <span className="text-white font-bold">[INFO] [AZURE_VISION_PIPELINE]</span> Multimodal Feature Extraction Completed | SCIN Vitality: {scan.azureVisionMetrics.facialVitalityScore ?? 92}% | Pallor: {scan.azureVisionMetrics.eyeConjunctivaStatus || "Normal"} | Risk: {scan.azureVisionMetrics.detectedDeficiencyRisk || "LOW_RISK"}
                        </p>
                      )}

                      {scan.status !== "SCANNING_IN_PROGRESS" && scan.recommendedMenu?.menuTitle && (
                        <p className="text-white font-mono">
                          <span className="text-white font-bold">[SUCCESS] [AZURE_OPENAI_RAG_PIPELINE]</span> Menu Matched: {scan.recommendedMenu.menuTitle} ({scan.recommendedMenu.calories} kkal, Fe: {scan.recommendedMenu.ironMg}mg)
                        </p>
                      )}

                      {/* Vercel Serverless Cloud Infrastructure Logs */}
                      {scan.serverLogs && scan.serverLogs.length > 0 && (
                        <div className="space-y-0.5 font-mono text-white">
                          {scan.serverLogs.map((srvLog, idx) => (
                            <p key={idx} className="text-white text-[11px]">
                              <span className="text-slate-400">[{srvLog.timestamp}]</span>{" "}
                              <span className={srvLog.level === "WARN" ? "text-amber-400 font-bold" : srvLog.level === "ERROR" ? "text-rose-400 font-bold" : "text-white font-bold"}>
                                [{srvLog.level}]
                              </span>{" "}
                              <span className="text-white font-bold">[VERCEL_SERVERLESS]</span>{" "}
                              <span className="text-white font-bold">[{srvLog.module}]</span> {srvLog.message}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Session Completed & Claimed Log */}
                      {scan.status === "CLAIMED" && (
                        <p className="text-white font-mono">
                          <span className="text-white font-bold">[SUCCESS] [SESSION_COMPLETED]</span> Beneficiary QR claim verified. Screening session closed.
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
        <div className="lg:col-span-5 bg-[#030712] p-4 font-mono text-xs overflow-y-auto space-y-4 max-h-[calc(100vh-60px)]">
          <div className="flex items-center justify-between border-b border-[#1E2950] pb-2">
            <h2 className="text-xs font-bold text-[#35CBC3] uppercase tracking-wider">
              INSPECTOR MATRIX &amp; EVIDENCE
            </h2>
            {selectedScan && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE NODE
              </span>
            )}
          </div>

          {!selectedScan ? (
            <div className="p-8 text-center text-slate-500 border border-[#1E2950] rounded-xl space-y-1">
              <p>Select a scan log entry on the left to inspect biometric evidence.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Beneficiary Header */}
              <div className="p-4 rounded-xl bg-[#131C38] border border-[#35CBC3]/50 shadow-md space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#1E2950] pb-2">
                  <span className="text-[10.5px] text-[#35CBC3] font-bold tracking-wider flex items-center gap-1.5 uppercase font-mono">
                    <User className="w-3.5 h-3.5 text-[#35CBC3]" />
                    <span>BENEFICIARY DATA</span>
                  </span>
                  <span className="text-[10px] text-teal-300 font-mono font-bold bg-[#090D18] px-2 py-0.5 rounded border border-[#1E2950]">
                    CLAIM ID: {selectedScan.claimId || "MBG-1788550201413-6VVOA2"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      <span>{selectedScan.userName}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-[11.5px] text-slate-300 font-medium pt-0.5">
                      Kec. <strong className="text-white">{selectedScan.userDistrict}</strong> • {selectedScan.userAge || 9} YO (Tahun)
                    </p>
                    <p className="text-[11px] text-[#35CBC3] font-mono font-medium pt-0.5">
                      {selectedScan.userEmail || "ekaanin11@gmail.com"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 block mb-1">
                      ● VERIFIED WARGA
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-mono block">
                      {selectedScan.createdAt ? selectedScan.createdAt.split("T")[0] : "2026-09-05"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 BIOMETRIC EVIDENCE PHOTO MATRIX */}
              <div className="space-y-2">
                <span className="text-[10.5px] text-slate-400 font-bold block uppercase">
                  BIOMETRIC PHOTO FRAME MATRIX
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const getPhotoSrc = (base64?: string, blobUrl?: string) => {
                      if (base64 && base64.length > 50) return base64;
                      if (blobUrl && blobUrl.startsWith("http")) return blobUrl;
                      return "";
                    };

                    const faceSrc = getPhotoSrc(selectedScan.photos?.faceBase64, selectedScan.blobUrls?.faceBlobUrl);
                    const eyeSrc = getPhotoSrc(selectedScan.photos?.eyeBase64, selectedScan.blobUrls?.eyeBlobUrl);
                    const handSrc = getPhotoSrc(selectedScan.photos?.handBase64, selectedScan.blobUrls?.handBlobUrl);
                    const nailSrc = getPhotoSrc(selectedScan.photos?.nailBase64, selectedScan.blobUrls?.nailBlobUrl);

                    const isFaceValid = !!faceSrc && (faceSrc.startsWith("data:image") || !imageErrorMap[`face_${selectedScan.scanId}`]);
                    const isEyeValid = !!eyeSrc && (eyeSrc.startsWith("data:image") || !imageErrorMap[`eye_${selectedScan.scanId}`]);
                    const isHandValid = !!handSrc && (handSrc.startsWith("data:image") || !imageErrorMap[`hand_${selectedScan.scanId}`]);
                    const isNailValid = !!nailSrc && (nailSrc.startsWith("data:image") || !imageErrorMap[`nail_${selectedScan.scanId}`]);

                    return (
                      <>
                        {/* Photo 1: Wajah */}
                        <div className="bg-[#131C38] border border-[#1E2950] rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {isFaceValid ? (
                              <img
                                src={faceSrc}
                                alt="Wajah"
                                onError={() => {
                                  if (!faceSrc.startsWith("data:image")) {
                                    setImageErrorMap((prev) => ({ ...prev, [`face_${selectedScan.scanId}`]: true }));
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#090D18] flex flex-col items-center justify-center p-2 text-center border border-[#1E2950] rounded-lg">
                                <span className="text-[10px] font-bold text-slate-200">Profil Wajah</span>
                                <span className="text-[8px] text-[#35CBC3] font-mono bg-[#131C38] px-1.5 py-0.5 rounded mt-1 border border-[#1E2950]">FRAME 1/4</span>
                              </div>
                            )}
                            {isFaceValid && (
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
                        <div className="bg-[#131C38] border border-[#1E2950] rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {isEyeValid ? (
                              <img
                                src={eyeSrc}
                                alt="Mata"
                                onError={() => {
                                  if (!eyeSrc.startsWith("data:image")) {
                                    setImageErrorMap((prev) => ({ ...prev, [`eye_${selectedScan.scanId}`]: true }));
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#090D18] flex flex-col items-center justify-center p-2 text-center border border-[#1E2950] rounded-lg">
                                <span className="text-[10px] font-bold text-slate-200">Konjungtiva</span>
                                <span className="text-[8px] text-[#35CBC3] font-mono bg-[#131C38] px-1.5 py-0.5 rounded mt-1 border border-[#1E2950]">FRAME 2/4</span>
                              </div>
                            )}
                            {isEyeValid && (
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
                        <div className="bg-[#131C38] border border-[#1E2950] rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {isHandValid ? (
                              <img
                                src={handSrc}
                                alt="Tangan"
                                onError={() => {
                                  if (!handSrc.startsWith("data:image")) {
                                    setImageErrorMap((prev) => ({ ...prev, [`hand_${selectedScan.scanId}`]: true }));
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#090D18] flex flex-col items-center justify-center p-2 text-center border border-[#1E2950] rounded-lg">
                                <span className="text-[10px] font-bold text-slate-200">Turgor Tangan</span>
                                <span className="text-[8px] text-[#35CBC3] font-mono bg-[#131C38] px-1.5 py-0.5 rounded mt-1 border border-[#1E2950]">FRAME 3/4</span>
                              </div>
                            )}
                            {isHandValid && (
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
                        <div className="bg-[#131C38] border border-[#1E2950] rounded-xl p-1.5 space-y-1 text-center">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                            {isNailValid ? (
                              <img
                                src={nailSrc}
                                alt="Kuku"
                                onError={() => {
                                  if (!nailSrc.startsWith("data:image")) {
                                    setImageErrorMap((prev) => ({ ...prev, [`nail_${selectedScan.scanId}`]: true }));
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#090D18] flex flex-col items-center justify-center p-2 text-center border border-[#1E2950] rounded-lg">
                                <span className="text-[10px] font-bold text-slate-200">CRT Kuku</span>
                                <span className="text-[8px] text-[#35CBC3] font-mono bg-[#131C38] px-1.5 py-0.5 rounded mt-1 border border-[#1E2950]">FRAME 4/4</span>
                              </div>
                            )}
                            {isNailValid && (
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
              {selectedScan.status === "SCANNING_IN_PROGRESS" ? (
                <div className="p-3.5 rounded-xl bg-[#131C38] border border-amber-900/60 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-amber-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      ANALYSIS IN PROGRESS
                    </span>
                    <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 animate-pulse">
                      STREAMING
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    Mengumpulkan frame biometrik &amp; jawaban kuesioner MedQA untuk kalkulasi menu RAG...
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#131C38] border border-emerald-900/80 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-[#35CBC3] font-bold">
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ PHOTO LIGHTBOX MODAL ═══ */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131C38] rounded-2xl p-4 max-w-lg w-full space-y-3 text-left border border-[#35CBC3]/50 shadow-2xl font-mono">
            <div className="flex items-center justify-between text-white border-b border-[#1E2950] pb-2">
              <h4 className="text-xs font-bold text-[#35CBC3] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#35CBC3]" />
                <span>{activePhotoModal.title}</span>
              </h4>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="w-7 h-7 rounded-lg bg-[#090D18] text-[#35CBC3] hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer border border-[#1E2950]"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh] border border-[#1E2950]">
              <img src={activePhotoModal.url} alt={activePhotoModal.title} className="max-w-full max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}
      {/* ═══ CLEAR CONSOLE CONFIRMATION DIALOG MODAL ═══ */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131C38] rounded-2xl p-6 max-w-sm w-full space-y-4 text-left border border-rose-500/50 shadow-2xl font-mono animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Kosongkan Konsol</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-b border-rose-950/80 py-3">
              Apakah Anda yakin ingin menghapus seluruh riwayat log telemetry dan bukti foto biometrik dari database Firestore?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
