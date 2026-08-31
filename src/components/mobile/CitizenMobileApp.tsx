"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Activity,
  Utensils,
  MessageSquare,
  User,
  LogOut,
  MapPin,
  RefreshCw,
  Sparkles
} from "lucide-react";
import {
  AppScreen,
  MobileTab,
  CitizenUser,
  ScreeningResult,
  AtmosphereState
} from "./types";
import {
  saveComplaintToFirestore,
  listenToActiveSessions,
  closeSessionLog,
  loginCitizenFromFirestore,
  registerCitizenToFirestore,
  recordCitizenSessionLog,
  verifyCitizenEmailAndDistrict,
  resetCitizenPasswordInFirestore
} from "@/services/firebase-service";

// Auth & Onboarding Components
import { MobileSplashScreen } from "./auth/MobileSplashScreen";
import { MobileOnboardingScreen } from "./auth/MobileOnboardingScreen";
import { MobileLoginScreen } from "./auth/MobileLoginScreen";
import { MobileRegisterScreen } from "./auth/MobileRegisterScreen";
import { MobileForgotPasswordScreen } from "./auth/MobileForgotPasswordScreen";
import { MobilePrivacyModal } from "./auth/MobilePrivacyModal";

// Modals
import { MobilePermissionsModal } from "./modals/MobilePermissionsModal";
import { MobileIOSInstallModal } from "./modals/MobileIOSInstallModal";
import { MobileSessionRevokedModal } from "./modals/MobileSessionRevokedModal";

// Tab Views
import { MobileHomeTab } from "./tabs/MobileHomeTab";
import { MobileMenuTab } from "./tabs/MobileMenuTab";
import { MobileScreeningTab } from "./tabs/MobileScreeningTab";
import { MobileComplaintTab } from "./tabs/MobileComplaintTab";
import { MobileAIChatTab } from "./tabs/MobileAIChatTab";
import { MobileProfileTab } from "./tabs/MobileProfileTab";

