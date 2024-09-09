"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appState } from "@/state/app";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSnapshot } from "valtio";

export default function Page() {
  const { settings } = useSnapshot(appState);
  return (
    <main className="w-full py-4 flex flex-col items-center">
      <div className="max-w-lg w-full">
        {/* header */}
        <div className="relative flex items-center justify-center">
          <Button
            asChild
            variant="link"
            className="absolute left-0 top-0 bottom-0"
          >
            <Link href="/">
              <div className="flex justify-start items-center w-fit py-2">
                <ChevronLeft />
                返回
              </div>
            </Link>
          </Button>

          <h1 className="font-semibold text-xl">设置</h1>
        </div>

        {/* options */}
        <div className="px-4 py-8 flex flex-col items-start justify-start gap-6">
          {/* avatar fetch interval */}
          <div className="w-full">
            <Label htmlFor="avatar-fetch-interval" className="text-nowrap px-2">
              单个请求间隔时间 (毫秒)
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
              数据更新间隔 (小时)
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
      </div>
    </main>
  );
}
