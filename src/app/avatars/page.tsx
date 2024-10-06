"use client";
import { useSearchParams } from "next/navigation";

export default function AvatarPage() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <main>
      <pre>Avatar {id}</pre>
    </main>
  );
}
