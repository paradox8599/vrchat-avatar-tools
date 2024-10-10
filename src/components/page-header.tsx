import React from "react";

export default function PageHeader({
  children,
  title,
}: React.PropsWithChildren<{
  title?: string;
}>) {
  return (
    <div className="px-2 py-4 flex items-center justify-start gap-4">
      <h1 className="font-bold text-xl">{title}</h1>
      {children}
    </div>
  );
}
