"use client";
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
import { useSnapshot } from "valtio";

export default function Page() {
  const { settings } = useSnapshot(appState);
  return (
    <main className="w-full sm:py-4 flex flex-col items-center">
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
        <div className="py-4 flex flex-col items-start justify-start gap-4">
          {/* avatar fetch interval */}
          <div className="w-full">
            <Label htmlFor="avatar-fetch-interval" className="text-nowrap px-2">
              单次请求间隔时间 (毫秒)
            </Label>
            <Input
              name="avatar-fetch-interval"
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
            <Label htmlFor="avatar-expires" className="text-nowrap px-2">
              模型数据更新间隔 (小时)
            </Label>
            <Input
              name="avatar-expires"
              type="number"
              value={settings.avatarStatusExpiresHr}
              onChange={(e) => {
                appState.settings.avatarStatusExpiresHr = Number.parseInt(
                  e.target.value,
                );
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
