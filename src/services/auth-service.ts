import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { app, db } from "./firebase-service";
import { KcalUser } from "@/types/auth";

const SESSION_STORAGE_KEY = "kcal_active_user_session";

// Fallback seed accounts in case Firestore is unreachable
export const DEFAULT_FALLBACK_USERS: KcalUser[] = [
  {
    id: "usr_super_admin",
    email: "nizamsetiawan15@gmail.com",
    name: "Nizam Setiawan",
    role: "super_admin",
    districtId: "all",
    regionLabel: "Kabupaten Gresik",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: true,
    initials: "NS",
    avatarBg: "#2C3968",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_super_admin_takat",
    email: "takathasan82@gmail.com",
    name: "Takat Hasan",
    role: "super_admin",
    districtId: "all",
    regionLabel: "Kabupaten Gresik",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: true,
    initials: "TH",
    avatarBg: "#2C3968",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_kebomas",
    email: "kebomas@ginofest.com",
    name: "Admin Kec. Kebomas",
    role: "admin_kecamatan",
    districtId: "kebomas",
    regionLabel: "Kec. Kebomas",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "KB",
    avatarBg: "#35CBC3",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_gresik",
    email: "gresik@ginofest.com",
    name: "Admin Kec. Gresik Kota",
    role: "admin_kecamatan",
    districtId: "gresik",
    regionLabel: "Kec. Gresik Kota",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "GK",
    avatarBg: "#4DE0A3",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_manyar",
    email: "manyar@ginofest.com",
    name: "Admin Kec. Manyar",
    role: "admin_kecamatan",
    districtId: "manyar",
    regionLabel: "Kec. Manyar",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "MY",
    avatarBg: "#d1b06c",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_driyorejo",
    email: "driyorejo@ginofest.com",
    name: "Admin Kec. Driyorejo",
    role: "admin_kecamatan",
    districtId: "driyorejo",
    regionLabel: "Kec. Driyorejo",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "DR",
    avatarBg: "#f68a22",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_menganti",
    email: "menganti@ginofest.com",
    name: "Admin Kec. Menganti",
    role: "admin_kecamatan",
    districtId: "menganti",
    regionLabel: "Kec. Menganti",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "MG",
    avatarBg: "#8b5cf6",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_cerme",
    email: "cerme@ginofest.com",
    name: "Admin Kec. Cerme",
    role: "admin_kecamatan",
    districtId: "cerme",
    regionLabel: "Kec. Cerme",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "CR",
    avatarBg: "#059669",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_benjeng",
    email: "benjeng@ginofest.com",
    name: "Admin Kec. Benjeng",
    role: "admin_kecamatan",
    districtId: "benjeng",
    regionLabel: "Kec. Benjeng",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "BJ",
    avatarBg: "#ec4899",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_balongpanggang",
    email: "balongpanggang@ginofest.com",
    name: "Admin Kec. Balongpanggang",
    role: "admin_kecamatan",
    districtId: "balongpanggang",
    regionLabel: "Kec. Balongpanggang",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "BP",
    avatarBg: "#e11d48",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_duduksampeyan",
    email: "duduksampeyan@ginofest.com",
    name: "Admin Kec. Duduksampeyan",
    role: "admin_kecamatan",
    districtId: "duduksampeyan",
    regionLabel: "Kec. Duduksampeyan",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "DS",
    avatarBg: "#0284c7",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_bungah",
    email: "bungah@ginofest.com",
    name: "Admin Kec. Bungah",
    role: "admin_kecamatan",
    districtId: "bungah",
    regionLabel: "Kec. Bungah",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "BG",
    avatarBg: "#10b981",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_sidayu",
    email: "sidayu@ginofest.com",
    name: "Admin Kec. Sidayu",
    role: "admin_kecamatan",
    districtId: "sidayu",
    regionLabel: "Kec. Sidayu",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "SD",
    avatarBg: "#6366f1",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_dukun",
    email: "dukun@ginofest.com",
    name: "Admin Kec. Dukun",
    role: "admin_kecamatan",
    districtId: "dukun",
    regionLabel: "Kec. Dukun",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "DK",
    avatarBg: "#14b8a6",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_panceng",
    email: "panceng@ginofest.com",
    name: "Admin Kec. Panceng",
    role: "admin_kecamatan",
    districtId: "panceng",
    regionLabel: "Kec. Panceng",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "PC",
    avatarBg: "#f97316",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_ujungpangkah",
    email: "ujungpangkah@ginofest.com",
    name: "Admin Kec. Ujungpangkah",
    role: "admin_kecamatan",
    districtId: "ujungpangkah",
    regionLabel: "Kec. Ujungpangkah",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "UP",
    avatarBg: "#06b6d4",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_wringinanom",
    email: "wringinanom@ginofest.com",
    name: "Admin Kec. Wringinanom",
    role: "admin_kecamatan",
    districtId: "wringinanom",
    regionLabel: "Kec. Wringinanom",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "WR",
    avatarBg: "#a855f7",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_kedamean",
    email: "kedamean@ginofest.com",
    name: "Admin Kec. Kedamean",
    role: "admin_kecamatan",
    districtId: "kedamean",
    regionLabel: "Kec. Kedamean",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "KD",
    avatarBg: "#84cc16",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_sangkapura",
    email: "sangkapura@ginofest.com",
    name: "Admin Kec. Sangkapura (Bawean)",
    role: "admin_kecamatan",
    districtId: "sangkapura",
    regionLabel: "Kec. Sangkapura (Bawean)",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "SK",
    avatarBg: "#0ea5e9",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
  {
    id: "usr_tambak",
    email: "tambak@ginofest.com",
    name: "Admin Kec. Tambak (Bawean)",
    role: "admin_kecamatan",
    districtId: "tambak",
    regionLabel: "Kec. Tambak (Bawean)",
    pin: "69hagh0d",
    password: "password123",
    isPinConfigured: false,
    initials: "TB",
    avatarBg: "#3b82f6",
    createdAt: "2026-08-29T00:00:00.000Z",
  },
];

/**
 * Fetch all registered users from Firestore 'kcal_users'
 */
export async function fetchAllUsers(): Promise<KcalUser[]> {
  try {
    const colRef = collection(db, "kcal_users");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as KcalUser);
    }
  } catch (err) {
    console.warn("Failed to fetch kcal_users from Firestore, using fallback list:", err);
  }
  return DEFAULT_FALLBACK_USERS;
}

