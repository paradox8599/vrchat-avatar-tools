"use client";

import React from "react";
import Link from "next/link";
import { useSnapshot } from "valtio";
import { Settings } from "lucide-react";

import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/tooltip";
import AvatarInput from "@/components/avatar/avatar-input";
import AvatarGrid from "@/components/avatar/avatar-grid";
import { TagFilter } from "@/components/avatar/tag-selector";
import { ROUTES } from "@/routes";
import { myAuthState } from "@/state/auth";

export default function Page() {
  const auth = useSnapshot(myAuthState);

  return (
    <main className="py-2 h-full flex flex-col">
      <div className="flex flex-row items-center justify-between gap-2 px-2 pb-2 shadow">
        {/* Avatar Icon & Settings button */}

        <Tooltip tooltip="设置">
          <Button asChild size="icon" variant="ghost" aria-label="Settings">
            <Link href={ROUTES.settings}>
              <Settings />
            </Link>
          </Button>
        </Tooltip>

        <Avatar className="relative avatar-btn">
          {auth.info?.currentAvatarThumbnailImageUrl && (
            <AvatarImage
              src={auth.info.currentAvatarThumbnailImageUrl}
              className="object-cover"
            />
          )}
          <AvatarFallback>{auth?.info?.displayName || "User"}</AvatarFallback>
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
