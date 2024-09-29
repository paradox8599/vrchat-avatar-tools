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
import { ROUTE_HOME } from "@/routes";
import { appState } from "@/state/app";
import { logout } from "@/state/auth";
import { clearAvatars } from "@/state/avatars";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";

export default function Page() {
  const { settings, version } = useSnapshot(appState);
  const router = useRouter();
  return (
    <main className="h-full w-full pt-4 flex flex-col items-center">
      <div className="h-full max-w-lg w-full px-4">
        {/* header */}
        <div className="relative flex items-center justify-center">
          <Button
            className="absolute left-0 flex items-center w-fit"
            variant="ghost"
            size="sm"
            onClick={() => router.replace(ROUTE_HOME)}
          >
            <ChevronLeft />
          </Button>

          <h1 className="font-semibold text-xl px-8">设置</h1>
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

                  <DialogDescription className="py-4">
                    确定要清空数据？这将清空所有添加的模型ID
                  </DialogDescription>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearAvatars();
                        // clearApp();
                        // logout();
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

      <div className="py-1 w-full text-center text-sm">v{version}</div>
    </main>
  );
}
