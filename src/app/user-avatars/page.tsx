"use client";
import { Button } from "@/components/ui/button";
import { useUserAvatars } from "@/hooks/avatars/use-user-avatars";
import { me } from "@/state/auth";
import { RefreshCw } from "lucide-react";

export default function UserAvatarPage() {
  const { avatars, mutate } = useUserAvatars(me.username);

  return (
    <main className="p-2 h-full flex flex-col">
      <div>
        <Button variant="outline" size="icon" onClick={() => mutate()}>
          <RefreshCw />
        </Button>
      </div>
      <div>
        {avatars.map((avatar) => (
          <div key={avatar.id}>
            {avatar.id}: {avatar.name}
          </div>
        ))}
      </div>
    </main>
  );
}
