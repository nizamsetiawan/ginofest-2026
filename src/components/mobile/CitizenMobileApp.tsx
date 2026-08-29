"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  QrCode,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Home,
  Activity,
  Utensils,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Clock,
  Camera,
  Check,
  ArrowLeft,
  X,
  KeyRound,
  Wifi,
  Battery,
  Signal,
  Download,
  Smartphone,
  Share,
  Bell,
  Navigation,
  Image as ImageIcon
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import {
  saveComplaintToFirestore,
  registerCitizenToFirestore,
  loginCitizenFromFirestore,
  resetCitizenPasswordInFirestore,
} from "@/services/firebase-service";

type AppScreen = "splash" | "login" | "register" | "forgot_password" | "main";
type MobileTab = "home" | "screening" | "menu" | "complaint" | "ai_chat";

export const CitizenMobileApp: React.FC = () => {
  // Screen state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [activeTab, setActiveTab] = useState<MobileTab>("home");

  // Authenticated Citizen User State
  const [citizenUser, setCitizenUser] = useState<{
    id?: string;
    name: string;
    email: string;
    phone?: string;
    district: string;
    photoURL?: string;
  } | null>(null);

  // ═══ RESTORE SCREEN & SESSION ON MOUNT ═══
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("kcal_active_citizen_user");
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.email) {
          setCitizenUser(savedUser);
        }
      }

      const savedScreen = sessionStorage.getItem("kcal_citizen_screen") as AppScreen;
      if (savedScreen && savedScreen !== "splash") {
        setCurrentScreen(savedScreen);
      }

      const savedTab = sessionStorage.getItem("kcal_citizen_tab") as MobileTab;
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch {}
  }, []);

  // Sync screen changes to sessionStorage
  useEffect(() => {
    if (currentScreen !== "splash") {
      sessionStorage.setItem("kcal_citizen_screen", currentScreen);
    }
  }, [currentScreen]);

  // Sync tab changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("kcal_citizen_tab", activeTab);
  }, [activeTab]);

  // Sync user changes to localStorage
  useEffect(() => {
    if (citizenUser) {
      localStorage.setItem("kcal_active_citizen_user", JSON.stringify(citizenUser));
    }
  }, [citizenUser]);

  // Login Form State (GreatDay HR Style)
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginDistrict, setLoginDistrict] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessSnackbar, setAuthSuccessSnackbar] = useState<string | null>(null);

  // Forgot Password Multi-step State (Step 1: Request OTP -> Step 2: Verify OTP -> Step 3: Set New Password)
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

  // Register Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // AI Screening Form State
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState<"L" | "P">("L");
  const [childAgeMonths, setChildAgeMonths] = useState<number>(24);
  const [childWeightKg, setChildWeightKg] = useState<number>(11.5);
  const [childHeightCm, setChildHeightCm] = useState<number>(85.0);
  const [screeningResult, setScreeningResult] = useState<null | {
    status: "Normal" | "Beresiko Stunting" | "Gizi Kurang" | "Sangat Baik";
    score: number;
    color: string;
    description: string;
    recommendations: string[];
    localFoods: string[];
  }>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState("Kualitas Menu MBG");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // ═══ PULL-TO-REFRESH STATE & HANDLERS ═══
  const [pullY, setPullY] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isHardReloading, setIsHardReloading] = useState(false);
  const [pullRefreshToast, setPullRefreshToast] = useState<string | null>(null);
  const startYRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);

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
      // Rubber-band dampening
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

      // Trigger haptic vibration on real phone
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(20); } catch {}
      }

      try {
        // Cek apakah ada build / deploy baru dari server Vercel
        const currentBuild = sessionStorage.getItem("kcal_client_build_id");
        const res = await fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (currentBuild && data?.buildId && data.buildId !== currentBuild) {
            // HANYA JIKA ADA DEPLOY BARU: Tampilkan layar animasi "Memperbarui Aplikasi Kcal..."
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

      // JIKA TIDAK ADA DEPLOY BARU: Cukup refresh data secara instan tanpa reload browser!
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsPullRefreshing(false);
      setPullY(0);
      setPullRefreshToast("Data gizi & menu MBG berhasil diperbarui!");
      setTimeout(() => setPullRefreshToast(null), 2500);
    } else {
      setPullY(0);
    }
  };

  // ═══ PWA / APK INSTALL STATES ═══
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check standalone mode (already installed as APK/PWA)
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(isApp);

    // Detect iOS
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    // Listen for PWA install event on Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isApp) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Auto-show banner on mobile browsers after 2s if not standalone
    const timer = setTimeout(() => {
      if (!isApp) {
        setShowInstallBanner(true);
      }
    }, 2000);

    // Prevent multi-touch pinch zoom on mobile devices
    const preventZoom = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("gesturestart", preventGesture, { passive: false });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("gesturestart", preventGesture);
      clearTimeout(timer);
    };
  }, []);

  // ═══ DEVICE PERMISSIONS STATES (Kamera, Galeri, Lokasi, Notifikasi) ═══
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

  useEffect(() => {
    // Check if permissions were previously handled
    const handled = localStorage.getItem("kcal_permissions_dialog_handled");
    if (!handled) {
      const timer = setTimeout(() => {
        setShowPermissionDialog(true);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGrantAllPermissions = async () => {
    setIsRequestingPermissions(true);

    // 1. Request GPS Location Permission
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPermissionStates((p) => ({ ...p, location: "granted" }));
        },
        (err) => {
          console.warn("Location permission error:", err);
          setPermissionStates((p) => ({ ...p, location: "denied" }));
        },
        { timeout: 5000 }
      );
    }

    // 2. Request Camera / Media Permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop stream immediately after acquiring permission
        stream.getTracks().forEach((track) => track.stop());
        setPermissionStates((p) => ({ ...p, camera: "granted" }));
      } catch (err) {
        console.warn("Camera permission error:", err);
        setPermissionStates((p) => ({ ...p, camera: "denied" }));
      }
    }

    // 3. Request Notification Permission
    if (typeof Notification !== "undefined" && Notification.requestPermission) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionStates((p) => ({
          ...p,
          notification: perm === "granted" ? "granted" : "denied"
        }));
      } catch (err) {
        console.warn("Notification permission error:", err);
      }
    }

    setIsRequestingPermissions(false);
    localStorage.setItem("kcal_permissions_dialog_handled", "true");
    setShowPermissionDialog(false);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      alert("Untuk memasang aplikasi Kcal di layar utama HP:\n\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas browser\n2. Pilih 'Pasang Aplikasi' atau 'Tambahkan ke Layar Utama'");
    }
  };

  // ═══ 1. SPLASH SCREEN EFFECT (Auto transitions after 2.4s) ═══
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("login");
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Handle Login with Cloud Firestore
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginIdentifier.trim()) {
      setAuthError("Silakan masukkan alamat email Anda");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginIdentifier.trim())) {
      setAuthError("Format alamat email tidak valid (contoh: nama@domain.com)");
      return;
    }
    if (!loginPassword.trim()) {
      setAuthError("Silakan masukkan kata sandi");
      return;
    }
    if (!loginDistrict) {
      setAuthError("Silakan pilih kecamatan domisili Anda");
      return;
    }

    setIsSubmittingAuth(true);
    const res = await loginCitizenFromFirestore(loginIdentifier.trim(), loginPassword, loginDistrict);
    setIsSubmittingAuth(false);

    if (res.success && res.user) {
      setCitizenUser(res.user);
      setCurrentScreen("main");
    } else {
      setAuthError(res.error || "Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.");
    }
  };



  // Handle Register with Strict Validation & Cloud Firestore Sync
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const errors: Record<string, string> = {};

    // 1. Validasi Nama Lengkap
    if (!regFullName.trim()) {
      errors.fullName = "Nama lengkap wajib diisi";
    } else if (regFullName.trim().length < 3) {
      errors.fullName = "Nama lengkap minimal 3 karakter";
    }

    // 2. Validasi Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim()) {
      errors.email = "Alamat email wajib diisi";
    } else if (!emailRegex.test(regEmail.trim())) {
      errors.email = "Format email tidak valid (contoh: nama@domain.com)";
    }

    // 3. Validasi Nomor WhatsApp / Telp
    const cleanPhone = regPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.phone = "Nomor WhatsApp wajib diisi";
    } else if (cleanPhone.length < 10 || cleanPhone.length > 14) {
      errors.phone = "Nomor WhatsApp wajib 10–14 digit angka";
    } else if (!cleanPhone.startsWith("08") && !cleanPhone.startsWith("62")) {
      errors.phone = "Harus diawali 08... atau 62...";
    }

    // 4. Validasi Kecamatan Domisili
    if (!regDistrict) {
      errors.district = "Kecamatan domisili wajib dipilih";
    }

    // 5. Validasi Kata Sandi
    if (!regPassword) {
      errors.password = "Kata sandi wajib diisi";
    } else if (regPassword.length < 6) {
      errors.password = "Kata sandi minimal 6 karakter";
    }

    // 6. Validasi Konfirmasi Kata Sandi
    if (!regConfirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi wajib diisi";
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi tidak cocok!";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setAuthError("Harap lengkapi dan perbaiki kolom yang bertanda merah");
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
      // 1. Pre-fill login credentials with registered data
      setLoginIdentifier(regEmail.trim());
      setLoginDistrict(regDistrict);
      setLoginPassword("");

      // 2. Set success snackbar alert
      setAuthSuccessSnackbar("Pendaftaran akun berhasil! Silakan masuk dengan email dan kata sandi Anda.");
      setTimeout(() => setAuthSuccessSnackbar(null), 6000);

      // 3. Clear registration fields
      setRegFullName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegDistrict("");
      setFieldErrors({});
      setAuthError("");

      // 4. Redirect directly to LOGIN screen (not main app)
      setCurrentScreen("login");
    } else {
      setAuthError(res.error || "Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg("");
    setResetSuccessMsg("");

    if (!forgotEmail.trim()) {
      setResetErrorMsg("Silakan masukkan alamat email terdaftar Anda");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setResetErrorMsg("Format email tidak valid (contoh: nama@domain.com)");
      return;
    }
    if (!forgotDistrict) {
      setResetErrorMsg("Silakan pilih kecamatan domisili akun Anda");
      return;
    }

    setIsResettingPassword(true);
    setTimeout(() => {
      setIsResettingPassword(false);
      // Generate 6-digit OTP
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
      setInputOtp("");
      setForgotStep(2);
      setOtpResendCountdown(30);
      setSimulatedEmailNotification(randomOtp);
      setResetSuccessMsg(`Kode OTP 6-digit berhasil dikirimkan ke email ${forgotEmail.trim()}`);
    }, 700);
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg("");
    setResetSuccessMsg("");

    const cleanOtp = inputOtp.trim();
    if (!cleanOtp) {
      setResetErrorMsg("Silakan masukkan 6 digit kode OTP");
      return;
    }
    if (cleanOtp !== generatedOtp) {
      setResetErrorMsg("Kode verifikasi OTP salah atau telah kadaluarsa. Silakan periksa kembali.");
      return;
    }

    setForgotStep(3);
    setResetSuccessMsg("Email Anda berhasil diverifikasi! Silakan buat kata sandi baru.");
    setTimeout(() => setResetSuccessMsg(""), 3000);
  };

  // Step 3: Save New Password & Sync to Cloud Firestore
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
      setTimeout(() => {
        setResetSuccessMsg("");
        setForgotStep(1);
        setCurrentScreen("login");
      }, 1500);
    } else {
      setResetErrorMsg(res.error || "Gagal mengatur ulang kata sandi. Pastikan email Anda sudah terdaftar.");
    }
  };

  // Quick AI Screening Calculation
  const handleCalculateNutrition = () => {
    if (!childName.trim()) {
      alert("Silakan masukkan nama anak.");
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      const expectedHeight = 75 + childAgeMonths * 0.6;
      const heightDiff = childHeightCm - expectedHeight;

      let resultStatus: "Normal" | "Beresiko Stunting" | "Gizi Kurang" | "Sangat Baik" = "Normal";
      let color = "text-emerald-700 bg-emerald-50 border-emerald-200";
      let desc = "Tumbuh kembang anak sesuai standar usia WHO dan Kemenkes RI.";
      let recommendations = [
        "Lanjutkan pemberian makanan gizi seimbang kaya protein hewani.",
        "Rutin timbang dan ukur tinggi badan di Posyandu setiap bulan.",
        "Pastikan asupan vitamin D dan kalsium harian tercukupi."
      ];
      let localFoods = ["Ikan Bandeng Gresik", "Telur Ayam", "Tempe Kedelai Lokal", "Sayur Bayam"];

      if (heightDiff < -4) {
        resultStatus = "Beresiko Stunting";
        color = "text-red-700 bg-red-50 border-red-200";
        desc = "Tinggi badan anak berada di bawah kurva standar WHO. Perlu intervensi protein hewani intensif.";
        recommendations = [
          "Segera konsultasikan dengan petugas gizi di Puskesmas kecamatan setempat.",
          "Tingkatkan konsumsi 2 porsi protein hewani setiap hari (Ikan, Telur, Ayam).",
          "Ikuti program Pemberian Makanan Tambahan (PMT) & MBG terpadu."
        ];
        localFoods = ["Ikan Kerapu / Bandeng Segar", "Hati Ayam", "Telur Puyuh", "Kacang Hijau"];
      } else if (childWeightKg < 9.5 && childAgeMonths >= 24) {
        resultStatus = "Gizi Kurang";
        color = "text-amber-700 bg-amber-50 border-amber-200";
        desc = "Berat badan anak perlu ditingkatkan agar seimbang dengan laju pertumbuhannya.";
        recommendations = [
          "Tambahkan lemak sehat seperti minyak kelapa/margarin pada makanan utama.",
          "Beri camilan padat kalori bergizi 2 kali sehari.",
          "Periksa status imunisasi dan asupan zat besi."
        ];
      }

      setScreeningResult({
        status: resultStatus,
        score: Math.min(100, Math.max(40, Math.round(85 + heightDiff * 2))),
        color,
        description: desc,
        recommendations,
        localFoods,
      });
      setIsCalculating(false);
    }, 600);
  };

  // Submit Complaint to Firestore
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMessage.trim()) return;

    setIsSubmittingComplaint(true);
    const res = await saveComplaintToFirestore({
      senderName: citizenUser?.name || "Warga Gresik",
      senderContact: citizenUser?.email || "warga@gresik.id",
      category: complaintCategory,
      message: complaintMessage,
      status: "baru",
      createdAtIso: new Date().toISOString(),
    });

    setIsSubmittingComplaint(false);
    if (res.success) {
      setSubmittedTicket(res.docId || "TKT-" + Date.now().toString().slice(-6));
      setComplaintMessage("");
    }
  };

  return (
    <div className="fixed inset-0 sm:static sm:min-h-screen bg-white sm:bg-slate-950 flex justify-center items-center selection:bg-[#1a73e8] selection:text-white p-0 sm:p-4 overflow-hidden">
      {/* Native Mobile Smartphone Frame (Compact .APK proportions) */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full sm:max-w-[380px] sm:h-[780px] sm:max-h-[800px] bg-white sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-0 sm:border-[8px] sm:border-slate-800 flex flex-col relative overflow-hidden select-none"
      >
        
        {/* ═══ HARD RELOAD FULLSCREEN LOADING ANIMATION OVERLAY ═══ */}
        {isHardReloading && (
          <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 select-none">
            <div className="space-y-4 flex flex-col items-center">
              {/* App Logo with Pulse Radar */}
              <div className="relative">
                <div className="absolute -inset-3 rounded-2xl bg-[#1a73e8]/20 blur-md animate-ping"></div>
                <img src="/logo_app.svg" alt="Kcal" className="w-14 h-14 rounded-2xl shadow-md relative z-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-[15px] font-black text-[#071e49]">
                  Memperbarui Aplikasi Kcal...
                </h3>
                <p className="text-[11px] text-slate-500 font-medium max-w-[220px]">
                  Mengunduh pembaruan sistem terbaru dari server
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 pt-2">
                <div className="w-2 h-2 rounded-full bg-[#1a73e8] animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#1a73e8] animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#1a73e8] animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ UNIVERSAL PULL REFRESH SUCCESS TOAST (All Screens) ═══ */}
        {pullRefreshToast && (
          <div className="absolute top-10 left-3.5 right-3.5 z-[90] bg-[#071e49]/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-xl text-[11px] font-bold flex items-center justify-center gap-1.5 animate-in slide-in-from-top-3 duration-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{pullRefreshToast}</span>
          </div>
        )}

        {/* ═══ NATIVE TOP STATUS BAR (Visible on Desktop preview) ═══ */}
        <div className="hidden sm:flex h-8 px-4 pt-1.5 items-center justify-between bg-white text-slate-800 select-none shrink-0 z-50">
          <span className="text-[11px] font-bold tracking-tight">9:41</span>
          <div className="w-16 h-3 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-2.5 h-2.5" />
            <Wifi className="w-2.5 h-2.5" />
            <Battery className="w-3 h-3 fill-current" />
          </div>
        </div>

        {/* ═══ UNIVERSAL PULL-TO-REFRESH VISUAL DROP PILL (Visible on ANY screen when pulled) ═══ */}
        <div
          style={{
            height: pullY,
            opacity: pullY > 8 ? 1 : 0,
            transform: `scale(${Math.min(1, pullY / 40)})`
          }}
          className="overflow-hidden transition-all duration-150 ease-out flex items-center justify-center pointer-events-none shrink-0 z-40 bg-white/95"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/95 border border-blue-200 text-[#1a73e8] text-[10.5px] font-bold shadow-xs">
            <RefreshCw
              className={`w-3.5 h-3.5 ${isPullRefreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullY * 6}deg)` }}
            />
            <span>
              {isPullRefreshing
                ? "Menyegarkan data..."
                : pullY >= 45
                ? "Lepaskan untuk menyegarkan"
                : "Tarik untuk menyegarkan"}
            </span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 1. SCREEN: SPLASH SCREEN (Centered Logo & Native Vibes)  */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "splash" && (
          <div 
            onClick={() => setCurrentScreen("login")}
            className="flex-1 bg-gradient-to-b from-[#ffffff] via-[#f0f6ff] to-[#e8f0fe] flex flex-col items-center justify-center p-5 text-center animate-in fade-in duration-300 cursor-pointer select-none"
          >
            <div className="space-y-4 flex flex-col items-center">
              {/* App Logo with Pulse Ring */}
              <div className="relative">
                <div className="absolute -inset-3 rounded-2xl bg-[#1a73e8]/20 blur-lg animate-pulse"></div>
                <img
                  src="/logo_app.svg"
                  alt="Kcal Logo"
                  className="w-16 h-16 rounded-2xl shadow-lg relative z-10 animate-in zoom-in-75 duration-500"
                />
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1.5 relative z-10 max-w-[260px]">
                <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
                  Kcal
                </h1>
                <p className="text-[11px] font-medium text-[#071e49] leading-relaxed">
                  &ldquo;Smart screening awal indikasi malnutrisi anak melalui analisis visual pertumbuhan & kuesioner interaktif AI&rdquo;
                </p>
                <div className="pt-0.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1a73e8] text-[9.5px] font-black border border-blue-200 tracking-wide">
                    Ginofest 2026
                  </span>
                </div>
              </div>

              {/* Subtle Loading Dots */}
              <div className="flex items-center gap-1 pt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce"></div>
              </div>

              {/* Version Text below Loading Dots */}
              <div className="pt-1.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  v1.0.0
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 2. SCREEN: LOGIN (Clean Native APK Style)                */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "login" && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex-1 bg-white flex flex-col px-5 py-3 overflow-y-auto animate-in fade-in duration-200 overscroll-contain"
          >
            {/* Top Bar: Install APK Button & Country Flag */}
            <div className="flex items-center justify-between pb-2">
              {!isStandalone ? (
                <button
                  type="button"
                  onClick={handleInstallPWA}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1a73e8] text-[10.5px] font-black transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Pasang Aplikasi (.APK)</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                <span>🇮🇩</span>
                <span>ID</span>
              </div>
            </div>

            {/* GreatDay Styled Logo & Subtitle */}
            <div className="text-center space-y-1 pt-1 pb-4">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo_app.svg" alt="Kcal" className="w-9 h-9 rounded-xl shadow-xs" />
                <span className="text-[22px] font-black text-[#071e49] tracking-tight">
                  Kcal<span className="text-[#1a73e8]">.</span>
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] font-medium">
                Pantau menu MBG & gizi anak setiap hari!
              </p>
            </div>

            {/* Success Snackbar (e.g. after Registration or Password Reset) */}
            {authSuccessSnackbar && (
              <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-900">Pendaftaran Berhasil!</p>
                  <p className="text-[10.5px] text-emerald-700 leading-snug">{authSuccessSnackbar}</p>
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {authError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Alamat Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#475569] block">
                  Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-[#cbd5e1] text-[12px] text-[#071e49] font-medium focus:bg-white focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Kata Sandi */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#475569] block">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-[#cbd5e1] text-[12px] text-[#071e49] font-medium focus:bg-white focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/20 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Kecamatan / Wilayah Asal */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#475569] block">
                  Kecamatan Domisili <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={loginDistrict}
                    onChange={(e) => setLoginDistrict(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-[12px] font-medium focus:bg-white focus:outline-none transition-all cursor-pointer ${
                      !loginDistrict ? "text-slate-400 border-[#cbd5e1]" : "text-[#071e49] font-bold border-[#cbd5e1] focus:border-[#1a73e8]"
                    }`}
                  >
                    <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                    {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                      <option key={d.id} value={d.name} className="text-[#071e49] font-medium">Kecamatan {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 text-[#475569] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#1a73e8] focus:ring-0 cursor-pointer accent-[#1a73e8]"
                  />
                  <span>Tetap masuk</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginIdentifier);
                    setForgotDistrict(loginDistrict);
                    setResetErrorMsg("");
                    setResetSuccessMsg("");
                    setAuthError("");
                    setCurrentScreen("forgot_password");
                  }}
                  className="text-[#64748b] hover:text-[#1a73e8] font-semibold transition-colors cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>

              {/* Action Button: Masuk (Full Width) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12.5px] font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingAuth ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses Masuk...</span>
                    </>
                  ) : (
                    <span>Masuk</span>
                  )}
                </button>
              </div>
            </form>

            {/* Link: Register Switcher */}
            <div className="pt-5 pb-3 text-center text-[11.5px] text-[#64748b]">
              <span>Belum punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setCurrentScreen("register");
                }}
                className="text-[#1a73e8] font-black hover:underline cursor-pointer ml-1"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 3. SCREEN: REGISTER (Clean & Compact Form)               */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "register" && (
          <div className="flex-1 bg-white flex flex-col px-5 pt-4 pb-6 overflow-y-auto animate-in fade-in duration-200">
            {/* Top Navigation & Flag */}
            <div className="flex items-center justify-between pb-2 mb-1">
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setFieldErrors({});
                  setCurrentScreen("login");
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-[#071e49] transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                <span>🇮🇩</span>
                <span>ID</span>
              </div>
            </div>

            {/* Brand Logo Header */}
            <div className="text-center space-y-0.5 pt-1 pb-3">
              <div className="flex items-center justify-center gap-1.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs" />
                <span className="text-[20px] font-black text-[#071e49] tracking-tight">
                  Kcal<span className="text-[#1a73e8]">.</span>
                </span>
              </div>
              <h2 className="text-[14px] font-black text-[#071e49]">Daftar Akun Masyarakat</h2>
              <p className="text-[10px] text-[#64748b]">
                Daftarkan akun keluarga untuk memantau menu MBG & gizi anak
              </p>
            </div>

            {/* Global Error Banner if any */}
            {authError && (
              <div className="mb-2.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10.5px] font-medium flex items-center gap-1.5 animate-in shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-2.5">
              {/* 1. Nama Lengkap */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.fullName ? "border-red-400 bg-red-50/40 focus:border-red-500" : "border-[#cbd5e1] focus:border-[#1a73e8]"
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[9.5px] text-red-600 font-semibold">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* 2. Alamat Email */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.email ? "border-red-400 bg-red-50/40 focus:border-red-500" : "border-[#cbd5e1] focus:border-[#1a73e8]"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[9.5px] text-red-600 font-semibold">{fieldErrors.email}</p>
                )}
              </div>

              {/* 3. Nomor WhatsApp / Telp */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Nomor WhatsApp / HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Masukkan nomor WhatsApp"
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.phone ? "border-red-400 bg-red-50/40 focus:border-red-500" : "border-[#cbd5e1] focus:border-[#1a73e8]"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[9.5px] text-red-600 font-semibold">{fieldErrors.phone}</p>
                )}
              </div>

              {/* 4. Kecamatan Domisili */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Kecamatan Domisili <span className="text-red-500">*</span>
                </label>
                <select
                  value={regDistrict}
                  onChange={(e) => {
                    setRegDistrict(e.target.value);
                    if (fieldErrors.district) setFieldErrors((p) => ({ ...p, district: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium transition-all cursor-pointer ${
                    fieldErrors.district
                      ? "border-red-400 bg-red-50/40 text-red-700 focus:border-red-500"
                      : !regDistrict
                      ? "border-[#cbd5e1] text-slate-400"
                      : "border-[#cbd5e1] text-[#071e49] font-bold focus:border-[#1a73e8]"
                  }`}
                >
                  <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                  {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                    <option key={d.id} value={d.name} className="text-[#071e49] font-medium">Kecamatan {d.name}</option>
                  ))}
                </select>
                {fieldErrors.district && (
                  <p className="text-[9.5px] text-red-600 font-semibold">{fieldErrors.district}</p>
                )}
              </div>

              {/* 5. Kata Sandi */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                    }}
                    className={`w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none transition-all ${
                      fieldErrors.password ? "border-red-400 bg-red-50/40 focus:border-red-500" : "border-[#cbd5e1] focus:border-[#1a73e8]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[9.5px] text-red-600 font-semibold">{fieldErrors.password}</p>
                )}
              </div>

              {/* 6. Konfirmasi Kata Sandi */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi"
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    className={`w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none transition-all ${
                      fieldErrors.confirmPassword ? "border-red-400 bg-red-50/40 focus:border-red-500" : "border-[#cbd5e1] focus:border-[#1a73e8]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[9.5px] text-red-600 font-semibold">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-3 disabled:opacity-50"
              >
                {isSubmittingAuth ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <span>Daftar Akun Masyarakat</span>
                )}
              </button>
            </form>

            {/* Bottom: Login Link */}
            <div className="mt-auto pt-4 pb-1 text-center text-[11px] text-[#64748b]">
              <span>Sudah memiliki akun? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setFieldErrors({});
                  setCurrentScreen("login");
                }}
                className="text-[#1a73e8] font-bold hover:underline cursor-pointer"
              >
                Masuk di Sini
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 4. SCREEN: ATUR ULANG KATA SANDI (3-Step OTP Verification)*/}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "forgot_password" && (
          <div className="flex-1 bg-white flex flex-col px-5 pt-4 pb-6 overflow-y-auto animate-in fade-in duration-200 relative">
            {/* Simulated Email Pop-up Notification */}
            {simulatedEmailNotification && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-200 shadow-md text-slate-800 text-[11px] flex items-center justify-between gap-2 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📩</span>
                  <div>
                    <p className="font-extrabold text-[#071e49] text-[10px]">Email Masuk (Simulasi):</p>
                    <p className="text-[10px] text-slate-600">Kode OTP Anda: <span className="font-mono font-black text-[#1a73e8] tracking-widest text-[12px]">{simulatedEmailNotification}</span></p>
                  </div>
                </div>
                {forgotStep === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputOtp(simulatedEmailNotification);
                      setSimulatedEmailNotification(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[9.5px] cursor-pointer"
                  >
                    Gunakan
                  </button>
                )}
              </div>
            )}

            {/* Top Navigation & Flag */}
            <div className="flex items-center justify-between pb-2 mb-1">
              <button
                type="button"
                onClick={() => {
                  if (forgotStep === 1) {
                    setResetErrorMsg("");
                    setResetSuccessMsg("");
                    setSimulatedEmailNotification(null);
                    setCurrentScreen("login");
                  } else if (forgotStep === 2) {
                    setForgotStep(1);
                  } else if (forgotStep === 3) {
                    setForgotStep(2);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-[#071e49] transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{forgotStep === 1 ? "Kembali ke Login" : "Sebelumnya"}</span>
              </button>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                <span>🇮🇩</span>
                <span>ID</span>
              </div>
            </div>

            {/* Brand Logo Header */}
            <div className="text-center space-y-0.5 pt-1 pb-2">
              <div className="flex items-center justify-center gap-1.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs" />
                <span className="text-[20px] font-black text-[#071e49] tracking-tight">
                  Kcal<span className="text-[#1a73e8]">.</span>
                </span>
              </div>
              <h2 className="text-[14px] font-black text-[#071e49]">Atur Ulang Kata Sandi</h2>
              <p className="text-[10px] text-[#64748b]">
                Verifikasi akun via email & Cloud Firestore
              </p>
            </div>

            {/* 3-Step Progress Indicator */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold">
              <div className={`flex items-center gap-1 ${forgotStep >= 1 ? "text-[#1a73e8]" : "text-slate-400"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 1 ? "bg-[#1a73e8] text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
                <span>Email</span>
              </div>
              <div className="w-3 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-1 ${forgotStep >= 2 ? "text-[#1a73e8]" : "text-slate-400"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 2 ? "bg-[#1a73e8] text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
                <span>OTP</span>
              </div>
              <div className="w-3 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-1 ${forgotStep === 3 ? "text-[#1a73e8]" : "text-slate-400"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep === 3 ? "bg-[#1a73e8] text-white" : "bg-slate-200 text-slate-500"}`}>3</span>
                <span>Sandi Baru</span>
              </div>
            </div>

            {/* Error & Success Feedback Alerts */}
            {resetErrorMsg && (
              <div className="mb-2.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10.5px] font-medium flex items-center gap-1.5 animate-in shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                <span>{resetErrorMsg}</span>
              </div>
            )}
            {resetSuccessMsg && (
              <div className="mb-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-medium flex items-center gap-1.5 animate-in zoom-in-95">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* ═══ TAHAP 1: INPUT EMAIL & KECAMATAN ═══ */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-slate-700 block">
                    Alamat Email Terdaftar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Masukkan alamat email akun"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-[#cbd5e1] text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-slate-700 block">
                    Kecamatan Domisili <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={forgotDistrict}
                    onChange={(e) => setForgotDistrict(e.target.value)}
                    required
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 border text-[11.5px] font-medium transition-all cursor-pointer ${
                      !forgotDistrict ? "text-slate-400 border-[#cbd5e1]" : "text-[#071e49] font-bold border-[#cbd5e1] focus:border-[#1a73e8]"
                    }`}
                  >
                    <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                    {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                      <option key={d.id} value={d.name} className="text-[#071e49] font-medium">Kecamatan {d.name}</option>
                    ))}
                  </select>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-relaxed pt-0.5">
                  Kami akan mengirimkan 6 digit kode OTP ke email di atas untuk memvalidasi kepemilikan akun.
                </p>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[12px] shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isResettingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim Kode...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Kode OTP ke Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ═══ TAHAP 2: INPUT KODE VERIFIKASI (OTP) ═══ */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 animate-in fade-in duration-200">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[10.5px] text-blue-900 leading-relaxed">
                  Kode verifikasi 6 digit telah dikirimkan ke <span className="font-bold">{forgotEmail}</span>.
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-700 block text-center">
                    Masukkan 6 Digit Kode OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border-2 border-[#1a73e8]/30 focus:border-[#1a73e8] text-center font-mono text-[18px] tracking-[0.3em] font-black text-[#071e49] focus:bg-white focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300"
                  />
                </div>

                {/* Resend OTP button & timer */}
                <div className="text-center text-[10.5px] text-slate-500">
                  {otpResendCountdown > 0 ? (
                    <span>Kirim ulang kode dalam <strong className="text-[#1a73e8]">{otpResendCountdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleSendOtp(e)}
                      className="text-[#1a73e8] font-bold hover:underline cursor-pointer"
                    >
                      Kirim Ulang Kode OTP
                    </button>
                  )}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] transition-colors cursor-pointer text-center"
                  >
                    Ubah Email
                  </button>
                  <button
                    type="submit"
                    disabled={inputOtp.length < 6}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[12px] shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>Verifikasi</span>
                  </button>
                </div>
              </form>
            )}

            {/* ═══ TAHAP 3: BUAT KATA SANDI BARU ═══ */}
            {forgotStep === 3 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[10.5px] text-emerald-900 leading-relaxed">
                  ✅ Email terverifikasi. Masukkan kata sandi baru untuk akun Anda.
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-slate-700 block">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotPass ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-[#cbd5e1] text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showForgotPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-slate-700 block">
                    Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPass ? "text" : "password"}
                      placeholder="Ulangi kata sandi baru"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-[#cbd5e1] text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showForgotConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetErrorMsg("");
                      setResetSuccessMsg("");
                      setForgotStep(1);
                      setCurrentScreen("login");
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[12px] shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isResettingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Sandi Baru</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 5. SCREEN: MAIN APP (Logged in Citizen Portal)           */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "main" && (
          <div className="flex-1 flex flex-col bg-[#f8fafc] h-full overflow-hidden relative">
            {/* Top Bar Header */}
            <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs z-30 pt-safe sm:pt-2.5">
              <div className="flex items-center gap-2.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs" />
                <div>
                  <h3 className="text-[12.5px] font-black text-[#071e49] leading-tight">
                    {citizenUser?.name || "Warga Gresik"}
                  </h3>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-[#1a73e8]" />
                    <span>Kec. {citizenUser?.district || "Kebomas"}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("kcal_active_citizen_user");
                  sessionStorage.setItem("kcal_citizen_screen", "login");
                  setCitizenUser(null);
                  setCurrentScreen("login");
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                title="Keluar Sesi"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </header>

            {/* Pull Refresh Success Toast */}
            {pullRefreshToast && (
              <div className="absolute top-12 left-4 right-4 z-50 bg-[#071e49]/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-xl text-[11px] font-bold flex items-center justify-center gap-1.5 animate-in slide-in-from-top-3 duration-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{pullRefreshToast}</span>
              </div>
            )}

            {/* Main Tabs Container with Native Pull-to-Refresh */}
            <main
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex-1 p-3.5 space-y-3.5 overflow-y-auto pb-6 overscroll-contain"
            >
              {/* TAB 1: BERANDA WARGA */}
              {activeTab === "home" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Greeting Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#071e49] to-[#1a73e8] text-white space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-blue-100">
                        Program MBG Gresik 2026
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-[14px] font-black leading-tight">Pantau Tumbuh Kembang & Menu Gizi Anak</h2>
                      <p className="text-[10.5px] text-blue-100 mt-0.5 leading-relaxed">
                        Akses jadwal menu MBG sekolah, skrining gizi instan berbasis AI, dan sampaikan pengaduan.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("screening")}
                      className="w-full py-2 bg-white text-[#071e49] hover:bg-blue-50 font-bold text-[11.5px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span>Mulai Cek Status Gizi Anak</span>
                    </button>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <button
                      onClick={() => setActiveTab("screening")}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1 transition-all cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1a73e8] flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-[#071e49] leading-tight">Cek Gizi AI</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("menu")}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1 transition-all cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Utensils className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-[#071e49] leading-tight">Menu MBG</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("complaint")}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1 transition-all cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-[#071e49] leading-tight">Aduan</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("ai_chat")}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1 transition-all cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-[#071e49] leading-tight">Tanya AI</span>
                    </button>
                  </div>

                  {/* Menu MBG Hari Ini */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-[#1a73e8]" />
                        <h3 className="text-[12px] font-bold text-[#071e49]">Menu MBG Hari Ini</h3>
                      </div>
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        680 kkal
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <h4 className="text-[11.5px] font-bold text-[#071e49]">Nasi Pulen + Bandeng Bakar Madu Gresik</h4>
                      <p className="text-[10.5px] text-slate-600">Sayur Bening Bayam Jagung Manis + Tempe Bacem + Jeruk</p>
                      <div className="flex items-center gap-2 pt-0.5 text-[9.5px] font-medium text-slate-500">
                        <span>Protein: <strong>26.4g</strong></span>
                        <span>•</span>
                        <span>Kalsium: <strong>140mg</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI CEK STUNTING MANDIRI */}
              {activeTab === "screening" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1a73e8] flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-[#071e49]">Skrining Gizi & Stunting AI</h3>
                        <p className="text-[10px] text-slate-500">Standar Antropometri WHO & Kemenkes RI</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Nama Lengkap Anak</label>
                        <input
                          type="text"
                          placeholder="Contoh: Muhammad Rayhan"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Jenis Kelamin</label>
                          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setChildGender("L")}
                              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${childGender === "L" ? "bg-white text-[#1a73e8] shadow-2xs" : "text-slate-500"}`}
                            >
                              Laki-laki
                            </button>
                            <button
                              type="button"
                              onClick={() => setChildGender("P")}
                              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${childGender === "P" ? "bg-white text-pink-600 shadow-2xs" : "text-slate-500"}`}
                            >
                              Perempuan
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Usia (Bulan)</label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={childAgeMonths}
                            onChange={(e) => setChildAgeMonths(Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Berat Badan (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={childWeightKg}
                            onChange={(e) => setChildWeightKg(Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Tinggi Badan (cm)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={childHeightCm}
                            onChange={(e) => setChildHeightCm(Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCalculateNutrition}
                        disabled={isCalculating}
                        className="w-full py-2 bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[11.5px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
                      >
                        {isCalculating ? "Menganalisis Kurva WHO..." : "Analisis Status Gizi"}
                      </button>
                    </div>
                  </div>

                  {/* Screening Result Card */}
                  {screeningResult && (
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400">Hasil Evaluasi</span>
                          <h4 className="text-[13px] font-black text-[#071e49]">{childName}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${screeningResult.color}`}>
                          {screeningResult.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {screeningResult.description}
                      </p>

                      <div className="space-y-1">
                        <h5 className="text-[10.5px] font-bold text-[#071e49]">Rekomendasi Tindakan:</h5>
                        <ul className="text-[10px] text-slate-600 space-y-0.5 pl-4 list-disc">
                          {screeningResult.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MENU MBG */}
              {activeTab === "menu" && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
                    <h3 className="text-[13px] font-black text-[#071e49]">Jadwal Menu MBG Mingguan</h3>
                    <p className="text-[10px] text-slate-500">Kecamatan {citizenUser?.district || "Kebomas"}</p>
                  </div>

                  {[
                    { day: "Senin", menu: "Nasi Pulen + Bandeng Bakar Madu Gresik", side: "Sayur Bening Bayam + Tempe Bacem + Jeruk", cal: "680 kkal" },
                    { day: "Selasa", menu: "Nasi Gurih + Ayam Suwir Bumbu Kuning", side: "Tumis Buncis Jagung + Tahu Kukus + Semangka", cal: "695 kkal" },
                    { day: "Rabu", menu: "Nasi Putih + Rolade Ikan Kerapu Segar", side: "Sayur Sop Wortel Kentang + Telur Puyuh + Pisang", cal: "675 kkal" },
                    { day: "Kamis", menu: "Nasi Uduk + Telur Dadar Sayur Tebal", side: "Capcay Sayuran Segar + Tempe Mendoan + Melon", cal: "660 kkal" },
                    { day: "Jumat", menu: "Nasi Putih + Semur Daging Sapi Lokal", side: "Sayur Lodeh Labu Siam + Kerupuk Udang + Pepaya", cal: "710 kkal" },
                  ].map((m, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#071e49] text-white text-[9.5px] font-bold">{m.day}</span>
                        <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{m.cal}</span>
                      </div>
                      <h4 className="text-[11.5px] font-bold text-[#071e49]">{m.menu}</h4>
                      <p className="text-[10.5px] text-slate-500">{m.side}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ADUAN */}
              {activeTab === "complaint" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-[#071e49]">Aduan & Masukan Program MBG</h3>
                        <p className="text-[10px] text-slate-500">Langsung masuk ke Dashboard Super Admin</p>
                      </div>
                    </div>

                    {submittedTicket ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                        <h4 className="text-[12px] font-bold text-emerald-800">Laporan Terkirim!</h4>
                        <p className="text-[10.5px] text-emerald-700">
                          Nomor Tiket: <strong className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{submittedTicket}</strong>
                        </p>
                        <button
                          onClick={() => setSubmittedTicket(null)}
                          className="mt-1 px-3 py-1 bg-emerald-600 text-white rounded-xl text-[10.5px] font-bold"
                        >
                          Kirim Aduan Baru
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitComplaint} className="space-y-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Kategori Aduan</label>
                          <select
                            value={complaintCategory}
                            onChange={(e) => setComplaintCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] font-bold text-[#071e49]"
                          >
                            <option value="Kualitas Menu MBG">Kualitas & Rasa Makanan MBG</option>
                            <option value="Ketepatan Waktu">Keterlambatan Pengiriman Menu</option>
                            <option value="Porsi Makanan">Porsi Makanan Kurang Sesuai</option>
                            <option value="Saran & Masukan">Saran & Masukan</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Isi Keluhan</label>
                          <textarea
                            rows={3}
                            placeholder="Tuliskan keluhan atau saran Anda..."
                            value={complaintMessage}
                            onChange={(e) => setComplaintMessage(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[11.5px] font-medium text-[#071e49]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingComplaint}
                          className="w-full py-2 bg-[#071e49] text-white text-[11.5px] font-bold rounded-xl shadow-2xs"
                        >
                          {isSubmittingComplaint ? "Mengirim Laporan..." : "Kirim Laporan Resmi"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: TANYA AI */}
              {activeTab === "ai_chat" && (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-[#071e49]">K-Bot Asisten Gizi AI</h3>
                      <p className="text-[10px] text-slate-500">Tanya seputar MPASI & gizi pangan lokal Gresik</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                    <span className="font-bold">Halo Bunda/Ayah! 🤖</span> Saya K-Bot. Konsultasikan kebutuhan nutrisi si kecil atau cari resep bergizi murah khas Gresik di sini.
                  </div>

                  <div className="space-y-1">
                    {[
                      "Ikan apa yang paling tinggi protein di Gresik untuk balita?",
                      "Bagaimana cara mengatasi anak yang susah makan sayur?",
                      "Berapa takaran MPASI untuk anak usia 12 bulan?",
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert(`Pertanyaan: "${q}"\n\nJawaban K-Bot: Ikan Bandeng dan Kerapu Gresik memiliki kandungan asam lemak Omega-3 dan Protein tinggi 20g/100g yang sangat baik untuk kecerdasan otak balita.`)}
                        className="w-full text-left p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700 font-medium shadow-2xs hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      >
                        💡 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Bottom Navigation Bar & Native Home Indicator (Fixed in Flex Column, Non-overlapping) */}
            <div className="shrink-0 bg-white border-t border-slate-200 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe-nav pt-1.5">
              <nav className="px-2 flex items-center justify-around">
                {[
                  { id: "home", label: "Beranda", icon: Home },
                  { id: "screening", label: "Cek Gizi", icon: Activity },
                  { id: "menu", label: "Menu MBG", icon: Utensils },
                  { id: "complaint", label: "Aduan", icon: MessageSquare },
                  { id: "ai_chat", label: "Tanya AI", icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as MobileTab)}
                      className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
                        isActive ? "text-[#1a73e8] font-black" : "text-slate-400 font-semibold hover:text-slate-600"
                      }`}
                    >
                      <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-blue-50 text-[#1a73e8]" : "text-slate-400"}`}>
                        <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
                      </div>
                      <span className="text-[10px] tracking-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              {/* Native Home Indicator Bar (Desktop preview) */}
              <div className="hidden sm:block pb-1 pt-0.5">
                <div className="w-28 h-1 rounded-full bg-slate-300 mx-auto"></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FLOATING PWA / APK INSTALL BANNER ═══ */}
        {showInstallBanner && !isStandalone && (
          <div className="absolute bottom-3 left-3 right-3 z-50 bg-[#071e49]/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-blue-400/30 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[11.5px] font-black text-white leading-tight flex items-center gap-1.5 truncate">
                  <span>Pasang Aplikasi Kcal</span>
                  <span className="text-[8.5px] px-1.5 py-0.2 bg-emerald-500 text-white rounded font-bold uppercase">APK</span>
                </h4>
                <p className="text-[10px] text-blue-200 truncate">Akses cepat di layar utama HP</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleInstallPWA}
                className="px-2.5 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[10.5px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Pasang</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Tutup banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ IOS INSTALL GUIDE MODAL ═══ */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 text-center animate-in slide-in-from-bottom-6 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a73e8] mx-auto flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-black text-[#071e49]">Pasang di Layar Utama iPhone</h3>
                <p className="text-[11px] text-slate-500">Jadikan Kcal seperti aplikasi bawaan iOS:</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl text-left text-[11px] space-y-2.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-[#1a73e8] mx-0.5" /> di Safari.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Pilih opsi <strong>&quot;Tambah ke Layar Utama&quot;</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Ketuk <strong>&quot;Tambah&quot;</strong> di pojok kanan atas.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 bg-[#071e49] hover:bg-[#1a73e8] text-white rounded-xl font-bold text-[12px] transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}

        {/* ═══ NATIVE DEVICE PERMISSIONS REQUEST MODAL (.APK EXPERIENCE) ═══ */}
        {showPermissionDialog && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-300 text-left">
              {/* Header with App Logo */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-9 h-9 rounded-2xl shadow-xs shrink-0" />
                <div>
                  <h3 className="text-[13.5px] font-black text-[#071e49] leading-tight">
                    Izin Akses Aplikasi Kcal
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Ginofest 2026 • Pemkab Gresik
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Untuk pengalaman optimal layaknya aplikasi mobile native, Kcal memerlukan izin perangkat berikut:
              </p>

              {/* Permission List */}
              <div className="space-y-2">
                {/* 1. Kamera & Galeri */}
                <div className="flex items-start gap-2 p-2 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#1a73e8] flex items-center justify-center shrink-0 mt-0.5">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#071e49]">Kamera & Galeri Foto</h4>
                    <p className="text-[9.5px] text-slate-500 leading-tight">
                      Diperlukan untuk skrining visual stunting & upload foto aduan.
                    </p>
                  </div>
                </div>

                {/* 2. Lokasi GPS */}
                <div className="flex items-start gap-2 p-2 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#071e49]">Lokasi Wilayah (GPS)</h4>
                    <p className="text-[9.5px] text-slate-500 leading-tight">
                      Mendeteksi kecamatan domisili Anda di Gresik secara otomatis.
                    </p>
                  </div>
                </div>

                {/* 3. Notifikasi */}
                <div className="flex items-start gap-2 p-2 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#071e49]">Notifikasi Pengingat</h4>
                    <p className="text-[9.5px] text-slate-500 leading-tight">
                      Update jadwal menu MBG harian dan status tindak lanjut aduan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleGrantAllPermissions}
                  disabled={isRequestingPermissions}
                  className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[12px] rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Izinkan Semua Izin Perangkat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("kcal_permissions_dialog_handled", "true");
                    setShowPermissionDialog(false);
                  }}
                  className="w-full py-1.5 text-slate-500 hover:text-slate-700 font-semibold text-[10.5px] cursor-pointer text-center"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
