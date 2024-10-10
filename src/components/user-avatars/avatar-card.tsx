import { AvatarInfo } from "@/types";

export default function AvatarCard(avatar: AvatarInfo) {
  return <div>{JSON.stringify(avatar)}</div>;
}
