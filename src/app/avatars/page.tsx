"use client";
import UserSelector from "@/components/avatars/user-selector";
// import { useSearchParams } from "next/navigation";
// import { Suspense } from "react";

export default function AvatarPage() {
  // const params = useSearchParams();
  // const id = params.get("id");
  //
  // if (id) {
  //   return (
  //     <main>
  //       <Suspense>
  //         <pre>Avatar {id}</pre>
  //       </Suspense>
  //     </main>
  //   );
  // }

  return (
    <main>
      <UserSelector />
    </main>
  );
}
