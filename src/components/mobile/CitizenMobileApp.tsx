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
  ArrowRight,
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
  Image as ImageIcon,
  Moon,
  Sun,
  Sunrise,
  Sunset
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import {
  saveComplaintToFirestore,
  registerCitizenToFirestore,
  loginCitizenFromFirestore,
  resetCitizenPasswordInFirestore,
} from "@/services/firebase-service";

type AppScreen = "splash" | "splash1" | "splash2" | "onboarding1" | "onboarding2" | "onboarding3" | "login" | "register" | "forgot_password" | "main";
type MobileTab = "home" | "menu" | "screening" | "ai_chat" | "profile" | "complaint";

export const CitizenMobileApp: React.FC = () => {
  // Screen state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash1");
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
      if (savedScreen && !["splash", "splash1", "splash2", "onboarding1", "onboarding2", "onboarding3"].includes(savedScreen)) {
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
    if (!["splash", "splash1", "splash2", "onboarding1", "onboarding2", "onboarding3"].includes(currentScreen)) {
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

  // Dynamic Atmosphere State (Suasana Malam / Pagi / Siang / Sore) matching web dashboard
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("night");
  const [greetingText, setGreetingText] = useState("Selamat Malam");
  const [greetingEmoji, setGreetingEmoji] = useState("🌙");
  const [currentTimeStr, setCurrentTimeStr] = useState("01.24 WIB");
  const [currentDateStr, setCurrentDateStr] = useState("Minggu, 30 Agu 2026");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours >= 5 && hours < 11) {
        setTimeOfDay("morning");
        setGreetingText("Selamat Pagi");
        setGreetingEmoji("🌅");
      } else if (hours >= 11 && hours < 15) {
        setTimeOfDay("afternoon");
        setGreetingText("Selamat Siang");
        setGreetingEmoji("☀️");
      } else if (hours >= 15 && hours < 18) {
        setTimeOfDay("evening");
        setGreetingText("Selamat Sore");
        setGreetingEmoji("🌇");
      } else {
        setTimeOfDay("night");
        setGreetingText("Selamat Malam");
        setGreetingEmoji("🌙");
      }

      const pad = (n: number) => n.toString().padStart(2, "0");
      setCurrentTimeStr(`${pad(now.getHours())}.${pad(now.getMinutes())} WIB`);

      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      setCurrentDateStr(`${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`);
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

      // JIKA TIDAK ADA DEPLOY BARU: Cukup refresh data secara instan tanpa reload dan tanpa snackbar
      await new Promise((resolve) => setTimeout(resolve, 400));
      setIsPullRefreshing(false);
      setPullY(0);
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

  // ═══ 1. SPLASH SCREEN (Manual Interactive Navigation via Stepper & Buttons) ═══

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
    <div className="fixed inset-0 sm:static sm:min-h-screen bg-[#F8FAFC] sm:bg-slate-950 flex justify-center items-center selection:bg-green-02/30 selection:text-ford-blue p-0 sm:p-4 overflow-hidden font-sans">
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
                <div className="absolute -inset-3 rounded-2xl bg-green-02/20 blur-md animate-ping"></div>
                <img src="/logo_app.svg" alt="Kcal" className="w-14 h-14 rounded-2xl shadow-md relative z-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-[15px] font-bold text-ford-blue">
                  Memperbarui Aplikasi Kcal...
                </h3>
                <p className="text-[11px] text-blue-gray font-medium max-w-[220px]">
                  Mengunduh pembaruan sistem terbaru dari server
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 pt-2">
                <div className="w-2 h-2 rounded-full bg-green-02 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-light-sea-green animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-ford-blue animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ NATIVE TOP STATUS BAR (Visible on Desktop preview) ═══ */}
        <div className="hidden sm:flex h-8 px-4 pt-1.5 items-center justify-between bg-white text-ford-blue select-none shrink-0 z-50">
          <span className="text-[11px] font-bold tracking-tight">9:41</span>
          <div className="w-16 h-3 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
          </div>
          <div className="flex items-center gap-1.5 text-blue-gray">
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-tint/95 border border-green-02/30 text-ford-blue text-[10.5px] font-bold shadow-xs">
            <RefreshCw
              className={`w-3.5 h-3.5 text-light-sea-green ${isPullRefreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullY * 6}deg)` }}
            />
            <span>
              {isPullRefreshing
                ? "Menyegarkan data..."
                : pullY >= 45
                ? "Lepaskan untuk memuat ulang"
                : "Tarik untuk segarkan"}
            </span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 1A. SCREEN: SPLASH SCREEN 01 (Screening & Deteksi Gizi)   */}
        {/* ═════════════════════════════════════════════════════════ */}
        {(currentScreen === "splash" || currentScreen === "splash1") && (
          <div className="flex-1 relative flex flex-col justify-between select-none font-sans overflow-hidden bg-white animate-in fade-in duration-300">
            {/* Top Sunburst Rays Background Layer */}
            <div className="absolute top-0 left-0 right-0 h-[52%] overflow-hidden pointer-events-none select-none z-0">
              <img
                src="/Frame 4.svg"
                alt="Radiant Background"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Top Status & Controls Bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
                <img src="/logo_app.svg" alt="Kcal" className="w-4 h-4 rounded-md" />
                <span className="text-[12px] font-black text-ford-blue tracking-tight">Kcal</span>
              </div>

              <button
                onClick={() => setCurrentScreen("login")}
                className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-slate-50 text-ford-blue font-bold text-[11px] border border-slate-200/80 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Lewati
              </button>
            </div>

            {/* Center Emblem Illustration Layer (Clean Shield) */}
            <div className="relative z-10 flex-1 flex items-center justify-center pt-2 pb-1">
              <div className="w-[220px] sm:w-[240px] max-w-[70vw] aspect-square flex items-center justify-center animate-in zoom-in-95 duration-500">
                <img
                  src="/shield-1.svg"
                  alt="Emblem Shield"
                  className="w-full h-full object-contain filter drop-shadow-md pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Bottom Content Area: Information, Stepper & Button */}
            <div className="relative z-10 bg-white px-6 pt-2 pb-6 space-y-4 text-center">
              {/* Badge, Title & Description */}
              <div className="space-y-2">
                <div className="inline-block">
                  <span className="px-3.5 py-1 rounded-full bg-green-tint text-ford-blue text-[10.5px] font-bold border border-green-02/40 tracking-wide shadow-2xs">
                    Ginofest 2026 • Inovasi Pemkab Gresik
                  </span>
                </div>

                <h1 className="text-[22px] font-black text-ford-blue tracking-tight leading-snug">
                  Smart Screening & Deteksi Gizi
                </h1>

                <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed max-w-[310px] mx-auto">
                  Deteksi dini indikasi malnutrisi & risiko stunting anak melalui analisis visual AI terstandarisasi Kemenkes RI.
                </p>
              </div>

              {/* Stepper Dots & Action Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {/* Interactive Stepper Indicator Dots */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("splash1")}
                    className="w-6 h-2.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green transition-all duration-300 shadow-2xs cursor-pointer"
                    title="Halaman 1: Deteksi Gizi"
                    aria-label="Halaman 1"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("splash2")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Halaman 2: Menu MBG"
                    aria-label="Halaman 2"
                  />
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("splash2")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[12.5px] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Version Footer */}
              <div className="pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  v1.0.0 • Kcal Gresik
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 1B. SCREEN: SPLASH SCREEN 02 (Rekomendasi Menu MBG Lokal) */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "splash2" && (
          <div className="flex-1 relative flex flex-col justify-between select-none font-sans overflow-hidden bg-white animate-in fade-in duration-300">
            {/* Top Sunburst Rays Background Layer */}
            <div className="absolute top-0 left-0 right-0 h-[52%] overflow-hidden pointer-events-none select-none z-0">
              <img
                src="/Frame 4.svg"
                alt="Radiant Background"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Top Status & Controls Bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
                <img src="/logo_app.svg" alt="Kcal" className="w-4 h-4 rounded-md" />
                <span className="text-[12px] font-black text-ford-blue tracking-tight">Kcal</span>
              </div>

              <button
                onClick={() => setCurrentScreen("login")}
                className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-slate-50 text-ford-blue font-bold text-[11px] border border-slate-200/80 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Lewati
              </button>
            </div>

            {/* Center Emblem Illustration Layer (Shield with Floating Vitamin Bubbles) */}
            <div className="relative z-10 flex-1 flex items-center justify-center pt-2 pb-1">
              <div className="w-[220px] sm:w-[240px] max-w-[70vw] aspect-square flex items-center justify-center animate-in zoom-in-95 duration-500">
                <img
                  src="/shield.svg"
                  alt="Emblem Shield with Nutrients"
                  className="w-full h-full object-contain filter drop-shadow-md pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Bottom Content Area: Information, Stepper & Button */}
            <div className="relative z-10 bg-white px-6 pt-2 pb-6 space-y-4 text-center">
              {/* Badge, Title & Description */}
              <div className="space-y-2">
                <div className="inline-block">
                  <span className="px-3.5 py-1 rounded-full bg-green-tint text-ford-blue text-[10.5px] font-bold border border-green-02/40 tracking-wide shadow-2xs">
                    Nutrisi Formula 5 Bintang • Komoditas Gresik
                  </span>
                </div>

                <h1 className="text-[22px] font-black text-ford-blue tracking-tight leading-snug">
                  Makan Bergizi Gratis (MBG)
                </h1>

                <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed max-w-[310px] mx-auto">
                  Rekomendasi pemenuhan nutrisi seimbang harian anak berbasis komoditas pangan pasar lokal 18 kecamatan.
                </p>
              </div>

              {/* Stepper Dots & Action Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {/* Interactive Stepper Indicator Dots */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("splash1")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Halaman 1: Deteksi Gizi"
                    aria-label="Halaman 1"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("splash2")}
                    className="w-6 h-2.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green transition-all duration-300 shadow-2xs cursor-pointer"
                    title="Halaman 2: Menu MBG"
                    aria-label="Halaman 2"
                  />
                </div>

                {/* Next to Onboarding Button */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("onboarding1")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[12.5px] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Version Footer */}
              <div className="pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  v1.0.0 • Kcal Gresik
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 2A. SCREEN: ONBOARDING 01 (Masyarakat)                    */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "onboarding1" && (
          <div className="flex-1 bg-gradient-to-b from-[#FFFFFF] via-[#F4FDF9] to-[#F8FAFC] flex flex-col justify-between p-6 text-center select-none font-sans relative overflow-hidden animate-in fade-in duration-300">
            {/* Top Bar: Brand Badge & Skip Button */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
                <img src="/logo_app.svg" alt="Kcal" className="w-4 h-4 rounded-md" />
                <span className="text-[12px] font-black text-ford-blue tracking-tight">Kcal</span>
              </div>

              <button
                onClick={() => setCurrentScreen("login")}
                className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-slate-50 text-ford-blue font-bold text-[11px] border border-slate-200/80 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Lewati
              </button>
            </div>

            {/* Central Onboarding Illustration (onboard1.svg) */}
            <div className="my-auto py-2 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-[310px] aspect-[914/885] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-white relative p-1.5 animate-in zoom-in-95 duration-500">
                <img
                  src="/onboard1.svg"
                  alt="Onboarding 1 - Masyarakat"
                  className="w-full h-full object-contain rounded-2xl pointer-events-none select-none"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 max-w-[320px] mx-auto px-1">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-green-tint text-ford-blue text-[10.5px] font-bold border border-green-02/40 tracking-wide shadow-2xs">
                    Masyarakat
                  </span>
                </div>

                <h1 className="text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                  Wujudkan Keluarga & Lingkungan Sehat
                </h1>

                <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed">
                  Mulai langkah awal Anda untuk kesehatan yang lebih baik. Pantau kondisi gizi diri sendiri, keluarga tercinta, hingga komunitas di sekitar Anda dengan mudah dalam satu aplikasi.
                </p>
              </div>
            </div>

            {/* Bottom Controls: 3-Step Indicator & Next Button */}
            <div className="pt-3 pb-1 border-t border-slate-200/60 z-10 space-y-2.5">
              <div className="flex items-center justify-between">
                {/* Stepper Dots Indicator (Step 1 Active) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding1")}
                    className="w-6 h-2.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green transition-all duration-300 shadow-2xs cursor-pointer"
                    title="Onboarding 1"
                    aria-label="Onboarding 1"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding2")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Onboarding 2"
                    aria-label="Onboarding 2"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding3")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Onboarding 3"
                    aria-label="Onboarding 3"
                  />
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("onboarding2")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[12.5px] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Version Footer */}
              <div className="pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  v1.0.0 • Kcal Gresik
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 2B. SCREEN: ONBOARDING 02 (Deteksi Defisiensi Nutrisi)    */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "onboarding2" && (
          <div className="flex-1 bg-gradient-to-b from-[#FFFFFF] via-[#F4FDF9] to-[#F8FAFC] flex flex-col justify-between p-6 text-center select-none font-sans relative overflow-hidden animate-in fade-in duration-300">
            {/* Top Bar: Brand Badge & Skip Button */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
                <img src="/logo_app.svg" alt="Kcal" className="w-4 h-4 rounded-md" />
                <span className="text-[12px] font-black text-ford-blue tracking-tight">Kcal</span>
              </div>

              <button
                onClick={() => setCurrentScreen("login")}
                className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-slate-50 text-ford-blue font-bold text-[11px] border border-slate-200/80 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Lewati
              </button>
            </div>

            {/* Central Onboarding Illustration (onboard2.svg) */}
            <div className="my-auto py-2 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-[310px] aspect-[914/885] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-white relative p-1.5 animate-in zoom-in-95 duration-500">
                <img
                  src="/onboard2.svg"
                  alt="Onboarding 2 - Deteksi Defisiensi Nutrisi"
                  className="w-full h-full object-contain rounded-2xl pointer-events-none select-none"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 max-w-[320px] mx-auto px-1">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-ford-blue text-[10.5px] font-bold border border-blue-200/70 tracking-wide shadow-2xs">
                    Deteksi Defisiensi Nutrisi
                  </span>
                </div>

                <h1 className="text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                  Deteksi Cerdas Kebutuhan Gizi
                </h1>

                <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed">
                  Tidak perlu menebak-nebak. Analisis defisiensi nutrisi tubuh Anda secara akurat melalui teknologi pindaian cerdas (Computer Vision) dan kuesioner interaktif berbasis Generative AI.
                </p>
              </div>
            </div>

            {/* Bottom Controls: 3-Step Indicator & Next Button */}
            <div className="pt-3 pb-1 border-t border-slate-200/60 z-10 space-y-2.5">
              <div className="flex items-center justify-between">
                {/* Stepper Dots Indicator (Step 2 Active) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding1")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Onboarding 1"
                    aria-label="Onboarding 1"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding2")}
                    className="w-6 h-2.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green transition-all duration-300 shadow-2xs cursor-pointer"
                    title="Onboarding 2"
                    aria-label="Onboarding 2"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding3")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Onboarding 3"
                    aria-label="Onboarding 3"
                  />
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("onboarding3")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[12.5px] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Version Footer */}
              <div className="pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  v1.0.0 • Kcal Gresik
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* 2C. SCREEN: ONBOARDING 03 (Rekomendasi Menu Bergizi)      */}
        {/* ═════════════════════════════════════════════════════════ */}
        {currentScreen === "onboarding3" && (
          <div className="flex-1 bg-gradient-to-b from-[#FFFFFF] via-[#F4FDF9] to-[#F8FAFC] flex flex-col justify-between p-6 text-center select-none font-sans relative overflow-hidden animate-in fade-in duration-300">
            {/* Top Bar: Brand Badge & Skip Button */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-xs">
                <img src="/logo_app.svg" alt="Kcal" className="w-4 h-4 rounded-md" />
                <span className="text-[12px] font-black text-ford-blue tracking-tight">Kcal</span>
              </div>

              <button
                onClick={() => setCurrentScreen("login")}
                className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-slate-50 text-ford-blue font-bold text-[11px] border border-slate-200/80 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Lewati
              </button>
            </div>

            {/* Central Onboarding Illustration (onboard3.svg) */}
            <div className="my-auto py-2 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-[310px] aspect-[914/885] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-white relative p-1.5 animate-in zoom-in-95 duration-500">
                <img
                  src="/onboard3.svg"
                  alt="Onboarding 3 - Rekomendasi Menu Bergizi"
                  className="w-full h-full object-contain rounded-2xl pointer-events-none select-none"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 max-w-[320px] mx-auto px-1">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-amber-50 text-ford-blue text-[10.5px] font-bold border border-amber-200/80 tracking-wide shadow-2xs">
                    Rekomendasi Menu Bergizi
                  </span>
                </div>

                <h1 className="text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                  Menu Bergizi Khusus Untuk Anda
                </h1>

                <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed">
                  Dapatkan rekomendasi Makan Bergizi Gratis yang dipersonalisasi. Sistem AI kami akan merancang menu lezat yang disesuaikan persis dengan kebutuhan gizi unik harian Anda.
                </p>
              </div>
            </div>

            {/* Bottom Controls: 3-Step Indicator & Start Button */}
            <div className="pt-3 pb-1 border-t border-slate-200/60 z-10 space-y-2.5">
              <div className="flex items-center justify-between">
                {/* Stepper Dots Indicator (Step 3 Active) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding1")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Onboarding 1"
                    aria-label="Onboarding 1"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding2")}
                    className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300 cursor-pointer"
                    title="Onboarding 2"
                    aria-label="Onboarding 2"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("onboarding3")}
                    className="w-6 h-2.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green transition-all duration-300 shadow-2xs cursor-pointer"
                    title="Onboarding 3"
                    aria-label="Onboarding 3"
                  />
                </div>

                {/* Start Button */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen("login")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[13px] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mulai Sekarang</span>
                </button>
              </div>

              {/* Version Footer */}
              <div className="pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  v1.0.0 • Kcal Gresik
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
            className="flex-1 bg-white flex flex-col px-5 py-3 overflow-y-auto animate-in fade-in duration-200 overscroll-contain font-sans"
          >
            {/* Top Bar: Install APK Button & Country Flag */}
            <div className="flex items-center justify-between pb-2">
              {!isStandalone ? (
                <button
                  type="button"
                  onClick={handleInstallPWA}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-tint hover:bg-green-02/20 border border-green-02/40 text-ford-blue text-[10.5px] font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3 h-3 text-light-sea-green" />
                  <span>Pasang Aplikasi (.APK)</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-blue-gray">
                <span>🇮🇩</span>
                <span>ID</span>
              </div>
            </div>

            {/* Logo & Subtitle */}
            <div className="text-center space-y-1 pt-1 pb-4">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo_app.svg" alt="Kcal" className="w-9 h-9 rounded-xl shadow-xs" />
                <span className="text-[24px] font-bold text-ford-blue tracking-tight">
                  Kcal<span className="text-green-02">.</span>
                </span>
              </div>
              <p className="text-[12px] text-blue-gray font-medium">
                Pantau menu MBG & gizi anak setiap hari!
              </p>
            </div>

            {/* Success Snackbar */}
            {authSuccessSnackbar && (
              <div className="mb-3 p-3 rounded-2xl bg-green-tint border border-green-02/40 text-ford-blue text-[11.5px] font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-green-02 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-ford-blue">Pendaftaran Berhasil!</p>
                  <p className="text-[10.5px] text-blue-gray leading-snug">{authSuccessSnackbar}</p>
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {authError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[11px] font-medium flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-brand-red" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Alamat Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ford-blue block">
                  Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#cbd5e1] text-[12px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-1 focus:ring-green-02/30 transition-all placeholder:text-blue-gray/60"
                />
              </div>

              {/* Kata Sandi */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ford-blue block">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#F8FAFC] border border-[#cbd5e1] text-[12px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-1 focus:ring-green-02/30 transition-all placeholder:text-blue-gray/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-gray hover:text-ford-blue cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Kecamatan / Wilayah Asal */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ford-blue block">
                  Kecamatan Domisili <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={loginDistrict}
                    onChange={(e) => setLoginDistrict(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border text-[12px] font-medium focus:bg-white focus:outline-none transition-all cursor-pointer ${
                      !loginDistrict ? "text-blue-gray/60 border-[#cbd5e1]" : "text-ford-blue font-bold border-[#cbd5e1] focus:border-light-sea-green"
                    }`}
                  >
                    <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                    {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                      <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 text-blue-gray font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-light-sea-green focus:ring-0 cursor-pointer accent-light-sea-green"
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
                  className="text-blue-gray hover:text-light-sea-green font-semibold transition-colors cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>

              {/* Action Button: Masuk (Full Width) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[13px] font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="pt-5 pb-3 text-center text-[11.5px] text-blue-gray">
              <span>Belum punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setCurrentScreen("register");
                }}
                className="text-light-sea-green font-bold hover:underline cursor-pointer ml-1"
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
          <div className="flex-1 bg-white flex flex-col px-5 pt-4 pb-6 overflow-y-auto animate-in fade-in duration-200 font-sans">
            {/* Top Navigation & Flag */}
            <div className="flex items-center justify-between pb-2 mb-1">
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setFieldErrors({});
                  setCurrentScreen("login");
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-blue-gray hover:text-ford-blue transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-blue-gray">
                <span>🇮🇩</span>
                <span>ID</span>
              </div>
            </div>

            {/* Brand Logo Header */}
            <div className="text-center space-y-0.5 pt-1 pb-3">
              <div className="flex items-center justify-center gap-1.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs" />
                <span className="text-[20px] font-bold text-ford-blue tracking-tight">
                  Kcal<span className="text-green-02">.</span>
                </span>
              </div>
              <h2 className="text-[14px] font-bold text-ford-blue">Daftar Akun</h2>
              <p className="text-[10px] text-blue-gray">
                Daftarkan akun keluarga untuk memantau menu MBG & gizi anak
              </p>
            </div>

            {/* Global Error Banner if any */}
            {authError && (
              <div className="mb-2.5 p-2 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[10.5px] font-medium flex items-center gap-1.5 animate-in shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-brand-red" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-2.5">
              {/* 1. Nama Lengkap */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-ford-blue block">
                  Nama Lengkap <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.fullName ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-[#cbd5e1] focus:border-light-sea-green"
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[9.5px] text-brand-red font-semibold">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* 2. Alamat Email */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-ford-blue block">
                  Alamat Email <span className="text-brand-red">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.email ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-[#cbd5e1] focus:border-light-sea-green"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[9.5px] text-brand-red font-semibold">{fieldErrors.email}</p>
                )}
              </div>

              {/* 3. Nomor WhatsApp / Telp */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-ford-blue block">
                  Nomor WhatsApp / HP <span className="text-brand-red">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Masukkan nomor WhatsApp"
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.phone ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-[#cbd5e1] focus:border-light-sea-green"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[9.5px] text-brand-red font-semibold">{fieldErrors.phone}</p>
                )}
              </div>

              {/* 4. Kecamatan Domisili */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-ford-blue block">
                  Kecamatan Domisili <span className="text-brand-red">*</span>
                </label>
                <select
                  value={regDistrict}
                  onChange={(e) => {
                    setRegDistrict(e.target.value);
                    if (fieldErrors.district) setFieldErrors((p) => ({ ...p, district: "" }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium transition-all cursor-pointer ${
                    fieldErrors.district
                      ? "border-brand-red bg-red-50/40 text-brand-red focus:border-brand-red"
                      : !regDistrict
                      ? "border-[#cbd5e1] text-blue-gray/60"
                      : "border-[#cbd5e1] text-ford-blue font-bold focus:border-light-sea-green"
                  }`}
                >
                  <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                  {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                    <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                  ))}
                </select>
                {fieldErrors.district && (
                  <p className="text-[9.5px] text-brand-red font-semibold">{fieldErrors.district}</p>
                )}
              </div>

              {/* 5. Kata Sandi */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-ford-blue block">
                  Kata Sandi <span className="text-brand-red">*</span>
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
                    className={`w-full pl-3 pr-9 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                      fieldErrors.password ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-[#cbd5e1] focus:border-light-sea-green"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-gray hover:text-ford-blue p-1 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[9.5px] text-brand-red font-semibold">{fieldErrors.password}</p>
                )}
              </div>

              {/* 6. Konfirmasi Kata Sandi */}
              <div className="space-y-0.5">
                <label className="text-[10.5px] font-bold text-ford-blue block">
                  Konfirmasi Kata Sandi <span className="text-brand-red">*</span>
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
                    className={`w-full pl-3 pr-9 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                      fieldErrors.confirmPassword ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-[#cbd5e1] focus:border-light-sea-green"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-gray hover:text-ford-blue p-1 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[9.5px] text-brand-red font-semibold">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-3 disabled:opacity-50"
              >
                {isSubmittingAuth ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <span>Daftar Akun</span>
                )}
              </button>
            </form>

            {/* Bottom: Login Link */}
            <div className="mt-auto pt-4 pb-1 text-center text-[11px] text-blue-gray">
              <span>Sudah memiliki akun? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setFieldErrors({});
                  setCurrentScreen("login");
                }}
                className="text-light-sea-green font-bold hover:underline cursor-pointer"
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
          <div className="flex-1 bg-white flex flex-col px-5 pt-4 pb-6 overflow-y-auto animate-in fade-in duration-200 relative font-sans">
            {/* Simulated Email Pop-up Notification */}
            {simulatedEmailNotification && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-green-tint border border-green-02/40 shadow-md text-ford-blue text-[11px] flex items-center justify-between gap-2 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📩</span>
                  <div>
                    <p className="font-bold text-ford-blue text-[10px]">Email Masuk (Simulasi):</p>
                    <p className="text-[10px] text-blue-gray">Kode OTP Anda: <span className="font-mono font-bold text-light-sea-green tracking-widest text-[12px]">{simulatedEmailNotification}</span></p>
                  </div>
                </div>
                {forgotStep === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputOtp(simulatedEmailNotification);
                      setSimulatedEmailNotification(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-light-sea-green hover:bg-green-02 text-ford-blue font-bold font-bold text-[9.5px] cursor-pointer"
                  >
                    Gunakan
                  </button>
                )}
              </div>
            )}

            {/* Top Navigation */}
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-blue-gray hover:text-ford-blue transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{forgotStep === 1 ? "Kembali ke Login" : "Sebelumnya"}</span>
              </button>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-blue-gray">
                <span>🇮🇩</span>
                <span>ID</span>
              </div>
            </div>

            {/* Brand Logo Header */}
            <div className="text-center space-y-0.5 pt-1 pb-2">
              <div className="flex items-center justify-center gap-1.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs" />
                <span className="text-[20px] font-bold text-ford-blue tracking-tight">
                  Kcal<span className="text-green-02">.</span>
                </span>
              </div>
              <h2 className="text-[14px] font-bold text-ford-blue">Atur Ulang Kata Sandi</h2>
              <p className="text-[10px] text-blue-gray">
                Verifikasi akun via email & Cloud Firestore
              </p>
            </div>

            {/* 3-Step Progress Indicator */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[10px] font-bold">
              <div className={`flex items-center gap-1 ${forgotStep >= 1 ? "text-light-sea-green" : "text-blue-gray/60"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 1 ? "bg-light-sea-green text-ford-blue font-bold" : "bg-slate-200 text-slate-500"}`}>1</span>
                <span>Email</span>
              </div>
              <div className="w-3 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-1 ${forgotStep >= 2 ? "text-light-sea-green" : "text-blue-gray/60"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 2 ? "bg-light-sea-green text-ford-blue font-bold" : "bg-slate-200 text-slate-500"}`}>2</span>
                <span>OTP</span>
              </div>
              <div className="w-3 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-1 ${forgotStep === 3 ? "text-light-sea-green" : "text-blue-gray/60"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep === 3 ? "bg-light-sea-green text-ford-blue font-bold" : "bg-slate-200 text-slate-500"}`}>3</span>
                <span>Sandi Baru</span>
              </div>
            </div>

            {/* Error & Success Feedback Alerts */}
            {resetErrorMsg && (
              <div className="mb-2.5 p-2 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[10.5px] font-medium flex items-center gap-1.5 animate-in shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-brand-red" />
                <span>{resetErrorMsg}</span>
              </div>
            )}
            {resetSuccessMsg && (
              <div className="mb-2.5 p-2 rounded-xl bg-green-tint border border-green-02/40 text-ford-blue text-[10.5px] font-medium flex items-center gap-1.5 animate-in zoom-in-95">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-02" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* ═══ TAHAP 1: INPUT EMAIL & KECAMATAN ═══ */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-ford-blue block">
                    Alamat Email Terdaftar <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Masukkan alamat email akun"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#cbd5e1] text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-ford-blue block">
                    Kecamatan Domisili <span className="text-brand-red">*</span>
                  </label>
                  <select
                    value={forgotDistrict}
                    onChange={(e) => setForgotDistrict(e.target.value)}
                    required
                    className={`w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border text-[11.5px] font-medium transition-all cursor-pointer ${
                      !forgotDistrict ? "text-blue-gray/60 border-[#cbd5e1]" : "text-ford-blue font-bold border-[#cbd5e1] focus:border-light-sea-green"
                    }`}
                  >
                    <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                    {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                      <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                    ))}
                  </select>
                </div>

                <p className="text-[10.5px] text-blue-gray leading-relaxed pt-0.5">
                  Kami akan mengirimkan 6 digit kode OTP ke email di atas untuk memvalidasi kepemilikan akun.
                </p>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12.5px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
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
                <div className="p-2.5 rounded-xl bg-green-tint/80 border border-green-02/30 text-[10.5px] text-ford-blue leading-relaxed">
                  Kode verifikasi 6 digit telah dikirimkan ke <span className="font-bold">{forgotEmail}</span>.
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-ford-blue block text-center">
                    Masukkan 6 Digit Kode OTP <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] border-2 border-green-02/40 focus:border-light-sea-green text-center font-mono text-[18px] tracking-[0.3em] font-bold text-ford-blue focus:bg-white focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300"
                  />
                </div>

                {/* Resend OTP button & timer */}
                <div className="text-center text-[10.5px] text-blue-gray">
                  {otpResendCountdown > 0 ? (
                    <span>Kirim ulang kode dalam <strong className="text-light-sea-green">{otpResendCountdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleSendOtp(e)}
                      className="text-light-sea-green font-bold hover:underline cursor-pointer"
                    >
                      Kirim Ulang Kode OTP
                    </button>
                  )}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[12px] transition-colors cursor-pointer text-center"
                  >
                    Ubah Email
                  </button>
                  <button
                    type="submit"
                    disabled={inputOtp.length < 6}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12.5px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>Verifikasi</span>
                  </button>
                </div>
              </form>
            )}

            {/* ═══ TAHAP 3: BUAT KATA SANDI BARU ═══ */}
            {forgotStep === 3 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 rounded-xl bg-green-tint border border-green-02/40 text-[10.5px] text-ford-blue leading-relaxed">
                  ✅ Email terverifikasi. Masukkan kata sandi baru untuk akun Anda.
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-ford-blue block">
                    Kata Sandi Baru <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotPass ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#F8FAFC] border border-[#cbd5e1] text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-gray hover:text-ford-blue p-1 cursor-pointer"
                    >
                      {showForgotPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10.5px] font-bold text-ford-blue block">
                    Konfirmasi Kata Sandi Baru <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPass ? "text" : "password"}
                      placeholder="Ulangi kata sandi baru"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#F8FAFC] border border-[#cbd5e1] text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-gray hover:text-ford-blue p-1 cursor-pointer"
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
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[12px] transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12.5px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
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
          <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full overflow-hidden relative font-sans">
            {/* Top Bar Header for secondary tabs */}
            {activeTab !== "home" && (
              <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs z-30 font-sans">
                <div className="flex items-center gap-2.5">
                  <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs" />
                  <div>
                    <h3 className="text-[13px] font-bold text-ford-blue leading-tight">
                      {citizenUser?.name || "Warga Gresik"}
                    </h3>
                    <p className="text-[10px] text-blue-gray flex items-center gap-1 font-medium mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-light-sea-green" />
                      <span>Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
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
            )}

            {/* Main Tabs Container with Native Pull-to-Refresh */}
            <main
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex-1 p-3.5 space-y-3.5 overflow-y-auto pb-6 overscroll-contain font-sans"
            >
              {/* TAB 1: BERANDA WARGA (Exact Match of Reference UI Layout & Palette) */}
              {activeTab === "home" && (
                <div className="-m-3.5 space-y-3.5 animate-in fade-in duration-200 pb-4">
                  {/* ═══ TOP DYNAMIC ATMOSPHERE BANNER (Suasana Malam / Pagi / Siang / Sore) ═══ */}
                  <div className={`px-4 pt-3.5 pb-4 space-y-3 rounded-b-[28px] shadow-lg relative overflow-hidden text-white transition-all duration-700 ${
                    timeOfDay === "night"
                      ? "bg-gradient-to-b from-[#131C38] via-[#1E2950] to-[#2C3968] border-b border-ford-blue/80"
                      : timeOfDay === "morning"
                      ? "bg-gradient-to-b from-ford-blue via-light-sea-green to-green-02 border-b border-green-02/40"
                      : timeOfDay === "afternoon"
                      ? "bg-gradient-to-b from-ford-blue via-[#22B5AC] to-brand-blue border-b border-brand-blue/40"
                      : "bg-gradient-to-b from-ford-blue via-[#1E2950] to-brand-orange/40 border-b border-brand-orange/30"
                  }`}>
                    {/* Ambient Glows & Twinkling Stars (Night Theme) */}
                    {timeOfDay === "night" && (
                      <>
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-green-02/15 blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-light-sea-green/10 blur-2xl pointer-events-none"></div>
                        <div className="absolute top-3 left-1/4 w-1.5 h-1.5 rounded-full bg-green-02/70 animate-ping duration-1000"></div>
                        <div className="absolute top-6 right-1/4 w-1 h-1 rounded-full bg-brand-orange/90 animate-pulse"></div>
                        <div className="absolute bottom-4 right-1/3 w-1.5 h-1.5 rounded-full bg-brand-blue/60 animate-pulse"></div>
                        <div className="absolute top-4 right-12 w-1 h-1 rounded-full bg-white/80 animate-pulse"></div>
                      </>
                    )}

                    {/* Top Atmosphere Badges & Notification Button */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                        {/* Atmosphere Pill */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold shadow-inner ${
                          timeOfDay === "night"
                            ? "bg-white/10 border border-green-02/30 text-green-02"
                            : "bg-white/20 border border-white/30 text-white backdrop-blur-sm"
                        }`}>
                          {timeOfDay === "night" ? (
                            <>
                              <Moon className="w-3 h-3 text-green-02 animate-pulse" />
                              <span>Suasana Malam</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-02 animate-ping"></span>
                            </>
                          ) : timeOfDay === "morning" ? (
                            <>
                              <Sunrise className="w-3 h-3 text-brand-orange" />
                              <span>Suasana Pagi</span>
                            </>
                          ) : timeOfDay === "afternoon" ? (
                            <>
                              <Sun className="w-3 h-3 text-brand-orange" />
                              <span>Suasana Siang</span>
                            </>
                          ) : (
                            <>
                              <Sunset className="w-3 h-3 text-brand-orange" />
                              <span>Suasana Sore</span>
                            </>
                          )}
                        </span>

                        {/* Location Pill */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-bold text-blue-100 backdrop-blur-sm truncate">
                          <MapPin className="w-3 h-3 text-green-02 shrink-0" />
                          <span className="truncate">Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
                        </span>
                      </div>

                      {/* Notification Bell */}
                      <button
                        type="button"
                        onClick={() => alert(`Pemberitahuan: Menu MBG Ikan Bandeng Bakar Madu untuk siswa SD ${citizenUser?.district || "Kebomas"} telah dijadwalkan hari ini!`)}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-2xs shrink-0"
                        title="Notifikasi"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Greeting & User Name Row */}
                    <div className="relative z-10 space-y-0.5 pt-1">
                      <h1 className="text-[18px] font-bold tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                        <span>{greetingText},</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-02 via-light-sea-green to-brand-blue">
                          {citizenUser?.name || "Muhammad Nizam Setiawan"}
                        </span>
                        <span className="inline-block animate-bounce">{greetingEmoji}</span>
                      </h1>
                      <p className="text-[11px] text-blue-100/80 leading-relaxed font-medium">
                        Dashboard Pemantauan MBG & Intervensi Gizi tetap aktif dan tersinkronisasi 24/7.
                      </p>
                    </div>

                    {/* Hero Card: Today's Schedule & Real-time Clock */}
                    <div className="relative z-10 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-ford-blue space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-gray font-medium">
                            <span>Today</span>
                            <span className="font-bold text-ford-blue text-[12px]">{currentDateStr}</span>
                          </div>
                          <p className="text-[10px] text-blue-gray mt-0.5">
                            Shift: <span className="font-bold text-ford-blue">Menu MBG Siang Terdistribusi</span>
                          </p>
                        </div>

                        {/* Real-time Clock Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-ford-blue text-white text-[11px] font-mono font-bold shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-green-02 animate-pulse" />
                          <span>{currentTimeStr}</span>
                        </div>
                      </div>

                      {/* In / Out Nutritional Timing */}
                      <div className="flex items-center justify-between pt-1.5 text-[11px] font-bold border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-light-sea-green">
                          <Clock className="w-3.5 h-3.5 text-green-02" />
                          <span className="text-ford-blue font-bold">07:30</span>
                          <span className="text-blue-gray font-normal">In (Sarapan)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-red">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-ford-blue font-bold">12:00</span>
                          <span className="text-blue-gray font-normal">Out (MBG Siang)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ═══ BODY CONTENT SECTION ═══ */}
                  <div className="px-4 space-y-3.5">
                    {/* 4 Quick Actions Card with Center Dropdown Indicator */}
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs relative">
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {/* 1. Cek Gizi AI */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("screening")}
                          className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-green-02 group-hover:bg-green-tint flex items-center justify-center text-ford-blue group-hover:text-light-sea-green transition-all">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-ford-blue leading-tight">
                            Skrining Gizi
                          </span>
                        </button>

                        {/* 2. Menu MBG */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("menu")}
                          className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-green-02 group-hover:bg-green-tint flex items-center justify-center text-ford-blue group-hover:text-light-sea-green transition-all">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-ford-blue leading-tight">
                            Menu MBG
                          </span>
                        </button>

                        {/* 3. Aduan MBG */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("complaint")}
                          className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-brand-orange group-hover:bg-amber-50 flex items-center justify-center text-ford-blue group-hover:text-brand-orange transition-all">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-ford-blue leading-tight">
                            Aduan MBG
                          </span>
                        </button>

                        {/* 4. Tanya AI */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("ai_chat")}
                          className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-brand-blue group-hover:bg-blue-50 flex items-center justify-center text-ford-blue group-hover:text-brand-blue transition-all">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-ford-blue leading-tight">
                            Tanya AI
                          </span>
                        </button>
                      </div>

                      {/* Floating Chevron Center Divider */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-gray">
                        <ChevronRight className="w-3 h-3 rotate-90" />
                      </div>
                    </div>

                    {/* Dual Metric Cards (2 Cards Side-by-Side) */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {/* Card 1: Status Gizi Anak */}
                      <div
                        onClick={() => setActiveTab("screening")}
                        className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:border-green-02/60 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-[12px] font-bold text-ford-blue">Status Gizi Anak</h4>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-gray" />
                        </div>
                        <p className="text-[9.5px] text-blue-gray">Pemeriksaan Terakhir</p>
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-02 h-full rounded-full w-full"></div>
                          </div>
                          <span className="text-[10px] font-bold text-light-sea-green block text-right">Optimal / Normal</span>
                        </div>
                      </div>

                      {/* Card 2: Kebutuhan AKG */}
                      <div
                        onClick={() => setActiveTab("menu")}
                        className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:border-light-sea-green/60 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-[12px] font-bold text-ford-blue">Kecukupan AKG</h4>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-gray" />
                        </div>
                        <p className="text-[9.5px] text-blue-gray">Target Harian MBG</p>
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-light-sea-green h-full rounded-full w-[95%]"></div>
                          </div>
                          <span className="text-[10px] font-bold text-light-sea-green block text-right">95% Terpenuhi</span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs: Feeds | Reminder | Dashboard */}
                    <div className="border-b border-slate-200 flex items-center justify-around text-[12px] font-bold pt-1">
                      <button
                        type="button"
                        className="pb-2 border-b-2 border-green-02 text-ford-blue flex-1 text-center cursor-pointer"
                      >
                        Edukasi Gizi
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("menu")}
                        className="pb-2 border-b-2 border-transparent text-blue-gray hover:text-ford-blue flex-1 text-center cursor-pointer"
                      >
                        Jadwal MBG
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("screening")}
                        className="pb-2 border-b-2 border-transparent text-blue-gray hover:text-ford-blue flex-1 text-center cursor-pointer"
                      >
                        Dashboard
                      </button>
                    </div>

                    {/* Community Story Input Bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-green-tint border border-green-02/30 flex items-center justify-center text-[12px] font-bold text-ford-blue shrink-0">
                        {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
                      </div>
                      <div className="flex-1 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-[11px] text-blue-gray shadow-2xs">
                        Tanyakan menu gizi atau info posyandu...
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("ai_chat")}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-light-sea-green hover:bg-green-tint shadow-2xs cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-4 h-4 text-light-sea-green" />
                      </button>
                    </div>

                    {/* Feed Item Card: Tip Gizi Dinkes Gresik */}
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold text-[12px]">
                          🏥
                        </div>
                        <div>
                          <h4 className="text-[12px] font-bold text-ford-blue">Dinas Kesehatan Kab. Gresik</h4>
                          <p className="text-[9.5px] text-blue-gray">Tim Nutrisi MBG • 2 jam lalu</p>
                        </div>
                      </div>
                      <p className="text-[11.5px] text-ford-blue/90 leading-relaxed">
                        Ikan Bandeng dan Kerapu Gresik terbukti memiliki asam amino esensial dan Omega-3 yang setara dengan ikan salmon, sangat efektif mendukung kecerdasan otak siswa sekolah dasar! 🐟✨
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-blue-gray pt-1 border-t border-slate-100">
                        <span>❤️ 142 Warga Suka</span>
                        <span>💬 18 Komentar Diskusi</span>
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
                      <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-ford-blue">Skrining Gizi & Stunting AI</h3>
                        <p className="text-[10px] text-blue-gray">Standar Antropometri WHO & Kemenkes RI</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      <div>
                        <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Nama Lengkap Anak</label>
                        <input
                          type="text"
                          placeholder="Contoh: Muhammad Rayhan"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Jenis Kelamin</label>
                          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setChildGender("L")}
                              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${childGender === "L" ? "bg-white text-ford-blue shadow-2xs" : "text-blue-gray"}`}
                            >
                              Laki-laki
                            </button>
                            <button
                              type="button"
                              onClick={() => setChildGender("P")}
                              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${childGender === "P" ? "bg-white text-brand-red shadow-2xs" : "text-blue-gray"}`}
                            >
                              Perempuan
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Usia (Bulan)</label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={childAgeMonths}
                            onChange={(e) => setChildAgeMonths(Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Berat Badan (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={childWeightKg}
                            onChange={(e) => setChildWeightKg(Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Tinggi Badan (cm)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={childHeightCm}
                            onChange={(e) => setChildHeightCm(Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCalculateNutrition}
                        disabled={isCalculating}
                        className="w-full py-2.5 bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
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
                          <span className="text-[9px] font-bold uppercase text-blue-gray">Hasil Evaluasi</span>
                          <h4 className="text-[13px] font-bold text-ford-blue">{childName}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${screeningResult.color}`}>
                          {screeningResult.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-ford-blue leading-relaxed font-medium bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
                        {screeningResult.description}
                      </p>

                      <div className="space-y-1">
                        <h5 className="text-[10.5px] font-bold text-ford-blue">Rekomendasi Tindakan:</h5>
                        <ul className="text-[10px] text-blue-gray space-y-0.5 pl-4 list-disc">
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
                    <h3 className="text-[14px] font-bold text-ford-blue">Jadwal Menu MBG Mingguan</h3>
                    <p className="text-[10px] text-blue-gray">Kecamatan {citizenUser?.district || "Kebomas"}</p>
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
                        <span className="px-2 py-0.5 rounded-md bg-ford-blue text-white text-[9.5px] font-bold">{m.day}</span>
                        <span className="text-[9.5px] font-bold text-ford-blue bg-green-tint px-2 py-0.5 rounded-full border border-green-02/40">{m.cal}</span>
                      </div>
                      <h4 className="text-[12px] font-bold text-ford-blue">{m.menu}</h4>
                      <p className="text-[10.5px] text-blue-gray">{m.side}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ADUAN */}
              {activeTab === "complaint" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-ford-blue">Aduan & Masukan Program MBG</h3>
                        <p className="text-[10px] text-blue-gray">Langsung masuk ke Dashboard Super Admin</p>
                      </div>
                    </div>

                    {submittedTicket ? (
                      <div className="p-3 rounded-2xl bg-green-tint border border-green-02/40 text-center space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-green-02 mx-auto" />
                        <h4 className="text-[12px] font-bold text-ford-blue">Laporan Terkirim!</h4>
                        <p className="text-[10.5px] text-blue-gray">
                          Nomor Tiket: <strong className="font-mono bg-white px-1.5 py-0.5 rounded text-ford-blue border border-green-02/30">{submittedTicket}</strong>
                        </p>
                        <button
                          onClick={() => setSubmittedTicket(null)}
                          className="mt-1 px-3 py-1 bg-green-02 text-ford-blue rounded-xl text-[10.5px] font-bold cursor-pointer"
                        >
                          Kirim Aduan Baru
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitComplaint} className="space-y-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Kategori Aduan</label>
                          <select
                            value={complaintCategory}
                            onChange={(e) => setComplaintCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue"
                          >
                            <option value="Kualitas Menu MBG">Kualitas & Rasa Makanan MBG</option>
                            <option value="Ketepatan Waktu">Keterlambatan Pengiriman Menu</option>
                            <option value="Porsi Makanan">Porsi Makanan Kurang Sesuai</option>
                            <option value="Saran & Masukan">Saran & Masukan</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Isi Keluhan</label>
                          <textarea
                            rows={3}
                            placeholder="Tuliskan keluhan atau saran Anda..."
                            value={complaintMessage}
                            onChange={(e) => setComplaintMessage(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-medium text-ford-blue focus:outline-none focus:border-light-sea-green"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingComplaint}
                          className="w-full py-2.5 bg-ford-blue text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-ford-blue/90 cursor-pointer"
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
                    <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-ford-blue">K-Bot Asisten Gizi AI</h3>
                      <p className="text-[10px] text-blue-gray">Tanya seputar MPASI & gizi pangan lokal Gresik</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-green-tint/70 rounded-xl border border-green-02/30 text-[11.5px] text-ford-blue leading-relaxed">
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
                        className="w-full text-left p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[11px] text-ford-blue font-medium shadow-2xs hover:bg-green-tint/50 hover:border-green-02/40 transition-colors cursor-pointer"
                      >
                        💡 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: PROFIL WARGA */}
              {activeTab === "profile" && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {/* Citizen Profile Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-ford-blue via-[#1E2950] to-light-sea-green text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-[18px] font-bold text-white shadow-inner">
                        {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[15px] font-bold leading-tight truncate">
                            {citizenUser?.name || "Warga Gresik"}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-green-02 shrink-0" />
                        </div>
                        <p className="text-[11px] text-blue-100 truncate mt-0.5">
                          {citizenUser?.email || "warga@gresik.id"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[9.5px] font-bold text-blue-100 border border-white/20">
                            <MapPin className="w-2.5 h-2.5 text-brand-orange" />
                            <span>Kec. {citizenUser?.district || "Kebomas"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-center border-t border-white/10">
                      <div className="p-1.5 rounded-xl bg-white/10">
                        <span className="block text-[13px] font-bold text-white">1</span>
                        <span className="text-[9.5px] text-blue-100">Anak Dipantau</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/10">
                        <span className="block text-[13px] font-bold text-green-02">Optimal</span>
                        <span className="text-[9.5px] text-blue-100">Status Gizi</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/10">
                        <span className="block text-[13px] font-bold text-brand-orange">MBG</span>
                        <span className="text-[9.5px] text-blue-100">Aktif Sekolah</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu & Layanan Warga */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <h4 className="text-[11px] font-bold text-blue-gray uppercase tracking-wider px-1">
                      Layanan & Pengaturan
                    </h4>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab("screening")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                            <Activity className="w-3.5 h-3.5" />
                          </div>
                          <span>Riwayat Skrining Gizi AI</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-gray" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("complaint")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <span>Pusat Pengaduan Menu MBG</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-gray" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("ai_chat")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span>Konsultasi Nutrisi K-Bot AI</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-gray" />
                      </button>
                    </div>
                  </div>

                  {/* Tombol Keluar Sesi */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("kcal_active_citizen_user");
                        sessionStorage.setItem("kcal_citizen_screen", "login");
                        setCitizenUser(null);
                        setCurrentScreen("login");
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-brand-red/30 text-brand-red text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </main>

            {/* Bottom Navigation Bar with Prominent Floating 'Analisis' Button */}
            <div className="shrink-0 bg-white border-t border-slate-200 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-safe-nav pt-1 relative font-sans">
              <nav className="px-2 flex items-center justify-around">
                {/* 1. Beranda */}
                <button
                  type="button"
                  onClick={() => setActiveTab("home")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                    activeTab === "home" ? "text-light-sea-green font-bold" : "text-blue-gray font-medium hover:text-ford-blue"
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${activeTab === "home" ? "bg-green-tint text-ford-blue" : "text-blue-gray"}`}>
                    <Home className={`w-4 h-4 transition-transform ${activeTab === "home" ? "scale-110" : ""}`} />
                  </div>
                  <span className="text-[10px] tracking-tight">Beranda</span>
                </button>

                {/* 2. Menu */}
                <button
                  type="button"
                  onClick={() => setActiveTab("menu")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                    activeTab === "menu" ? "text-light-sea-green font-bold" : "text-blue-gray font-medium hover:text-ford-blue"
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${activeTab === "menu" ? "bg-green-tint text-ford-blue" : "text-blue-gray"}`}>
                    <Utensils className={`w-4 h-4 transition-transform ${activeTab === "menu" ? "scale-110" : ""}`} />
                  </div>
                  <span className="text-[10px] tracking-tight">Menu</span>
                </button>

                {/* 3. PROMINENT FLOATING CENTER BUTTON: Analisis */}
                <div className="relative -top-4.5 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("screening")}
                    className={`w-12 h-12 rounded-full bg-gradient-to-tr from-ford-blue via-light-sea-green to-green-02 text-white flex items-center justify-center shadow-lg shadow-green-02/35 border-[3px] border-white active:scale-95 transition-all cursor-pointer ${
                      activeTab === "screening" ? "ring-2 ring-green-02 scale-105" : "hover:shadow-green-02/50"
                    }`}
                  >
                    <Activity className="w-5 h-5 animate-pulse" />
                  </button>
                  <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${
                    activeTab === "screening" ? "text-light-sea-green font-bold" : "text-ford-blue font-bold"
                  }`}>
                    Analisis
                  </span>
                </div>

                {/* 4. Chat */}
                <button
                  type="button"
                  onClick={() => setActiveTab("ai_chat")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                    activeTab === "ai_chat" ? "text-light-sea-green font-bold" : "text-blue-gray font-medium hover:text-ford-blue"
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${activeTab === "ai_chat" ? "bg-green-tint text-ford-blue" : "text-blue-gray"}`}>
                    <MessageSquare className={`w-4 h-4 transition-transform ${activeTab === "ai_chat" ? "scale-110" : ""}`} />
                  </div>
                  <span className="text-[10px] tracking-tight">Chat</span>
                </button>

                {/* 5. Profil */}
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                    activeTab === "profile" ? "text-light-sea-green font-bold" : "text-blue-gray font-medium hover:text-ford-blue"
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${activeTab === "profile" ? "bg-green-tint text-ford-blue" : "text-blue-gray"}`}>
                    <User className={`w-4 h-4 transition-transform ${activeTab === "profile" ? "scale-110" : ""}`} />
                  </div>
                  <span className="text-[10px] tracking-tight">Profil</span>
                </button>
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
          <div className="absolute bottom-3 left-3 right-3 z-50 bg-ford-blue/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-green-02/30 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-5 duration-300 font-sans">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo_app.svg" alt="Kcal" className="w-8 h-8 rounded-xl shadow-xs shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[12px] font-bold text-white leading-tight flex items-center gap-1.5 truncate">
                  <span>Pasang Aplikasi Kcal</span>
                  <span className="text-[8.5px] px-1.5 py-0.2 bg-green-02 text-ford-blue rounded font-bold uppercase">APK</span>
                </h4>
                <p className="text-[10px] text-blue-100 truncate">Akses cepat di layar utama HP</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleInstallPWA}
                className="px-2.5 py-1.5 rounded-xl bg-green-02 hover:bg-light-sea-green text-ford-blue text-[10.5px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 text-center animate-in slide-in-from-bottom-6 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-green-tint text-ford-blue mx-auto flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-bold text-ford-blue">Pasang di Layar Utama iPhone</h3>
                <p className="text-[11px] text-blue-gray">Jadikan Kcal seperti aplikasi bawaan iOS:</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-2xl text-left text-[11px] space-y-2.5 text-ford-blue">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-light-sea-green text-ford-blue font-bold text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-light-sea-green mx-0.5" /> di Safari.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-light-sea-green text-ford-blue font-bold text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Pilih opsi <strong>&quot;Tambah ke Layar Utama&quot;</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-light-sea-green text-ford-blue font-bold text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Ketuk <strong>&quot;Tambah&quot;</strong> di pojok kanan atas.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 bg-ford-blue hover:bg-light-sea-green text-ford-blue font-bold rounded-xl font-bold text-[12px] transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}

        {/* ═══ NATIVE DEVICE PERMISSIONS REQUEST MODAL (.APK EXPERIENCE) ═══ */}
        {showPermissionDialog && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300 font-sans">
            <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-300 text-left">
              {/* Header with App Logo */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
                <img src="/logo_app.svg" alt="Kcal" className="w-9 h-9 rounded-2xl shadow-xs shrink-0" />
                <div>
                  <h3 className="text-[14px] font-bold text-ford-blue leading-tight">
                    Izin Akses Aplikasi Kcal
                  </h3>
                  <p className="text-[10px] text-blue-gray">
                    Ginofest 2026 • Pemkab Gresik
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-blue-gray leading-relaxed">
                Untuk pengalaman optimal layaknya aplikasi mobile native, Kcal memerlukan izin perangkat berikut:
              </p>

              {/* Permission List */}
              <div className="space-y-2">
                {/* 1. Kamera & Galeri */}
                <div className="flex items-start gap-2 p-2 rounded-2xl bg-green-tint/60 border border-green-02/30">
                  <div className="w-6 h-6 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-ford-blue">Kamera & Galeri Foto</h4>
                    <p className="text-[9.5px] text-blue-gray leading-tight">
                      Diperlukan untuk skrining visual stunting & upload foto aduan.
                    </p>
                  </div>
                </div>

                {/* 2. Lokasi GPS */}
                <div className="flex items-start gap-2 p-2 rounded-2xl bg-green-tint/60 border border-green-02/30">
                  <div className="w-6 h-6 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-ford-blue">Lokasi Wilayah (GPS)</h4>
                    <p className="text-[9.5px] text-blue-gray leading-tight">
                      Mendeteksi kecamatan domisili Anda di Gresik secara otomatis.
                    </p>
                  </div>
                </div>

                {/* 3. Notifikasi */}
                <div className="flex items-start gap-2 p-2 rounded-2xl bg-amber-50/60 border border-brand-orange/30">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-ford-blue">Notifikasi Pengingat</h4>
                    <p className="text-[9.5px] text-blue-gray leading-tight">
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
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12.5px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                  className="w-full py-1.5 text-blue-gray hover:text-ford-blue font-semibold text-[10.5px] cursor-pointer text-center"
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
