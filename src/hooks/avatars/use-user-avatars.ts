import { vrchatGetOwnAvatars } from "@/lib/api/avatar";
import useSWRImmutable from "swr/immutable";

export function useUserAvatars(username?: string) {
  const swr = useSWRImmutable(
    username ? ["useUserAvatars", username] : null,
    () => vrchatGetOwnAvatars(username!),
  );
  return {
    ...swr,
    avatars: swr.data ?? [],
  };
}
