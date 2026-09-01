export type AppScreen = "splash" | "onboarding" | "login" | "register" | "forgot_password" | "main";
export type MobileTab = "home" | "screening" | "profile";

export interface CitizenUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  district: string;
  photoURL?: string;
  createdAtIso?: string;
}

export interface ScreeningResult {
  status: "Normal" | "Beresiko Stunting" | "Gizi Kurang" | "Sangat Baik";
  score: number;
  color: string;
  description: string;
  recommendations: string[];
  localFoods: string[];
}

export interface AtmosphereState {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  greetingText: string;
  greetingEmoji: string;
  currentTimeStr: string;
  currentDateStr: string;
}
