"use client";

import { useEffect, useState } from "react";
import { getAuthToken, removeAuthToken } from "./api";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
  isVerified?: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Lead Researcher",
  email: "researcher@darkspot.ai",
  role: "Intelligence Analyst",
  initials: "LR",
  isVerified: true,
};

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getAuthToken());
}

export function getStoredUser(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem("darkspot_user");
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    const name = parsed.name || parsed.full_name || DEFAULT_PROFILE.name;
    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((part: string) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "LR";
    return {
      name,
      email: parsed.email || DEFAULT_PROFILE.email,
      role: parsed.role || DEFAULT_PROFILE.role,
      initials,
      isVerified: parsed.is_verified ?? true,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredUser());
    setIsAuth(isAuthenticated());
  }, []);

  const logout = () => {
    removeAuthToken();
    setIsAuth(false);
    setProfile(DEFAULT_PROFILE);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return { profile, isAuth, logout };
}
