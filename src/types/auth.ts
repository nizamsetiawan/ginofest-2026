export type UserRole = "super_admin" | "admin_kecamatan";

export interface KcalUser {
  id: string; // e.g. "usr_super_admin", "usr_manyar"
  email: string; // e.g. "nizamsetiawan15@gmail.com", "manyar@ginofest.com"
  name: string; // e.g. "Nizam Setiawan", "Admin Kec. Manyar"
  role: UserRole;
  districtId: string; // "all" for super_admin, or "manyar", "kebomas", etc.
  regionLabel: string; // "Kabupaten Gresik" or "Kec. Manyar"
  pin: string; // 8 character PIN (e.g. "69hagh0d")
  password?: string; // Default password or custom
  isPinConfigured: boolean; // Whether custom PIN has been configured
  initials: string;
  avatarBg: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: KcalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
