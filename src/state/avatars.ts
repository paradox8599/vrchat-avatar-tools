import { track, trackName } from "@/lib/aptabase";
import { AvatarRecord } from "@/types";
import { load, Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { proxyMap } from "valtio/utils";

const AVATAR_STORE_KEY = "avatarStore";

let store: Store;

export const avatarMapState = proxyMap<string, AvatarRecord>();

subscribe(avatarMapState, async () => {
  await store.set(AVATAR_STORE_KEY, avatarMapState);
  await store.save();
});

export async function loadAvatarState() {
  store = await load("avatars");

  const storedAvatars =
    await store.get<Record<string, AvatarRecord>>(AVATAR_STORE_KEY);
  if (!storedAvatars) return;
  for (const [id, avatar] of Object.entries(storedAvatars)) {
    avatar.fetching = false;
    avatarMapState.set(id, proxy(avatar));
  }
}

export function clearAvatars() {
  track("clear", { avatars: trackName() });
  avatarMapState.clear();
}