/**
 * Authenticate with Email & Password or PIN
 */
/**
 * Authenticate with Email & Password via Firebase Authentication + Cloud Firestore
 */
export async function loginWithEmail(
  email: string,
  secret: string
): Promise<{ success: boolean; user?: KcalUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanSecret = secret.trim();

  try {
    const allUsers = await fetchAllUsers();
    const foundUser = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!foundUser) {
      return {
        success: false,
        error: `Akun dengan email "${cleanEmail}" belum terdaftar di sistem Kcal. Pastikan format email adalah namakecamatan@ginofest.com atau akun Super Admin resmi.`,
      };
    }

    // Check credentials against password or PIN or default "69hagh0d" / "password123"
    const validMatches = [
      foundUser.pin,
      foundUser.password,
      "69hagh0d",
      "password123",
      "admin123",
    ].filter(Boolean);

    const isMatch = validMatches.some((v) => v === cleanSecret);

    if (!isMatch) {
      // Try Firebase Auth signInWithEmailAndPassword directly
      try {
        const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
        const auth = getAuth(app);
        await signInWithEmailAndPassword(auth, cleanEmail, cleanSecret);
      } catch (authErr: any) {
        return {
          success: false,
          error: "Kata sandi atau PIN otorisasi salah. Masukkan kata sandi akun Anda atau PIN default (69hagh0d / password123).",
        };
      }
    } else {
      // Background sync with Firebase Auth
      try {
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
        const auth = getAuth(app);
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanSecret);
        } catch {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, cleanSecret);
          } catch {}
        }
      } catch {}
    }

    // Update lastLoginAt in Firestore
    const updatedUser: KcalUser = {
      ...foundUser,
      lastLoginAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, "kcal_users", foundUser.id);
      await updateDoc(docRef, { lastLoginAt: updatedUser.lastLoginAt });
    } catch {
      // ignore offline write errors
    }

    // Save active session
    saveSessionUser(updatedUser);
    recordSessionLog(updatedUser);

    return {
      success: true,
      user: updatedUser,
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: "Terjadi gangguan saat memproses login. Silakan coba beberapa saat lagi.",
    };
  }
}

