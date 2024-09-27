import { authState } from "@/state/auth";
import { EventProps } from "@/types";
import { trackEvent } from "@aptabase/tauri";

export async function track(name: string, props?: EventProps) {
  await trackEvent(name, props);
}

export function trackId() {
  return authState.me?.id ?? "_";
}
