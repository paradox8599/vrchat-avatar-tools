"use client";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import AvatarCard from "@/components/user-avatars/avatar-card";
import { useUserAvatars } from "@/hooks/avatars/use-user-avatars";
import { cn } from "@/lib/utils";
import { me } from "@/state/auth";
import { RefreshCw } from "lucide-react";
import React from "react";

function RefreshButton({ className }: { className?: string }) {
  const { mutate, isLoading } = useUserAvatars(me.username);
  const [loading, setLoading] = React.useState(false);

  async function startLoading() {
    setLoading(true);
    await Promise.all([
      mutate([]),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startLoading}
      className={className}
    >
      <RefreshCw
        size={18}
        className={cn(isLoading || loading ? "animate-spin duration-500" : "")}
      />
    </Button>
  );
}

export default function UserAvatarPage() {
  const { avatars } = useUserAvatars(me.username);

  return (
    <main className="px-4 h-full flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <PageHeader title="模型管理">
          <RefreshButton />
        </PageHeader>

        <div className="flex flex-col items-center gap-2 w-full">
          {avatars.map(AvatarCard)}
        </div>
      </div>
    </main>
  );
}
