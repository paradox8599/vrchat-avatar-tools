"use client";
import React from "react";
import { Layers3, Radar, Settings } from "lucide-react";

import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/routes";
import PageLink from "./page-link";
import useAuth from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export default function NavBar() {
  usePathname();
  const { auth, loggedIn } = useAuth();

  if (!loggedIn) return null;

  return (
    <div className="w-14 flex flex-col items-center justify-between py-2 shadow">
      {/* top */}
      <div className="">
        {/* avatar icon */}
        <Avatar className="relative avatar-btn">
          {auth.info?.currentAvatarThumbnailImageUrl && (
            <AvatarImage
              src={auth.info.currentAvatarThumbnailImageUrl}
              className="object-cover"
            />
          )}
          <AvatarFallback>{auth?.info?.displayName || "User"}</AvatarFallback>
        </Avatar>
      </div>

      {/* pages */}
      <div className="flex-1 py-4 flex flex-col items-center gap-2">
        <PageLink tooltip="公开扫描" href={ROUTES.publicCheck}>
          <Radar />
        </PageLink>

        <PageLink tooltip="模型管理" href={ROUTES.userAvatars}>
          <Layers3 />
        </PageLink>
      </div>

      {/* bottom */}
      <div className="flex flex-col items-center justify-end">
        <PageLink tooltip="设置" href={ROUTES.settings}>
          <Settings />
        </PageLink>
      </div>
    </div>
  );
}
