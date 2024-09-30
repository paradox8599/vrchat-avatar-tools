import { track, trackId } from "@/lib/aptabase";
import { Avatar } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { subscribe } from "valtio";
import { proxyMap } from "valtio/utils";

const AVATAR_STORE_KEY = "avatarStore";

const avatarStore = new Store("store");

export const avatarMapState = proxyMap<string, Avatar>();

subscribe(avatarMapState, async () => {
  const avatars = Array.from(avatarMapState.entries());
  await avatarStore.set(AVATAR_STORE_KEY, avatars);
  await avatarStore.save();
});

export async function loadAvatarState() {
  const storedAvatars: [string, Avatar][] | null =
    await avatarStore.get(AVATAR_STORE_KEY);
  avatarMapState.clear();
  storedAvatars?.forEach(([id, avatar]) => {
    avatar.fetching = false;
    avatarMapState.set(id, avatar);
  });
}

export function clearAvatars() {
  track("clear", { avatars: trackId() });
  avatarMapState.clear();
}
