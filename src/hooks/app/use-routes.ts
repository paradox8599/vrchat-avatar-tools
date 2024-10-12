import { ROUTE_HOME, ROUTES } from "@/routes";
import { appState } from "@/state/app";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";
import { useAuth } from "./use-auth";

export default function useRoutes() {
  const path = usePathname();
  const router = useRouter();
  const { init, reachable, updated } = useSnapshot(appState);
  const { loggedIn, auth } = useAuth();

  React.useEffect(() => {
    if (router === undefined) return;
    if (path === undefined) return;
    if (reachable === undefined) return;
    if (updated === undefined) return;
    if (init === undefined) return;
    if (loggedIn === undefined) return;

    // console.log(`-------- start route check at ${path} --------`);

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

    // console.log("logged in", loggedIn, "at", path);
    if (!loggedIn) {
      if (path !== ROUTES.login) {
        // console.log("redirecting to login");
        router.replace(ROUTES.login);
      }
      return;
    }

    // if everything is fine and at init/login page, redirect to home

    // console.log("-------- all good --------");
    if (
      path === ROUTES.start ||
      path === ROUTES.login ||
      path === ROUTES.update
    ) {
      // console.log("redirecting to home");
      router.replace(ROUTE_HOME);
      return;
    }
  }, [path, reachable, updated, init, router, loggedIn, auth]);
}
