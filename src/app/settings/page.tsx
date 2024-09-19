"use client";
import { AvatarExport } from "@/components/settings/avatar-export";
import { AvatarImport } from "@/components/settings/avatar-import";
import { NotificationToggle } from "@/components/settings/notification-toggle";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appState, logout } from "@/state/app";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSnapshot } from "valtio";

export default function Page() {
  const { settings } = useSnapshot(appState);
  return (
    <main className="w-full pt-4 flex flex-col items-center">
      <div className="max-w-lg w-full px-4">
        {/* header */}
        <div className="relative flex items-center justify-center">
          <Link href="/" className="absolute left-0 bottom-0">
            <div className="flex justify-start items-center w-fit">
              <ChevronLeft />
              返回
            </div>
          </Link>

          <h1 className="font-semibold text-xl">设置</h1>
        </div>

        {/* options */}

        <div className="py-4 flex flex-col items-start justify-start gap-4 sm:gap-8">
          <NotificationToggle />
          <ThemeToggle />

          <AvatarImport />
          <AvatarExport />

          {/* avatar fetch interval */}
          <div className="w-full">
            <Label className="text-nowrap px-2">单次请求间隔时间 (秒)</Label>
            <Input
              type="number"
              value={settings.avatarFetchInterval}
              onChange={(e) => {
                appState.settings.avatarFetchInterval = Number.parseInt(
                  e.target.value,
                );
              }}
            />
          </div>

          {/* avatar expires in */}
          <div className="w-full">
            <Label className="text-nowrap px-2">模型数据更新间隔 (小时)</Label>
            <Input
              type="number"
              min="1"
              value={settings.avatarStatusExpiresHr}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value);
                if (Number.isNaN(parsed)) return;
                if (parsed < 1) return;
                appState.settings.avatarStatusExpiresHr = parsed;
              }}
            />
          </div>
        </div>

        {/* Logout button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full bg-red-700">
              退出登录
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>退出登录</DialogTitle>
              <DialogDescription>是否退出登录？</DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={logout}>
                  确认
                </Button>
                <DialogClose asChild>
                  <Button variant="default">取消</Button>
                </DialogClose>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
