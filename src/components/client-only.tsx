"use client";

import React from "react";

export default function ClientOnly({
  children,
  ...props
}: React.ComponentProps<"div">) {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  if (!isClient) return null;
  return <div {...props}>{children}</div>;
}
