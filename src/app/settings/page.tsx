"use client";
import { AutoStartToggle } from "@/components/settings/auto-start";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { appState, clearApp, logout } from "@/state/app";
import { clearAvatars } from "@/state/avatars";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSnapshot } from "valtio";

export default function Page() {
  const { settings } = useSnapshot(appState);
  return (
    <main className="h-full w-full pt-4 flex flex-col items-center">
      <div className="h-full max-w-lg w-full px-4">
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

        <ScrollArea className="h-full py-6">
          <div className="px-4 py-4 flex flex-col items-start justify-start gap-4">
            <NotificationToggle />
            <AutoStartToggle />
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
              <Label className="text-nowrap px-2">
                模型数据更新间隔 (小时)
              </Label>
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

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  清空数据
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary">
                <DialogHeader>
                  <DialogTitle>清空数据</DialogTitle>
                  <DialogDescription>
                    确定要清空数据？这将清空所有添加的模型ID，并登出账号。
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearAvatars();
                        clearApp();
                        toast({ title: "已清空数据" });
                      }}
                    >
                      确认
                    </Button>
                    <DialogClose asChild>
                      <Button variant="default">取消</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            {/* Logout button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  退出登录
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary">
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
        </ScrollArea>
      </div>
    </main>
  );
}