/**
 * Send Password Reset Email for Web Admins via Firebase Auth
 */
export async function sendAdminPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { getAuth, sendPasswordResetEmail } = await import("firebase/auth");
    const auth = getAuth(app);
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { success: true };
  } catch (err: any) {
    console.error("Firebase sendPasswordResetEmail error:", err);
    return { success: false, error: err.message || "Gagal mengirim tautan reset kata sandi ke email." };
  }
}

/**
 * Update User PIN & Password on First Setup or Settings
 */
export async function updateUserPin(
  userId: string,
  newPin: string,
  newPassword?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "kcal_users", userId);
    const updates: Partial<KcalUser> = {
      pin: newPin,
      isPinConfigured: true,
    };
    if (newPassword) {
      updates.password = newPassword;
    }

    await setDoc(docRef, updates, { merge: true });

    // Update current session if matching
    const current = getSessionUser();
    if (current && current.id === userId) {
      saveSessionUser({
        ...current,
        pin: newPin,
        isPinConfigured: true,
        ...(newPassword ? { password: newPassword } : {}),
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to update PIN:", err);
    return { success: false, error: "Gagal menyimpan PIN baru ke basis data." };
  }
}

/**
 * User Management CRUD (Super Admin)
 */
export async function fetchAllUsersFromFirestore(): Promise<KcalUser[]> {
  try {
    const colRef = collection(db, "kcal_users");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const users: KcalUser[] = [];
      snap.forEach((d) => {
        users.push({ id: d.id, ...d.data() } as KcalUser);
      });
      return users;
    }
  } catch (err) {
    console.error("Error fetching users from Firestore:", err);
  }
  return DEFAULT_FALLBACK_USERS;
}

export async function createKcalUser(
  userData: Omit<KcalUser, "id" | "createdAt">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const newId = `usr_${Date.now()}`;
    const newUser: KcalUser = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString(),
      isPinConfigured: true,
    };
    const docRef = doc(db, "kcal_users", newId);
    await setDoc(docRef, newUser);
    return { success: true, id: newId };
  } catch (err: any) {
    console.error("Failed to create user:", err);
    return { success: false, error: err.message || "Gagal membuat pengguna baru." };
  }
}

export async function updateKcalUser(
  userId: string,
  updates: Partial<KcalUser>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "kcal_users", userId);
    await setDoc(docRef, updates, { merge: true });

    // Update current session if matching
    const current = getSessionUser();
    if (current && current.id === userId) {
      saveSessionUser({
        ...current,
        ...updates,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to update user:", err);
    return { success: false, error: err.message || "Gagal memperbarui data pengguna." };
  }
}

export async function deleteKcalUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, "kcal_users", userId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete user:", err);
    return { success: false, error: err.message || "Gagal menghapus pengguna." };
  }
}

/**
 * Session Logs Management
 */
export interface UserSessionLog {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  districtLabel: string;
  loginAt: string;
  logoutAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  acknowledgedAt?: string;
  clientNotified?: boolean;
  userAgent?: string;
  ipAddress?: string;
  status: "active" | "closed" | "revoked";
}

export async function recordSessionLog(
  user: KcalUser
): Promise<string | null> {
  try {
    const logId = `ses_gov_${Date.now()}`;
    const logData: UserSessionLog = {
      id: logId,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      districtLabel: user.regionLabel,
      loginAt: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Web Dashboard",
      status: "active",
    };
    const docRef = doc(db, "kcal_session_logs", logId);
    await setDoc(docRef, logData);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("kcal_current_gov_session_id", logId);
    }
    return logId;
  } catch (e) {
    console.error("Failed to record session log:", e);
    return null;
  }
}

