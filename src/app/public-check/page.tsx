"use client";
import React from "react";
import AvatarInput from "@/components/public-check/avatar-input";
import AvatarGrid from "@/components/public-check/avatar-grid";
import { TagFilter } from "@/components/public-check/tag-selector";

export default function PublicCheckPage() {
  return (
    <main className="py-2 h-full flex flex-col">
      <div className="flex flex-row items-center justify-between gap-2 px-2 pb-2">
        <TagFilter />

        <AvatarInput />
      </div>

      <div className="flex-1 overflow-hidden">
        <AvatarGrid />
      </div>
    </main>
  );
}
