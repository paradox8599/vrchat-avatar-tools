"use client";
import UserSelector from "@/components/avatars/user-selector";
import { useSearchParams } from "next/navigation";

export default function AvatarPage() {
  const params = useSearchParams();
  const id = params.get("id");

  if (id) {
    return (
      <main>
        <pre>Avatar {id}</pre>
      </main>
    );
  }

  return (
    <main>
      <UserSelector />
    </main>
  );
}
