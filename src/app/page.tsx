"use client";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { appState } from "@/state/app";
import React from "react";
import { useSnapshot } from "valtio";
import Link from "next/link";
import AvatarGrid from "../components/avatar/avatar-grid";
import AvatarInput from "@/components/avatar/avatar-input";
import { TagSelector } from "@/components/avatar/tag-selector";

export default function Page() {
  const { auth } = useSnapshot(appState);

  return (
    <main className="py-2 h-full flex flex-col">
      <div className="flex flex-row items-center justify-between gap-2 px-2">
        {/* Avatar Icon & Settings button */}

        <Link href="/settings">
          <Avatar className="relative avatar-btn">
            <AvatarImage
              src={auth?.me?.currentAvatarThumbnailImageUrl}
              className="object-cover"
            />
            <AvatarFallback>{auth?.me?.displayName}</AvatarFallback>
            <div className="avatar-tooltip absolute inset-auto h-full w-full flex-center text-foreground text-sm cursor-pointer bg-accent bg-opacity-50">
              设置
            </div>
          </Avatar>
        </Link>

        <TagSelector hideOnEmpty />

        <AvatarInput />
      </div>

      <div className="flex-1 overflow-hidden">
        <AvatarGrid />
      </div>

    </main>
  );
}
