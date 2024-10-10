import { usePathname } from "next/navigation";
import React from "react";

export default function usePath() {
  const path = usePathname();
  const ref = React.useRef<string>("");

  React.useEffect(() => {
    if (path === ref.current) return;
    ref.current = path;
    // console.log(path);
  }, [path]);
}
