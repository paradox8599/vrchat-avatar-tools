"use client";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AvatarCard from "@/components/user-avatars/avatar-card";
import { useAuth } from "@/hooks/app/use-auth";
import { useUserAvatars } from "@/hooks/avatars/use-user-avatars";
import { cn } from "@/lib/utils";
import { me } from "@/state/auth";
import { RefreshCw } from "lucide-react";
import React from "react";

function RefreshButton({ className }: { className?: string }) {
  const { mutate, isLoading } = useUserAvatars(me.username);
  const [loading, setLoading] = React.useState(false);

  async function startLoading() {
    setLoading(true);
    await Promise.all([
      mutate([]),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startLoading}
      className={className}
    >
      <RefreshCw
        size={18}
        className={cn(isLoading || loading ? "animate-spin duration-500" : "")}
      />
    </Button>
  );
}

export default function UserAvatarPage() {
  const { avatars } = useUserAvatars(me.username);
  const { client } = useAuth();

  return (
    <main className="px-4 h-full flex flex-col items-center">
      {/* <div className="flex gap-2"> */}
      {/*   <Button */}
      {/*     onClick={async () => { */}
      {/*       const file = await client.createFile(); */}
      {/*       console.log("created", file); */}
      {/*     }} */}
      {/*   > */}
      {/*     Create */}
      {/*   </Button> */}
      {/*   <Button */}
      {/*     onClick={async () => { */}
      {/*       const file = await client.deleteFile( */}
      {/*         "file_8427dcbb-7264-4bef-997e-40b74e884f47", */}
      {/*       ); */}
      {/*       console.log("deleted", file); */}
      {/*     }} */}
      {/*   > */}
      {/*     Delete */}
      {/*   </Button> */}
      {/*   <Button */}
      {/*     onClick={async () => { */}
      {/*       const files = await client.getFiles(); */}
      {/*       // files = files.toReversed(); */}
      {/*       // files = [files[0], files[1]]; */}
      {/*       console.log("get files", files); */}
      {/*     }} */}
      {/*   > */}
      {/*     Get */}
      {/*   </Button> */}
      {/*   <Button */}
      {/*     onClick={async () => { */}
      {/*       const nf = await client.showFile(""); */}
      {/*       const nfvv = [...nf.versions].pop()!.version; */}
      {/*       await client.deleteFileVersion(nf.id, nfvv); */}
      {/*     }} */}
      {/*   > */}
      {/*     Delete */}
      {/*   </Button> */}
      {/*   <Button */}
      {/*     onClick={async () => { */}
      {/*       const of = await client.showFile( */}
      {/*         "file_01cb81b7-0182-4b79-ac9f-f340b59c8ba1", */}
      {/*       ); */}
      {/*       console.log("old", of); */}
      {/**/}
      {/*       const ofv = [...of.versions].pop()!; */}
      {/*       await client.downloadFile(of.id, ofv.version, "file"); */}
      {/*       await client.downloadFile(of.id, ofv.version, "signature"); */}
      {/**/}
      {/*       const nf = await client.showFile(""); */}
      {/*       console.log("new", nf); */}
      {/**/}
      {/*       let nfvv = null; */}
      {/*       try { */}
      {/*         const sig = ofv.signature!; */}
      {/*         const f = ofv.file!; */}
      {/*         const file = await client.createFileVersion(nf.id, { */}
      {/*           signatureMd5: sig.md5!, */}
      {/*           signatureSizeInBytes: sig.sizeInBytes, */}
      {/*           fileMd5: f.md5!, */}
      {/*           fileSizeInBytes: f.sizeInBytes, */}
      {/*         }); */}
      {/*         console.log("new version created", file); */}
      {/*         const nfv = [...file.versions].pop()!; */}
      {/*         nfvv = nfv.version; */}
      {/*         console.log("new version", nfvv); */}
      {/*         await client.uploadFile({ */}
      {/*           mimeType: of.mimeType, */}
      {/*           from: { id: of.id, version: ofv.version }, */}
      {/*           to: { id: nf.id, version: nfv.version }, */}
      {/*         }); */}
      {/*         console.log("uploaded"); */}
      {/*       } catch (e) { */}
      {/*         if (nfvv !== null) { */}
      {/*           await client.deleteFileVersion(nf.id, nfvv); */}
      {/*         } */}
      {/*       } */}
      {/**/}
      {/*       const nvf = await client.showFile( */}
      {/*         "file_8427dcbb-7264-4bef-997e-40b74e884f47", */}
      {/*       ); */}
      {/*       console.log("new", nvf); */}
      {/*     }} */}
      {/*   > */}
      {/*     Create & Upload */}
      {/*   </Button> */}
      {/* </div> */}

      <div className="w-full h-full">
        <PageHeader title="模型管理">
          <RefreshButton />
        </PageHeader>

        <ScrollArea className="h-full">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col items-center gap-2">
              {avatars.map((avatar) => (
                <AvatarCard key={avatar.id} avatar={avatar} client={client} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </main>
  );
}