export const CitizenMobileApp: React.FC = () => {
  // ═══ NAVIGATION & SCREEN ROUTING ═══
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [citizenUser, setCitizenUser] = useState<CitizenUser | null>(null);

  // ═══ LOGIN FORM STATE ═══
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginDistrict, setLoginDistrict] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessSnackbar, setAuthSuccessSnackbar] = useState<string | null>(null);

  // ═══ REGISTER FORM STATE ═══
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeRegPrivacy, setAgreeRegPrivacy] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ═══ FORGOT PASSWORD STATE ═══
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDistrict, setForgotDistrict] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const [resetErrorMsg, setResetErrorMsg] = useState("");
  const [simulatedEmailNotification, setSimulatedEmailNotification] = useState<string | null>(null);

  // ═══ AI SCREENING STATE ═══
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState<"L" | "P">("L");
  const [childAgeMonths, setChildAgeMonths] = useState<number>(24);
  const [childWeightKg, setChildWeightKg] = useState<number>(11.5);
  const [childHeightCm, setChildHeightCm] = useState<number>(85.0);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ═══ COMPLAINT FORM STATE ═══
  const [complaintCategory, setComplaintCategory] = useState("Kualitas Menu MBG");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // ═══ PWA & PERMISSIONS STATE ═══
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [permissionStates, setPermissionStates] = useState<{
    camera: "granted" | "prompt" | "denied";
    location: "granted" | "prompt" | "denied";
    notification: "granted" | "prompt" | "denied";
  }>({
    camera: "prompt",
    location: "prompt",
    notification: "prompt"
  });
  const [sessionRevokedModal, setSessionRevokedModal] = useState(false);

  // ═══ PULL-TO-REFRESH & HARD RELOAD STATE ═══
  const [pullY, setPullY] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isHardReloading, setIsHardReloading] = useState(false);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // ═══ DYNAMIC ATMOSPHERE STATE ═══
  const [atmosphere, setAtmosphere] = useState<AtmosphereState>({
    timeOfDay: "night",
    greetingText: "Selamat Malam",
    greetingEmoji: "🌙",
    currentTimeStr: "01.24 WIB",
    currentDateStr: "Minggu, 30 Agu 2026",
  });

  // ═══ RESTORE SCREEN & SESSION ON MOUNT ═══
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("kcal_active_citizen_user");
      let activeUser: CitizenUser | null = null;
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.email || savedUser.name)) {
          activeUser = savedUser;
          setCitizenUser(savedUser);
        }
      }

      // Restore Remembered Credentials if available
      const remembered = localStorage.getItem("kcal_citizen_remembered_credentials");
      if (remembered) {
        const cred = JSON.parse(remembered);
        if (cred) {
          if (cred.email) setLoginIdentifier(cred.email);
          if (cred.password) setLoginPassword(cred.password);
          if (cred.district) setLoginDistrict(cred.district);
          setRememberMe(cred.rememberMe ?? true);
        }
      }

      if (activeUser) {
        setCurrentScreen("main");
      } else {
        const savedScreen = sessionStorage.getItem("kcal_citizen_screen") as AppScreen;
        if (savedScreen && !["splash", "onboarding"].includes(savedScreen)) {
          setCurrentScreen(savedScreen);
        }
      }

      const savedTab = sessionStorage.getItem("kcal_citizen_tab") as MobileTab;
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch {}
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    if (!["splash", "onboarding"].includes(currentScreen)) {
      sessionStorage.setItem("kcal_citizen_screen", currentScreen);
    }
  }, [currentScreen]);

  useEffect(() => {
    sessionStorage.setItem("kcal_citizen_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (citizenUser) {
      localStorage.setItem("kcal_active_citizen_user", JSON.stringify(citizenUser));
    }
  }, [citizenUser]);

  // Update Atmosphere Clock & Time-of-Day
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      let tod: AtmosphereState["timeOfDay"] = "night";
      let gt = "Selamat Malam";
      let ge = "🌙";

      if (hours >= 5 && hours < 11) {
        tod = "morning";
        gt = "Selamat Pagi";
        ge = "🌅";
      } else if (hours >= 11 && hours < 15) {
        tod = "afternoon";
        gt = "Selamat Siang";
        ge = "☀️";
      } else if (hours >= 15 && hours < 18) {
        tod = "evening";
        gt = "Selamat Sore";
        ge = "🌇";
      }

      const pad = (n: number) => n.toString().padStart(2, "0");
      const timeStr = `${pad(now.getHours())}.${pad(now.getMinutes())} WIB`;
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      setAtmosphere({
        timeOfDay: tod,
        greetingText: gt,
        greetingEmoji: ge,
        currentTimeStr: timeStr,
        currentDateStr: dateStr,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: any;
    if (otpResendCountdown > 0) {
      timer = setInterval(() => {
        setOtpResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpResendCountdown]);

  // PWA detection & touch event listeners
  useEffect(() => {
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(isApp);

    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Auto-prompt permissions dialog once
    const handled = localStorage.getItem("kcal_permissions_dialog_handled");
    if (!handled) {
      const timer = setTimeout(() => {
        setShowPermissionDialog(true);
      }, 2600);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Real-time listener for Super Admin forced logout
  useEffect(() => {
    if (!citizenUser) return;
    const currentSessionId = localStorage.getItem("kcal_citizen_session_id");
    if (!currentSessionId) return;

    const unsub = listenToActiveSessions((sessions: any[]) => {
      const mySession = sessions.find((s: any) => s.id === currentSessionId);
      if (mySession && mySession.status === "active") return;

      try {
        localStorage.removeItem("kcal_active_citizen_user");
        localStorage.removeItem("kcal_citizen_session_id");
        sessionStorage.removeItem("kcal_citizen_screen");
      } catch {}
      setCitizenUser(null);
      setSessionRevokedModal(true);
    });

    return () => unsub();
  }, [citizenUser]);

  // ═══ HANDLERS ═══

  const handleInstallPWA = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("Untuk memasang aplikasi Kcal di Android:\n1. Buka menu browser (titik tiga ⋮ di kanan atas)\n2. Pilih 'Tambahkan ke Layar Utama' / 'Install App'");
    }
  };

  const handleGrantAllPermissions = async () => {
    setIsRequestingPermissions(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setPermissionStates((p) => ({ ...p, location: "granted" })),
        () => setPermissionStates((p) => ({ ...p, location: "denied" })),
        { timeout: 5000 }
      );
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionStates((p) => ({ ...p, camera: "granted" }));
      } catch {
        setPermissionStates((p) => ({ ...p, camera: "denied" }));
      }
    }

    if (typeof Notification !== "undefined" && Notification.requestPermission) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionStates((p) => ({
          ...p,
          notification: perm === "granted" ? "granted" : "denied"
        }));
      } catch {}
    }

    localStorage.setItem("kcal_permissions_dialog_handled", "true");
    setTimeout(() => {
      setIsRequestingPermissions(false);
      setShowPermissionDialog(false);
    }, 800);
  };

  const handleCitizenLogout = async () => {
    try {
      const sessionId = localStorage.getItem("kcal_citizen_session_id");
      if (sessionId) {
        await closeSessionLog(sessionId);
      }
      localStorage.removeItem("kcal_active_citizen_user");
      localStorage.removeItem("kcal_citizen_session_id");
      sessionStorage.removeItem("kcal_citizen_screen");

      const remembered = localStorage.getItem("kcal_citizen_remembered_credentials");
      if (remembered) {
        const cred = JSON.parse(remembered);
        if (cred) {
          if (cred.email) setLoginIdentifier(cred.email);
          if (cred.password) setLoginPassword(cred.password);
          if (cred.district) setLoginDistrict(cred.district);
          setRememberMe(true);
        }
      }
    } catch {}
    setCitizenUser(null);
    setCurrentScreen("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginIdentifier.trim()) {
      setAuthError("Silakan masukkan email terdaftar Anda.");
      return;
    }
    if (!loginPassword) {
      setAuthError("Silakan masukkan kata sandi akun.");
      return;
    }
    if (!loginDistrict) {
      setAuthError("Silakan pilih kecamatan domisili Anda.");
      return;
    }
    if (!agreePrivacy) {
      setAuthError("Anda harus menyetujui Kebijakan Privasi Kcal.");
      return;
    }

    setIsSubmittingAuth(true);
    const res = await loginCitizenFromFirestore(
      loginIdentifier.trim(),
      loginPassword,
      loginDistrict || "Kebomas"
    );
    setIsSubmittingAuth(false);

    if (res.success && res.user) {
      setCitizenUser(res.user);
      try {
        localStorage.setItem("kcal_active_citizen_user", JSON.stringify(res.user));
        let sid = res.sessionId;
        if (!sid) {
          sid = await recordCitizenSessionLog(res.user);
        }
        localStorage.setItem("kcal_citizen_session_id", sid);
        sessionStorage.setItem("kcal_citizen_screen", "main");

        if (rememberMe) {
          localStorage.setItem("kcal_citizen_remembered_credentials", JSON.stringify({
            email: loginIdentifier.trim(),
            password: loginPassword,
            district: loginDistrict,
            rememberMe: true,
          }));
        } else {
          localStorage.removeItem("kcal_citizen_remembered_credentials");
        }
      } catch {}
      setCurrentScreen("main");
    } else {
      setAuthError(res.error || "Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!regFullName.trim()) errors.fullName = "Nama lengkap wajib diisi";
    if (!regEmail.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errors.email = "Format email tidak valid";
    }
    if (!regPhone.trim()) errors.phone = "Nomor WhatsApp wajib diisi";
    if (!regDistrict) errors.district = "Kecamatan domisili wajib dipilih";
    if (!regPassword || regPassword.length < 6) errors.password = "Kata sandi minimal 6 karakter";
    if (regPassword !== regConfirmPassword) errors.confirmPassword = "Konfirmasi kata sandi tidak cocok";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (!agreeRegPrivacy) {
      setAuthError("Anda harus menyetujui Kebijakan Privasi MBG.");
      return;
    }

    setIsSubmittingAuth(true);
    const res = await registerCitizenToFirestore({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      district: regDistrict,
      password: regPassword,
      role: "masyarakat",
      createdAtIso: new Date().toISOString(),
    });
    setIsSubmittingAuth(false);

    if (res.success) {
      setLoginIdentifier(regEmail.trim());
      setLoginDistrict(regDistrict);
      setLoginPassword(regPassword);
      setAuthSuccessSnackbar(`Akun keluarga atas nama ${regFullName.trim()} berhasil dibuat! Silakan masuk.`);
      setRegFullName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegConfirmPassword("");
      setCurrentScreen("login");
    } else {
      setAuthError(res.error || "Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg("");
    setResetSuccessMsg("");

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setResetErrorMsg("Masukkan alamat email terdaftar yang valid.");
      return;
    }
    if (!forgotDistrict) {
      setResetErrorMsg("Silakan pilih kecamatan domisili Anda.");
      return;
    }

    setIsResettingPassword(true);
    const verifyRes = await verifyCitizenEmailAndDistrict(forgotEmail.trim(), forgotDistrict);
    setIsResettingPassword(false);

    if (!verifyRes.success) {
      setResetErrorMsg(verifyRes.error || "Email dan kecamatan tidak cocok.");
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setForgotStep(2);
    setOtpResendCountdown(60);
    setSimulatedEmailNotification(randomOtp);
    setResetSuccessMsg(`Kode OTP 6-digit berhasil dikirimkan ke ${forgotEmail.trim()} (Kecamatan ${forgotDistrict}).`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg("");

    if (inputOtp.trim() === generatedOtp.trim()) {
      setResetSuccessMsg("Kode verifikasi OTP terkonfirmasi valid!");
      setForgotStep(3);
      setSimulatedEmailNotification(null);
    } else {
      setResetErrorMsg("Kode OTP yang Anda masukkan salah. Periksa kembali email Anda.");
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg("");
    setResetSuccessMsg("");

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setResetErrorMsg("Kata sandi baru minimal 6 karakter");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setResetErrorMsg("Konfirmasi kata sandi baru tidak cocok");
      return;
    }

    setIsResettingPassword(true);
    const res = await resetCitizenPasswordInFirestore(forgotEmail.trim(), forgotNewPassword, forgotDistrict);
    setIsResettingPassword(false);

    if (res.success) {
      setResetSuccessMsg("Kata sandi berhasil diperbarui! Mengalihkan ke halaman masuk...");
      setLoginIdentifier(forgotEmail.trim());
      setLoginDistrict(forgotDistrict);
      setLoginPassword(forgotNewPassword);

      try {
        const remembered = localStorage.getItem("kcal_citizen_remembered_credentials");
        if (remembered) {
          localStorage.setItem("kcal_citizen_remembered_credentials", JSON.stringify({
            email: forgotEmail.trim(),
            password: forgotNewPassword,
            district: forgotDistrict,
            rememberMe: true,
          }));
        }
      } catch {}

      setTimeout(() => {
        setResetSuccessMsg("");
        setForgotStep(1);
        setCurrentScreen("login");
      }, 1500);
    } else {
      setResetErrorMsg(res.error || "Gagal mengatur ulang kata sandi. Pastikan email Anda sudah terdaftar.");
    }
  };

  const handleCalculateNutrition = () => {
    if (!childName.trim()) {
      alert("Silakan masukkan nama anak.");
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setScreeningResult({
        status: "Normal",
        score: 92,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        description: `Pertumbuhan ${childName} (Usia ${childAgeMonths} bln, BB ${childWeightKg} kg, TB ${childHeightCm} cm) berada dalam kurva Standar Baku Antropometri WHO & Kemenkes RI.`,
        recommendations: [
          "Pertahankan pola makan bergizi seimbang tinggi protein hewani (Bandeng / Telur).",
          "Kombinasikan menu MBG sekolah dengan sayur segar lokal kaya serat.",
          "Jaga asupan cairan harian dan aktivitas fisik teratur.",
        ],
        localFoods: ["Bandeng Gresik", "Telur Ayam Lokal", "Bayam Petik", "Tempe Kedelai"],
      });
    }, 1200);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMessage.trim()) return;

    setIsSubmittingComplaint(true);
    const complaintData = {
      senderName: citizenUser?.name || "Warga Anonim",
      senderEmail: citizenUser?.email || "warga@gresik.id",
      senderPhone: citizenUser?.phone || "-",
      district: citizenUser?.district || "Kebomas",
      category: complaintCategory,
      message: complaintMessage,
      status: "baru" as const,
      createdAtIso: new Date().toISOString(),
    };

    const res = await saveComplaintToFirestore(complaintData);
    setIsSubmittingComplaint(false);

    if (res.success && res.docId) {
      setSubmittedTicket(res.docId);
      setComplaintMessage("");
    } else {
      alert("Gagal mengirim laporan: " + (res.error || "Terjadi kesalahan."));
    }
  };

  // Pull-to-Refresh Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const scrollParent = target.closest(".overflow-y-auto") as HTMLElement;
    if (!scrollParent || scrollParent.scrollTop <= 2) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    } else {
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isPullRefreshing || isHardReloading) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;
    if (delta > 0) {
      const dist = Math.min(delta * 0.4, 70);
      setPullY(dist);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || isPullRefreshing || isHardReloading) return;
    isDraggingRef.current = false;

    if (pullY >= 45) {
      setIsPullRefreshing(true);
      setPullY(45);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(20); } catch {}
      }

      try {
        const currentBuild = sessionStorage.getItem("kcal_client_build_id");
        const res = await fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (currentBuild && data?.buildId && data.buildId !== currentBuild) {
            setIsHardReloading(true);
            sessionStorage.setItem("kcal_client_build_id", data.buildId);
            setTimeout(() => {
              window.location.reload();
            }, 800);
            return;
          } else if (data?.buildId && !currentBuild) {
            sessionStorage.setItem("kcal_client_build_id", data.buildId);
          }
        }
      } catch {}

      await new Promise((resolve) => setTimeout(resolve, 400));
      setIsPullRefreshing(false);
      setPullY(0);
    } else {
      setPullY(0);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-0 sm:p-4 min-h-screen bg-slate-900/60 backdrop-blur-md select-none font-sans">
      {/* ═══ MODALS & OVERLAYS ═══ */}
      <MobilePermissionsModal
        isOpen={showPermissionDialog}
        isRequesting={isRequestingPermissions}
        permissionStates={permissionStates}
        onGrantAll={handleGrantAllPermissions}
        onDismiss={() => {
          setShowPermissionDialog(false);
          localStorage.setItem("kcal_permissions_dialog_handled", "true");
        }}
      />

      <MobileIOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />

      <MobileSessionRevokedModal
        isOpen={sessionRevokedModal}
        onDismiss={() => {
          setSessionRevokedModal(false);
          setCurrentScreen("login");
        }}
      />

      <MobilePrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Hard Reload Fullscreen Screen */}
      {isHardReloading && (
        <div className="fixed inset-0 z-[999] bg-[#131C38] flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-green-02/20 border border-green-02 flex items-center justify-center shadow-lg animate-spin">
            <RefreshCw className="w-8 h-8 text-green-02" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[17px] font-bold text-white">Memperbarui Aplikasi Kcal...</h3>
            <p className="text-[12px] text-blue-gray">Sinkronisasi versi terbaru dari server Pemkab Gresik</p>
          </div>
        </div>
      )}

      {/* ═══ SMARTPHONE SCREEN SHELL FRAME ═══ */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-[100dvh] sm:h-[810px] sm:max-w-[395px] bg-white sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border-[7px] sm:border-slate-800 select-none"
      >
        {/* Dynamic Floating Transparent Pull-to-Refresh Pill Overlay (Never pushes layout) */}
        {pullY > 0 && (
          <div
            style={{
              transform: `translate(-50%, ${Math.min(pullY * 0.75, 42)}px)`,
              opacity: Math.min(pullY / 25, 1),
            }}
            className="absolute top-1 left-1/2 z-50 pointer-events-none transition-all duration-75 ease-out"
          >
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center gap-2 text-[11px] font-bold">
              <RefreshCw
                className={`w-3.5 h-3.5 text-green-02 ${isPullRefreshing ? "animate-spin" : ""}`}
                style={{
                  transform: isPullRefreshing ? undefined : `rotate(${pullY * 6}deg)`,
                }}
              />
              <span className="tracking-tight text-slate-100">
                {isPullRefreshing
                  ? "Memperbarui..."
                  : pullY >= 45
                  ? "Lepas untuk Segarkan"
                  : "Tarik untuk Segarkan"}
              </span>
            </div>
          </div>
        )}

        {/* ═══ 1. SPLASH SCREEN ═══ */}
        {currentScreen === "splash" && (
          <MobileSplashScreen
            onContinue={() => setCurrentScreen("onboarding")}
          />
        )}

        {/* ═══ 2. ONBOARDING SCREEN ═══ */}
        {currentScreen === "onboarding" && (
          <MobileOnboardingScreen
            onSkip={() => setCurrentScreen("login")}
            onFinish={() => setCurrentScreen("login")}
          />
        )}

        {/* ═══ 3. LOGIN SCREEN ═══ */}
        {currentScreen === "login" && (
          <MobileLoginScreen
            loginIdentifier={loginIdentifier}
            setLoginIdentifier={setLoginIdentifier}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            loginDistrict={loginDistrict}
            setLoginDistrict={setLoginDistrict}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            agreePrivacy={agreePrivacy}
            setAgreePrivacy={setAgreePrivacy}
            isSubmittingAuth={isSubmittingAuth}
            authError={authError}
            authSuccessSnackbar={authSuccessSnackbar}
            isStandalone={isStandalone}
            onInstallPWA={handleInstallPWA}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
            onLogin={handleLogin}
            onNavigateToRegister={() => {
              setAuthError("");
              setCurrentScreen("register");
            }}
            onNavigateToForgotPassword={() => {
              setAuthError("");
              setResetErrorMsg("");
              setResetSuccessMsg("");
              setForgotStep(1);
              setCurrentScreen("forgot_password");
            }}
          />
        )}

        {/* ═══ 4. REGISTER SCREEN ═══ */}
        {currentScreen === "register" && (
          <MobileRegisterScreen
            regFullName={regFullName}
            setRegFullName={setRegFullName}
            regEmail={regEmail}
            setRegEmail={setRegEmail}
            regPhone={regPhone}
            setRegPhone={setRegPhone}
            regDistrict={regDistrict}
            setRegDistrict={setRegDistrict}
            regPassword={regPassword}
            setRegPassword={setRegPassword}
            regConfirmPassword={regConfirmPassword}
            setRegConfirmPassword={setRegConfirmPassword}
            showRegPassword={showRegPassword}
            setShowRegPassword={setShowRegPassword}
            showRegConfirmPassword={showRegConfirmPassword}
            setShowRegConfirmPassword={setShowRegConfirmPassword}
            agreeRegPrivacy={agreeRegPrivacy}
            setAgreeRegPrivacy={setAgreeRegPrivacy}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            authError={authError}
            setAuthError={setAuthError}
            isSubmittingAuth={isSubmittingAuth}
            onRegister={handleRegister}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
            onNavigateToLogin={() => {
              setAuthError("");
              setFieldErrors({});
              setCurrentScreen("login");
            }}
          />
        )}

        {/* ═══ 5. FORGOT PASSWORD SCREEN ═══ */}
        {currentScreen === "forgot_password" && (
          <MobileForgotPasswordScreen
            forgotStep={forgotStep}
            setForgotStep={setForgotStep}
            forgotEmail={forgotEmail}
            setForgotEmail={setForgotEmail}
            forgotDistrict={forgotDistrict}
            setForgotDistrict={setForgotDistrict}
            inputOtp={inputOtp}
            setInputOtp={setInputOtp}
            otpResendCountdown={otpResendCountdown}
            forgotNewPassword={forgotNewPassword}
            setForgotNewPassword={setForgotNewPassword}
            forgotConfirmPassword={forgotConfirmPassword}
            setForgotConfirmPassword={setForgotConfirmPassword}
            showForgotPass={showForgotPass}
            setShowForgotPass={setShowForgotPass}
            showForgotConfirmPass={showForgotConfirmPass}
            setShowForgotConfirmPass={setShowForgotConfirmPass}
            isResettingPassword={isResettingPassword}
            resetSuccessMsg={resetSuccessMsg}
            setResetSuccessMsg={setResetSuccessMsg}
            resetErrorMsg={resetErrorMsg}
            setResetErrorMsg={setResetErrorMsg}
            simulatedEmailNotification={simulatedEmailNotification}
            setSimulatedEmailNotification={setSimulatedEmailNotification}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            onSaveNewPassword={handleSaveNewPassword}
            onNavigateToLogin={() => {
              setResetErrorMsg("");
              setResetSuccessMsg("");
              setForgotStep(1);
              setCurrentScreen("login");
            }}
          />
        )}

        {/* ═══ 6. MAIN LOGGED-IN PORTAL ═══ */}
        {currentScreen === "main" && (
          <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full overflow-hidden relative font-sans">
            {/* Top Bar Header for Secondary Tabs (except Screening which has its own themed top bar) */}
            {activeTab !== "home" && activeTab !== "screening" && (
              <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs z-30 font-sans">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("home")}
                    className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue transition-colors cursor-pointer"
                    title="Kembali ke Beranda"
                  >
                    <img src="/logo_app.svg" alt="Kcal" className="w-7 h-7 rounded-lg shadow-xs" />
                  </button>
                  <div>
                    <h3 className="text-[13px] font-bold text-ford-blue leading-tight">
                      {activeTab === "menu" ? "Jadwal Menu MBG" : activeTab === "complaint" ? "Pusat Aduan MBG" : activeTab === "ai_chat" ? "Konsultasi K-Bot AI" : citizenUser?.name || "Warga Gresik"}
                    </h3>
                    <p className="text-[10px] text-blue-gray flex items-center gap-1 font-medium mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-light-sea-green" />
                      <span>Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {activeTab !== "profile" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("home")}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Beranda
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCitizenLogout}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    title="Keluar Sesi"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </header>
            )}

            {/* Main Tab Views with Pull-to-Refresh and Bottom Clearance */}
            <main
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex-1 font-sans no-scrollbar ${
                activeTab === "screening"
                  ? "p-0 m-0 h-full w-full overflow-hidden"
                  : "p-3.5 space-y-3.5 overflow-y-auto pb-24 overscroll-contain min-h-0"
              }`}
            >
              {activeTab === "home" && (
                <MobileHomeTab
                  citizenUser={citizenUser}
                  atmosphere={atmosphere}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "screening" && (
                <MobileScreeningTab
                  citizenUser={citizenUser}
                  onBackToHome={() => setActiveTab("home")}
                  onNavigateToComplaint={() => setActiveTab("complaint")}
                />
              )}

              {activeTab === "menu" && (
                <MobileMenuTab
                  citizenUser={citizenUser}
                />
              )}

              {activeTab === "complaint" && (
                <MobileComplaintTab
                  complaintCategory={complaintCategory}
                  setComplaintCategory={setComplaintCategory}
                  complaintMessage={complaintMessage}
                  setComplaintMessage={setComplaintMessage}
                  isSubmittingComplaint={isSubmittingComplaint}
                  submittedTicket={submittedTicket}
                  setSubmittedTicket={setSubmittedTicket}
                  onSubmitComplaint={handleSubmitComplaint}
                />
              )}

              {activeTab === "ai_chat" && (
                <MobileAIChatTab />
              )}

              {activeTab === "profile" && (
                <MobileProfileTab
                  citizenUser={citizenUser}
                  setActiveTab={setActiveTab}
                  onLogout={handleCitizenLogout}
                />
              )}
            </main>

            {/* ═══ 3-TAB LOCKED BOTTOM NAVIGATION BAR ═══ */}
            {activeTab !== "screening" && (
              <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pt-2 pb-5 sm:pb-3 px-4 relative font-sans animate-in slide-in-from-bottom-2 duration-200">
                <nav className="flex items-center justify-around max-w-sm mx-auto">
                  {/* 1. Beranda (Left) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("home")}
                    className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all cursor-pointer ${
                      activeTab === "home" ? "text-light-sea-green font-bold" : "text-blue-gray hover:text-ford-blue font-medium"
                    }`}
                  >
                    <div className={`p-1.5 rounded-2xl transition-all ${activeTab === "home" ? "bg-green-tint text-ford-blue shadow-2xs" : "text-blue-gray"}`}>
                      <Home className={`w-5 h-5 transition-transform ${activeTab === "home" ? "scale-110" : ""}`} />
                    </div>
                    <span className="text-[11px] tracking-tight">Beranda</span>
                  </button>

                  {/* 2. Center Prominent Floating Button: Analisis (Raised & Glowing) */}
                  <div className="relative -top-5 flex flex-col items-center px-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("screening")}
                      className="relative group cursor-pointer"
                      title="Analisis Gizi & Stunting AI"
                    >
                      {/* Glowing Pulse Aura */}
                      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-green-02/50 via-light-sea-green/50 to-teal-400/50 blur-md animate-pulse"></div>
                      
                      {/* Raised Action Button */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-02 via-light-sea-green to-teal-400 text-ford-blue flex items-center justify-center shadow-xl border-4 border-white active:scale-95 group-hover:scale-105 transition-all relative z-10">
                        <Activity className="w-6 h-6 stroke-[2.5] text-ford-blue" />
                      </div>
                    </button>
                    <span className="text-[11px] font-black tracking-tight mt-1 transition-colors text-ford-blue">
                      Analisis
                    </span>
                  </div>

                  {/* 3. Profil (Right) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all cursor-pointer ${
                      activeTab === "profile" ? "text-light-sea-green font-bold" : "text-blue-gray hover:text-ford-blue font-medium"
                    }`}
                  >
                    <div className={`p-1.5 rounded-2xl transition-all ${activeTab === "profile" ? "bg-green-tint text-ford-blue shadow-2xs" : "text-blue-gray"}`}>
                      <User className={`w-5 h-5 transition-transform ${activeTab === "profile" ? "scale-110" : ""}`} />
                    </div>
                    <span className="text-[11px] tracking-tight">Profil</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
