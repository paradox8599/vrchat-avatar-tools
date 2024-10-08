import { track, trackId } from "@/lib/aptabase";
import { Avatar } from "@/types";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { proxyMap } from "valtio/utils";

const AVATAR_STORE_KEY = "avatarStore";

let store: Store;

export const avatarMapState = proxyMap<string, Avatar>();

subscribe(avatarMapState, async () => {
  await store.set(AVATAR_STORE_KEY, avatarMapState);
});

export async function loadAvatarState() {
  store = await createStore("avatars", {
    autoSave: 1000 as unknown as boolean,
  });

  const storedAvatars =
    await store.get<Record<string, Avatar>>(AVATAR_STORE_KEY);
  if (!storedAvatars) return;
  for (const [id, avatar] of Object.entries(storedAvatars)) {
    avatar.fetching = false;
    avatarMapState.set(id, proxy(avatar));
  }
}

export function clearAvatars() {
  track("clear", { avatars: trackId() });
  avatarMapState.clear();
}
