"use client";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { useSnapshot } from "valtio";
import Link from "next/link";
import AvatarInput from "@/components/avatar/avatar-input";
import { TagFilter } from "@/components/avatar/tag-selector";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/tooltip";
import AvatarGrid from "@/components/avatar/avatar-grid";
import { ROUTES } from "@/routes";
import { authState } from "@/state/auth";

export default function Page() {
  const auth = useSnapshot(authState);

  return (
    <main className="py-2 h-full flex flex-col">
      <div className="flex flex-row items-center justify-between gap-2 px-2 pb-2 shadow">
        {/* Avatar Icon & Settings button */}

        <Tooltip tooltip="设置">
          <Button asChild size="icon" variant="ghost">
            <Link href={ROUTES.settings}>
              <Settings />
            </Link>
          </Button>
        </Tooltip>

        <Avatar className="relative avatar-btn">
          <AvatarImage
            src={auth?.me?.currentAvatarThumbnailImageUrl}
            className="object-cover"
          />
          <AvatarFallback>{auth?.me?.displayName}</AvatarFallback>
        </Avatar>

        <TagFilter />

        <AvatarInput />
      </div>

      <div className="flex-1 overflow-hidden">
        <AvatarGrid />
      </div>
    </main>
  );
}
