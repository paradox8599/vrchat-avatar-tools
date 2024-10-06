import { ROUTE_HOME, ROUTES } from "@/routes";
import { appState } from "@/state/app";
import { myAuthState } from "@/state/auth";
import { LoginStatus } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";

export default function useRoutes() {
  const path = usePathname();
  const router = useRouter();
  const { init, reachable, updated } = useSnapshot(appState);
  const auth = useSnapshot(myAuthState);

  React.useEffect(() => {
    if (router === undefined) return;
    if (path === undefined) return;
    if (reachable === undefined) return;
    if (updated === undefined) return;
    if (init === undefined) return;
    if (auth === undefined) return;

    // console.log("-------- start route check --------");

    // check connectivity, before everything else

    // console.log("reachable", reachable, "at", path);
    if (!appState.reachable) {
      if (path !== ROUTES.start) {
        // console.log("redirecting to start");
        router.replace(ROUTES.start);
      }
      return;
    }

    // if internet is connected, make sure updated

    // console.log("updated", updated, "at", path);
    if (!appState.updated && !appState.version) {
      if (path !== ROUTES.update) {
        // console.log("redirecting to update");
        router.replace(ROUTES.update);
      }
      return;
    }

    // then make sure app is initialized

    // console.log("initialized", init, "at", path);
    if (!appState.init) {
      if (path !== ROUTES.start) {
        // console.log("redirecting to start");
        router.replace(ROUTES.start);
      }
      return;
    }

    // do not redirect on manual update
    if (appState.updated === false) return;

    // if not logged in, redirect to login page

    // console.log("logged in", auth.status === LoginStatus.Success, "at", path);
    if (myAuthState.status !== LoginStatus.Success) {
      if (path !== ROUTES.login) {
        // console.log("redirecting to login");
        router.replace(ROUTES.login);
      }
      return;
    }

    // if everything is fine and at init/login page, redirect to home

    // console.log("path", path);
    if (
      path === ROUTES.start ||
      path === ROUTES.login ||
      path === ROUTES.update
    ) {
      // console.log("redirecting to home");
      router.replace(ROUTE_HOME);
      return;
    }

    // console.log("-------- all good --------");
  }, [path, reachable, updated, init, auth, router]);
}
