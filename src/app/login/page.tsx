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
import {
  vrchatGetAvatarInfo,
  vrchatGetMe,
  vrchatLogin,
  vrchatVerifyEmailOtp,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const [loginResult, setLoginResult] = React.useState<LoginStatus>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const { toast } = useToast();

  async function onLogin(formData: FormData) {
    setIsLoading(true);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const result = await vrchatLogin({ username, password });
    switch (result) {
      case LoginStatus.Success:
        toast({ title: "登录成功" });
        break;
      case LoginStatus.Failed:
        toast({ title: "登录失败" });
        break;
    }
    setLoginResult(result);
    setIsLoading(false);
  }

  async function onOtpInput(code: string) {
    setOtpCode(code);
    if (code.length !== 6) return;
    setIsLoading(true);
    const result = await vrchatVerifyEmailOtp(code);
    switch (result) {
      case LoginStatus.Success:
        toast({ title: "登录成功" });
        break;
      case LoginStatus.Failed:
        toast({ title: "登录失败" });
        break;
      case LoginStatus.NeedsVerify:
        toast({ title: "验证码错误" });
        break;
    }
    setOtpCode("");
    setIsLoading(false);
  }

  return (
    <main className="h-full p-4 flex-col flex-center">
      {/* Login */}
      {[undefined, LoginStatus.Failed].includes(loginResult) && (
        <form
          className="max-w-sm w-full flex-col flex-center gap-2"
          action={onLogin}
        >
          <h1 className="font-bold">VRCHAT</h1>
          <p className="text-xs font-semibold">
            由于 VRChat 接口限制，登录后方可获取模型信息
          </p>
          <Input
            required
            readOnly={isLoading}
            name="username"
            type="text"
            placeholder="用户名"
          />
          <Input
            required
            readOnly={isLoading}
            name="password"
            type="password"
            placeholder="密码"
          />
          <Button className="uppercase min-w-full" type="submit">
            登录
          </Button>
        </form>
      )}

      {/* Needs Verify */}
      {loginResult === LoginStatus.NeedsVerify && (
        <div className="flex-center flex-col gap-4">
          <h1 className="font-semibold">输入验证码</h1>
          <InputOTP
            readOnly={isLoading}
            maxLength={6}
            minLength={6}
            value={otpCode}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={onOtpInput}
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
    </main>
  );
}
