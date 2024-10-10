"use client";
import UserSelector from "@/components/user-avatars/user-selector";

export default function AvatarPage() {
  return (
    <main className="p-2 h-full flex flex-col">
      <div>
        <UserSelector />
      </div>
    </main>
  );
}
