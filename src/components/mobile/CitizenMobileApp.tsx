"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Activity,
  User,
  LogOut,
  MapPin,
  RefreshCw
} from "lucide-react";
import {
  AppScreen,
  MobileTab,
  CitizenUser,
  ScreeningResult,
  AtmosphereState
} from "./types";
import { App as KonstaApp, Page as KonstaPage, Tabbar, TabbarLink } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenToActiveSessions,
  closeSessionLog,
  loginCitizenFromFirestore,
  registerCitizenToFirestore,
  recordCitizenSessionLog,
  verifyCitizenEmailAndDistrict,
  resetCitizenPasswordInFirestore,
  updateCitizenDistrictInFirestore,
  updateCitizenProfileInFirestore
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
import { MobileCameraPermissionModal } from "./screening/MobileCameraPermissionModal";

// Tab Views (Only 3 Tabs: Home, Screening, Profile)
import { MobileHomeTab } from "./tabs/MobileHomeTab";
import { MobileScreeningTab } from "./tabs/MobileScreeningTab";
import { MobileProfileTab } from "./tabs/MobileProfileTab";

export const CitizenMobileApp: React.FC = () => {
  // ═══ NAVIGATION & SCREEN ROUTING ═══
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [citizenUser, setCitizenUser] = useState<CitizenUser | null>(null);

  // ═══ KONSTA UI ADAPTIVE THEME (AUTO-DETECT iOS VS ANDROID) ═══
  const [konstaTheme, setKonstaTheme] = useState<"ios" | "material">("ios");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setKonstaTheme(isIOSDevice ? "ios" : "material");
    }
  }, []);

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
  const [regAge, setRegAge] = useState("");
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
  const [isCameraPermissionModalOpen, setIsCameraPermissionModalOpen] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] = useState(false);

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
    } catch { }
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
      } catch { }
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
      } catch { }
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
    } catch { }
    setCitizenUser(null);
    setCurrentScreen("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!loginIdentifier.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier.trim())) {
      errors.email = "Format email tidak valid";
    }
    if (!loginPassword) {
      errors.password = "Kata sandi wajib diisi";
    } else if (loginPassword.length < 6) {
      errors.password = "Kata sandi minimal 6 karakter";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!agreePrivacy) {
      setAuthError("Anda harus menyetujui Kebijakan Privasi Kcal.");
      return;
    }

    setIsSubmittingAuth(true);
    const res = await loginCitizenFromFirestore(
      loginIdentifier.trim(),
      loginPassword
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
            rememberMe: true,
          }));
        } else {
          localStorage.removeItem("kcal_citizen_remembered_credentials");
        }
      } catch { }
      setCurrentScreen("main");
    } else {
      const errMsg = res.error || "Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.";
      if (errMsg.toLowerCase().includes("email")) {
        setFieldErrors({ email: errMsg });
      } else if (errMsg.toLowerCase().includes("sandi") || errMsg.toLowerCase().includes("password")) {
        setFieldErrors({ password: errMsg });
      } else {
        setAuthError(errMsg);
      }
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
    if (!regDistrict) errors.district = "Pilih kecamatan domisili Anda";
    if (!regAge) errors.age = "Pilih usia anak (1-17 tahun)";
    if (!regPassword || regPassword.length < 6) errors.password = "Kata sandi minimal 6 karakter";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmittingAuth(true);
    const res = await registerCitizenToFirestore({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      district: regDistrict,
      age: Number(regAge) || 9,
      password: regPassword,
      role: "masyarakat",
      createdAtIso: new Date().toISOString(),
    });
    setIsSubmittingAuth(false);

    if (res.success) {
      setLoginIdentifier(regEmail.trim());
      setLoginPassword(regPassword);
      setAuthSuccessSnackbar(`Akun keluarga atas nama ${regFullName.trim()} berhasil dibuat! Silakan masuk.`);
      setRegFullName("");
      setRegEmail("");
      setRegDistrict("");
      setRegAge("");
      setRegPassword("");
      setCurrentScreen("login");
    } else {
      setAuthError(res.error || "Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  const handleUpdateDistrict = async (newDistrict: string) => {
    await handleUpdateProfile({ district: newDistrict });
  };

  const handleUpdateProfile = async (updates: { district?: string; age?: number }) => {
    if (!citizenUser) return;
    const updatedUser: CitizenUser = {
      ...citizenUser,
      ...(updates.district ? { district: updates.district } : {}),
      ...(updates.age !== undefined ? { age: updates.age } : {}),
    };
    setCitizenUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("gscan_citizen_session", JSON.stringify(updatedUser));
    }
    if (citizenUser.email) {
      await updateCitizenProfileInFirestore(citizenUser.email, updates);
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

    setIsResettingPassword(true);
    const verifyRes = await verifyCitizenEmailAndDistrict(forgotEmail.trim());
    setIsResettingPassword(false);

    if (!verifyRes.success) {
      setResetErrorMsg(verifyRes.error || "Alamat email tidak ditemukan.");
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setForgotStep(2);
    setOtpResendCountdown(60);
    setSimulatedEmailNotification(randomOtp);
    setResetSuccessMsg(`Kode OTP 6-digit berhasil dikirimkan ke ${forgotEmail.trim()}.`);
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
    const res = await resetCitizenPasswordInFirestore(forgotEmail.trim(), forgotNewPassword);
    setIsResettingPassword(false);

    if (res.success) {
      setResetSuccessMsg("Kata sandi berhasil diperbarui! Mengalihkan ke halaman masuk...");
      setLoginIdentifier(forgotEmail.trim());
      setLoginPassword(forgotNewPassword);

      try {
        const remembered = localStorage.getItem("kcal_citizen_remembered_credentials");
        if (remembered) {
          localStorage.setItem("kcal_citizen_remembered_credentials", JSON.stringify({
            email: forgotEmail.trim(),
            password: forgotNewPassword,
            rememberMe: true,
          }));
        }
      } catch { }

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
        try { navigator.vibrate(20); } catch { }
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
      } catch { }

      await new Promise((resolve) => setTimeout(resolve, 400));
      setIsPullRefreshing(false);
      setPullY(0);
    } else {
      setPullY(0);
    }
  };

  // ═══ CAMERA PERMISSION CHECK FOR AI SCREENING ═══
  const handleOpenScreeningWithPermission = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
    setCameraPermissionError(null);

    // If permission was already explicitly granted during this session, proceed directly
    if (isCameraPermissionGranted) {
      setActiveTab("screening");
      return;
    }

    // Try checking browser permissions API if supported
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: "camera" as any });
        if (status.state === "granted") {
          setIsCameraPermissionGranted(true);
          setActiveTab("screening");
          return;
        }
      }
    } catch (e) {
      // Permissions API not supported or query error
    }

    // Otherwise show the dedicated Camera Permission Modal (like MobilePrivacyModal)
    setIsCameraPermissionModalOpen(true);
  };

  const handleRequestCameraPermission = async () => {
    setIsRequestingCamera(true);
    setCameraPermissionError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the test stream immediately
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraPermissionGranted(true);
        setIsCameraPermissionModalOpen(false);
        setActiveTab("screening");
      } else {
        setCameraPermissionError("Perangkat tidak mendukung akses kamera web.");
      }
    } catch (err: any) {
      console.warn("Camera permission denied or error:", err);
      setCameraPermissionError("Izin kamera ditolak. Harap izinkan akses kamera pada peramban Anda untuk melanjutkan ke Analisis AI.");
    } finally {
      setIsRequestingCamera(false);
    }
  };

  return (
    <div className="fixed inset-0 sm:static sm:min-h-screen w-full h-full sm:h-auto flex items-center justify-center p-0 sm:p-4 bg-[#F8FAFC] sm:bg-slate-900/60 backdrop-blur-md select-none font-sans overflow-hidden touch-pan-y">
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

      <MobileCameraPermissionModal
        isOpen={isCameraPermissionModalOpen}
        onClose={() => setIsCameraPermissionModalOpen(false)}
        onRequestPermission={handleRequestCameraPermission}
        isRequesting={isRequestingCamera}
        errorMessage={cameraPermissionError}
      />

      {/* Hard Reload Fullscreen Screen */}
      {isHardReloading && (
        <div className="fixed inset-0 z-[999] bg-[#131C38] flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-green-02/20 border border-green-02 flex items-center justify-center shadow-lg animate-spin">
            <RefreshCw className="w-8 h-8 text-green-02" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[17px] font-bold text-white">Memperbarui Aplikasi Kcal...</h3>
            <p className="text-[12px] text-blue-gray">Sinkronisasi versi terbaru dari server</p>
          </div>
        </div>
      )}

      {/* ═══ SMARTPHONE SCREEN SHELL FRAME (LOCKED FULL VIEWPORT ON MOBILE) ═══ */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full sm:h-[840px] sm:max-h-[92vh] sm:max-w-[400px] bg-white sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden relative border-0 sm:border-[7px] sm:border-slate-800 select-none touch-pan-y"
      >
        <KonstaApp theme={konstaTheme} safeAreas={false} className="w-full max-w-full h-full flex flex-col justify-between overflow-hidden relative">
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

          {/* ═══ SCREEN ROUTER WITH FRAMER MOTION TRANSITIONS ═══ */}
          <AnimatePresence mode="wait" initial={false}>
            {/* 1. SPLASH SCREEN */}
            {currentScreen === "splash" && (
              <motion.div
                key="splash"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <MobileSplashScreen
                  onContinue={() => setCurrentScreen("onboarding")}
                />
              </motion.div>
            )}

            {/* 2. ONBOARDING SCREEN */}
            {currentScreen === "onboarding" && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <MobileOnboardingScreen
                  onSkip={() => setCurrentScreen("login")}
                  onFinish={() => setCurrentScreen("login")}
                />
              </motion.div>
            )}

            {/* 3. LOGIN SCREEN */}
            {currentScreen === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <MobileLoginScreen
                  loginIdentifier={loginIdentifier}
                  setLoginIdentifier={setLoginIdentifier}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  agreePrivacy={agreePrivacy}
                  setAgreePrivacy={setAgreePrivacy}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                  isSubmittingAuth={isSubmittingAuth}
                  authError={authError}
                  authSuccessSnackbar={authSuccessSnackbar}
                  isStandalone={isStandalone}
                  onInstallPWA={handleInstallPWA}
                  onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
                  onLogin={handleLogin}
                  onNavigateToRegister={() => {
                    setAuthError("");
                    setFieldErrors({});
                    setCurrentScreen("register");
                  }}
                  onNavigateToForgotPassword={() => {
                    setAuthError("");
                    setFieldErrors({});
                    setResetErrorMsg("");
                    setResetSuccessMsg("");
                    setForgotStep(1);
                    setCurrentScreen("forgot_password");
                  }}
                />
              </motion.div>
            )}

            {/* 4. REGISTER SCREEN */}
            {currentScreen === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <MobileRegisterScreen
                  regFullName={regFullName}
                  setRegFullName={setRegFullName}
                  regEmail={regEmail}
                  setRegEmail={setRegEmail}
                  regDistrict={regDistrict}
                  setRegDistrict={setRegDistrict}
                  regAge={regAge}
                  setRegAge={setRegAge}
                  regPassword={regPassword}
                  setRegPassword={setRegPassword}
                  showRegPassword={showRegPassword}
                  setShowRegPassword={setShowRegPassword}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                  authError={authError}
                  setAuthError={setAuthError}
                  isSubmittingAuth={isSubmittingAuth}
                  onRegister={handleRegister}
                  onNavigateToLogin={() => {
                    setAuthError("");
                    setFieldErrors({});
                    setCurrentScreen("login");
                  }}
                />
              </motion.div>
            )}

            {/* 5. FORGOT PASSWORD SCREEN */}
            {currentScreen === "forgot_password" && (
              <motion.div
                key="forgot_password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <MobileForgotPasswordScreen
                  forgotStep={forgotStep}
                  setForgotStep={setForgotStep}
                  forgotEmail={forgotEmail}
                  setForgotEmail={setForgotEmail}
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
                    setCurrentScreen("login");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ 6. MAIN LOGGED-IN PORTAL ═══ */}
          {currentScreen === "main" && (
            <div className="flex-1 min-h-0 flex flex-col bg-[#F8FAFC] h-full w-full overflow-hidden relative font-sans">
              {/* Main Tab Views with Konsta Page handling scroll & padding with Motion transition */}
              <main
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex-1 font-sans no-scrollbar w-full max-w-full overflow-hidden touch-pan-y min-h-0 p-0 m-0 h-full relative"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {activeTab === "home" && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="h-full w-full"
                    >
                      <MobileHomeTab
                        citizenUser={citizenUser}
                        atmosphere={atmosphere}
                        setActiveTab={setActiveTab}
                      />
                    </motion.div>
                  )}

                  {activeTab === "screening" && (
                    <motion.div
                      key="screening"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="h-full w-full"
                    >
                      <MobileScreeningTab
                        citizenUser={citizenUser}
                        onBackToHome={() => setActiveTab("home")}
                      />
                    </motion.div>
                  )}

                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="h-full w-full"
                    >
                      <MobileProfileTab
                        citizenUser={citizenUser}
                        setActiveTab={setActiveTab}
                        onLogout={handleCitizenLogout}
                        onUpdateDistrict={handleUpdateDistrict}
                        onUpdateProfile={handleUpdateProfile}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

              {/* ═══ CLEAN 3-TAB NAVIGATION BAR (MATCHING examplebottom.svg - UNCLIPPED FLOATING HUB) ═══ */}
              {activeTab !== "screening" && (
                <div className="left-0 bottom-0 fixed z-40 w-full select-none">
                  {/* Center Floating Button Layer (Super Prominent 64px AI Hub) */}
                  <div className="absolute left-1/2 -top-8 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto">
                    <button
                      type="button"
                      onClick={handleOpenScreeningWithPermission}
                      className="relative group cursor-pointer active:scale-90 transition-transform duration-200"
                      title="Mulai Analisis Biometrik AI"
                    >
                      {/* Breathing Outer Radiant Glow */}
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#24E0D1] via-[#79D7D2] to-[#0FA89B] opacity-50 blur-md group-hover:opacity-85 transition-opacity animate-pulse" />

                      {/* Circular Floating 64px Mega Hub */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#0FA89B] via-[#24E0D1] to-[#A3EDE7] text-ford-blue flex items-center justify-center shadow-[0_10px_30px_rgba(15,168,155,0.5)] border-[4px] border-white">
                        <Activity className="w-8 h-8 stroke-[2.8] text-ford-blue drop-shadow-xs" />

                        {/* Floating Mini AI Badge */}
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-brand-orange text-white text-[8px] font-black tracking-wider shadow-sm border border-white uppercase">
                          AI
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Main White Elevated Bar */}
                  <div className="bg-white/98 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_25px_rgba(0,0,0,0.05)] pt-2 pb-safe-nav flex items-center justify-around relative px-4 min-h-[62px]">
                    {/* 1. Beranda */}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                        setActiveTab("home");
                      }}
                      className="flex flex-col items-center justify-center gap-1 w-20 py-1 transition-all cursor-pointer"
                    >
                      <Home
                        className={`w-6 h-6 transition-all duration-200 ${activeTab === "home"
                            ? "text-[#79D7D2] drop-shadow-[0_2px_8px_rgba(121,215,210,0.45)] scale-105"
                            : "text-[#B1B5C7]"
                          }`}
                      />
                      <span
                        className={`text-[11px] tracking-tight transition-colors duration-200 ${activeTab === "home"
                            ? "font-bold text-[#79D7D2]"
                            : "font-medium text-[#B1B5C7]"
                          }`}
                      >
                        Beranda
                      </span>
                    </button>

                    {/* 2. Analisis Center Spacer & Bold Label */}
                    <button
                      type="button"
                      onClick={handleOpenScreeningWithPermission}
                      className="flex flex-col items-center justify-center w-20 pt-8 transition-all cursor-pointer"
                    >
                      <span className="text-[11.5px] font-black text-[#0FA89B] tracking-tight drop-shadow-2xs">
                        Analisis AI
                      </span>
                    </button>

                    {/* 3. Profil */}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                        setActiveTab("profile");
                      }}
                      className="flex flex-col items-center justify-center gap-1 w-20 py-1 transition-all cursor-pointer"
                    >
                      <User
                        className={`w-6 h-6 transition-all duration-200 ${activeTab === "profile"
                            ? "text-[#79D7D2] drop-shadow-[0_2px_8px_rgba(121,215,210,0.45)] scale-105"
                            : "text-[#B1B5C7]"
                          }`}
                      />
                      <span
                        className={`text-[11px] tracking-tight transition-colors duration-200 ${activeTab === "profile"
                            ? "font-bold text-[#79D7D2]"
                            : "font-medium text-[#B1B5C7]"
                          }`}
                      >
                        Profil
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </KonstaApp>
      </div>
    </div>
  );
};
