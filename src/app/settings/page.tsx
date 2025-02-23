"use client";
import PageHeader from "@/components/page-header";
import { AutoStartToggle } from "@/components/settings/auto-start";
import { NotificationToggle } from "@/components/settings/notification-toggle";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import UpdateButton from "@/components/settings/update-button";
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
import { VRChatClient } from "@/lib/api/_base";
import { settingsState } from "@/state/settings";
import React from "react";
import { useSnapshot } from "valtio";

export default function SettingsPage() {
  const settings = useSnapshot(settingsState);
  return (
    <main className="h-full w-full pt-4 flex flex-col items-center">
      <div className="h-full max-w-lg w-full px-4">
        <div className="px-4">
          <PageHeader title="设置" />
        </div>

        {/* options */}

        <ScrollArea className="h-full py-6">
          <div className="px-4 py-4 flex flex-col items-start justify-start gap-4">
            <NotificationToggle />
            <AutoStartToggle />
            <ThemeToggle />

            {/* avatar fetch interval */}
            <div className="w-full">
              <Label className="text-nowrap px-2">单次请求间隔时间 (秒)</Label>
              <Input
                type="number"
                value={settings.avatarFetchInterval}
                onChange={(e) => {
                  settingsState.avatarFetchInterval = Number.parseInt(
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
                  settingsState.avatarStatusExpiresHr = parsed;
                }}
              />
            </div>

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
                    <Button
                      variant="outline"
                      onClick={() => VRChatClient.new().logout()}
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

            <UpdateButton />
          </div>
        </ScrollArea>
      </div>
    </main>
  );
}
