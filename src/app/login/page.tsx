"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import React from "react";
import { LoginStatus } from "../../types";
import { vrchatLogin, vrchatVerifyEmailOtp, vrchatVerifyOtp } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { clearApp } from "@/state/app";
import { clearAvatars } from "@/state/avatars";
import { ThemeToggleIcon } from "@/components/settings/theme-toggle";
import { authState } from "@/state/auth";

export default function Page() {
  const [loginResult, setLoginResult] = React.useState<LoginStatus>(
    LoginStatus.NotLoggedIn,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const { toast } = useToast();

  function onLogin(formData: FormData) {
    setIsLoading(true);
    (async () => {
      try {
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const result = await vrchatLogin({ username, password });
        switch (result) {
          case LoginStatus.Success:
            // toast({ title: "登录成功" });
            break;
          case LoginStatus.NotLoggedIn:
            toast({ title: "登录失败" });
            break;
        }

        setLoginResult(result);
      } catch (e) {
        toast({ title: e as string });
      }
      setIsLoading(false);
    })();
  }

  async function onOtpInput(code: string) {
    setOtpCode(code);
    if (code.length !== 6) return;

    setIsLoading(true);
    (async () => {
      try {
        let result: LoginStatus;
        switch (authState.status) {
          case LoginStatus.NeedsVerify:
            result = await vrchatVerifyOtp(code);
            break;
          case LoginStatus.NeedsEmailVerify:
            result = await vrchatVerifyEmailOtp(code);
            break;
          default:
            throw "暂无支持的验证方式";
        }
        switch (result) {
          case LoginStatus.Success:
            // toast({ title: "登录成功" });
            break;
          case LoginStatus.NotLoggedIn:
            toast({ title: "登录失败" });
            break;
          case LoginStatus.NeedsVerify:
          case LoginStatus.NeedsEmailVerify:
            toast({ title: "验证码错误" });
            break;
        }
      } catch (e) {
        toast({ title: e as string });
      }
      setLoginResult(authState.status);
      setOtpCode("");
      setIsLoading(false);
    })();
  }

  return (
    <main className="h-full p-4 flex-col flex-center">
      {/* Login */}
      {[undefined, LoginStatus.NotLoggedIn].includes(loginResult) && (
        <form
          className="max-w-sm w-full flex-col flex-center gap-2"
          action={onLogin}
        >
          <h1 className="font-bold">登录 VRCHAT</h1>
          <p className="text-xs font-semibold">
            由于 VRChat 接口限制，登录后方可获取模型信息
          </p>
          <Input
            required
            readOnly={isLoading}
            disabled={isLoading}
            defaultValue={authState.credentials?.username}
            name="username"
            type="text"
            placeholder="用户名"
          />
          <Input
            required
            readOnly={isLoading}
            disabled={isLoading}
            defaultValue={authState.credentials?.password}
            name="password"
            type="password"
            placeholder="密码"
          />
          <Button
            className="uppercase min-w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin ease-out">
                <LoaderCircle />
              </span>
            ) : (
              "登录"
            )}
          </Button>
        </form>
      )}

      {/* Needs Verify */}
      {[LoginStatus.NeedsEmailVerify, LoginStatus.NeedsVerify].includes(
        loginResult,
      ) && (
        <div className="flex-center flex-col gap-4">
          <h1 className="font-semibold">输入验证码</h1>
          <InputOTP
            readOnly={isLoading}
            maxLength={6}
            minLength={6}
            value={otpCode}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={onOtpInput}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      )}

      <ThemeToggleIcon className="fixed bottom-4 left-4" />

      <Button
        className="fixed bottom-4 right-4"
        variant="outline"
        size="sm"
        onClick={() => {
          clearAvatars();
          clearApp();
          toast({ title: "已清空数据" });
        }}
      >
        清空数据
      </Button>
    </main>
  );
}
