import { track, trackId } from "@/lib/aptabase";
import { Avatar } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { proxyMap } from "valtio/utils";

const AVATAR_STORE_KEY = "avatarStore";

const avatarStore = new Store("avatars");

export const avatarMapState = proxyMap<string, Avatar>();

subscribe(avatarMapState, async () => {
  await avatarStore.set(AVATAR_STORE_KEY, avatarMapState);
  await avatarStore.save();
});

export async function loadAvatarState() {
  const storedAvatars = await avatarStore.get(AVATAR_STORE_KEY);
  if (storedAvatars) {
    for (const [id, avatar] of Object.entries(storedAvatars)) {
      avatar.fetching = false;
      avatarMapState.set(id, proxy(avatar));
    }
  }
}

export function clearAvatars() {
  track("clear", { avatars: trackId() });
  avatarMapState.clear();
}