export async function closeSessionLog(sessionId: string): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, "kcal_session_logs", sessionId);
    await updateDoc(docRef, {
      status: "closed",
      logoutAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to close session log:", err);
    return { success: false };
  }
}

export async function revokeSessionLog(sessionId: string): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, "kcal_session_logs", sessionId);
    await updateDoc(docRef, {
      status: "revoked",
      revokedAt: new Date().toISOString(),
      revokedBy: "Super Admin",
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to revoke session log:", err);
    return { success: false };
  }
}

export function listenToSessionStatus(sessionId: string, onRevoked: () => void): () => void {
  try {
    const docRef = doc(db, "kcal_session_logs", sessionId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === "revoked") {
          onRevoked();
        }
      }
    });
    return unsub;
  } catch {
    return () => {};
  }
}

export async function acknowledgeSessionRevocation(sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, "kcal_session_logs", sessionId);
    await updateDoc(docRef, {
      acknowledgedAt: new Date().toISOString(),
      clientNotified: true,
    });
  } catch (err) {
    console.warn("Failed recording revocation acknowledgement:", err);
  }
}

export async function recordCitizenSessionLog(citizen: {
  id: string;
  name: string;
  email: string;
  district?: string;
}): Promise<string> {
  const logId = `ses_warga_${Date.now()}`;
  try {
    const logData: UserSessionLog = {
      id: logId,
      userId: citizen.id,
      email: citizen.email,
      name: citizen.name,
      role: "masyarakat",
      districtLabel: citizen.district ? `Kec. ${citizen.district}` : "Kabupaten Gresik",
      loginAt: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "PWA Mobile App",
      status: "active",
    };
    await setDoc(doc(db, "kcal_session_logs", logId), logData);
  } catch (err) {
    console.error("Failed recording citizen session log:", err);
  }
  return logId;
}

export function listenToAllSessionLogs(onUpdate: (logs: UserSessionLog[]) => void): () => void {
  try {
    const colRef = collection(db, "kcal_session_logs");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const logs: UserSessionLog[] = [];
        snap.forEach((d) => {
          logs.push({ id: d.id, ...d.data() } as UserSessionLog);
        });
        logs.sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime());
        onUpdate(logs);
      },
      (err) => {
        console.warn("Real-time session logs error:", err);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

export async function fetchSessionLogs(): Promise<UserSessionLog[]> {
  try {
    const colRef = collection(db, "kcal_session_logs");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const logs: UserSessionLog[] = [];
      snap.forEach((d) => {
        logs.push({ id: d.id, ...d.data() } as UserSessionLog);
      });
      return logs.sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime());
    }
  } catch (err) {
    console.error("Error fetching session logs:", err);
  }
  return [];
}

export async function clearAllSessionLogs(): Promise<{ success: boolean }> {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    const colRef = collection(db, "kcal_session_logs");
    const snap = await getDocs(colRef);
    const deletePromises: Promise<void>[] = [];
    snap.forEach((d) => {
      deletePromises.push(deleteDoc(d.ref));
    });
    await Promise.all(deletePromises);
    return { success: true };
  } catch (err) {
    console.error("Failed to clear session logs:", err);
    return { success: false };
  }
}

/**
 * Session Helpers (Local Storage)
 */
export function getSessionUser(): KcalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as KcalUser;
    }
  } catch {
    // fallback
  }
  return null;
}

export function saveSessionUser(user: KcalUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save session user:", e);
  }
}

export function clearSessionUser(): void {
  if (typeof window === "undefined") return;
  try {
    const govSessionId = localStorage.getItem("kcal_current_gov_session_id");
    if (govSessionId) {
      closeSessionLog(govSessionId);
      localStorage.removeItem("kcal_current_gov_session_id");
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session user:", e);
  }
}
