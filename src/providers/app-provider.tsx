"use client";

import useAppInit from "@/hooks/useAppInit";
import useAuth from "@/hooks/useAuth";
import useNotification from "@/hooks/useNotifications";

export default function AppProvider() {
  useAppInit();
  useNotification();
  useAuth();
  return <></>;
}
