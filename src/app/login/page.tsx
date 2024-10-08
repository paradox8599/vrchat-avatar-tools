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
  vrchatLogin,
  vrchatVerifyEmailOtp,
  vrchatVerifyOtp,
} from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { appState } from "@/state/app";
import { clearAvatars } from "@/state/avatars";
import { ThemeToggleIcon } from "@/components/settings/theme-toggle";
import { useSnapshot } from "valtio";
import { clearAuths, me } from "@/state/auth";
import { clearSettings } from "@/state/settings";
import useAuth from "@/hooks/use-auth";

export default function Page() {
  const [loginResult, setLoginResult] = React.useState<LoginStatus>(
    LoginStatus.NotLoggedIn,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const { toast } = useToast();
  const { version } = useSnapshot(appState);
  const { auth, authMut } = useAuth();

  async function onLogin(formData: FormData) {
    setIsLoading(true);
    try {
      authMut.credentials = {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      };
      const result = await vrchatLogin(authMut.credentials);
      me.username = authMut.credentials.username;
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
      console.error(e);
      toast({ title: e as string });
    }
    setIsLoading(false);
  }

  async function onOtpInput(code: string) {
    setOtpCode(code);
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      if (!auth.credentials) throw "未登录";
      let result: LoginStatus;
      switch (auth.status) {
        case LoginStatus.NeedsVerify:
          result = await vrchatVerifyOtp({
            username: auth.credentials.username,
            code,
          });
          break;
        case LoginStatus.NeedsEmailVerify:
          result = await vrchatVerifyEmailOtp({
            username: auth.credentials.username,
            code,
          });
          break;
        default:
          throw "暂无支持的验证方式";
      }
      switch (result) {
        case LoginStatus.Success:
          me.username = auth.credentials.username;
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
    } finally {
      setLoginResult(auth.status);
      setOtpCode("");
      setIsLoading(false);
    }
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
            defaultValue={auth.credentials?.username}
            name="username"
            type="text"
            placeholder="用户名"
          />
          <Input
            required
            readOnly={isLoading}
            disabled={isLoading}
            defaultValue={auth.credentials?.password}
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

      {/* bottom */}
      <div className="w-full fixed bottom-4">
        <div className="flex flex-row justify-between items-center px-4">
          <ThemeToggleIcon />

          <div className="absolute left-0 right-0 text-center text-sm">
            {version}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAvatars();
              clearSettings();
              clearAuths();
              toast({ title: "已清空数据" });
            }}
          >
            清空数据
          </Button>
        </div>
      </div>
    </main>
  );
}
