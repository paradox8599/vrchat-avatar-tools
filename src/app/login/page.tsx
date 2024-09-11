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
import { vrchatGetAvatarInfo, vrchatGetMe, vrchatLogin, vrchatVerifyEmailOtp } from "@/lib/api";

export default function Page() {
  const [loginResult, setLoginResult] = React.useState<LoginStatus>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");

  async function onLogin(formData: FormData) {
    setIsLoading(true);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const result = await vrchatLogin({ username, password });
    setLoginResult(result);
    setIsLoading(false);
  }

  async function onOtpInput(code: string) {
    setOtpCode(code);
    if (code.length !== 6) return;
    setIsLoading(true);
    await vrchatVerifyEmailOtp(code);
    setOtpCode("");
    setIsLoading(false);
  }

  return (
    <main className="h-full p-4 flex-col flex-center">
      <div>
        <Button onClick={async () => {
          await vrchatGetMe()
        }}>GetMe</Button>

        <Button onClick={async () => {
          await vrchatVerifyEmailOtp("123456")
        }}>verify email</Button>

        <Button onClick={async () => {
          await vrchatGetAvatarInfo("usr_44e01fa9-5017-484e-bf91-3bb64bb2d2f9")
        }}>get avatar info</Button>

      </div>
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
