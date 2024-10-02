"use client";
import { Button } from "@/components/ui/button";
import { checkUpdate } from "@/lib/update";
import { ROUTES } from "@/routes";
import { appState } from "@/state/app";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";

export default function UpdateButton() {
  const { version, updated } = useSnapshot(appState);
  const [checkingUpdate, setCheckingUpdate] = React.useState(false);
  const router = useRouter();
  return (
    <div className="py-4 w-full text-center text-sm flex justify-center items-center gap-4 h-8">
      <span>{version}</span>
      {checkingUpdate ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (updated === false) {
              router.push(ROUTES.update);
            } else {
              setCheckingUpdate(true);
              await checkUpdate();
              setCheckingUpdate(false);
            }
          }}
        >
          {updated === false ? "发现更新，点击安装" : "检查更新"}
        </Button>
      )}{" "}
    </div>
  );
}
