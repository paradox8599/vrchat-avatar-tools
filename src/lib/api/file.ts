import vrchat from "vrchat";
import { VRChatClient } from "./_base";

declare module "./_base" {
  export interface VRChatClient {
    getFiles(): Promise<vrchat.ModelFile[]>;
    showFile(fileId: string): Promise<vrchat.ModelFile>;
  }
}

VRChatClient.prototype.getFiles = async function () {
  const files = await this.invoke<vrchat.ModelFile[]>(
    this.apis.vrchatGetFiles,
    { username: this.username },
  );
  return files;
};

VRChatClient.prototype.showFile = async function (fileId: string) {
  const file = await this.invoke<vrchat.ModelFile>(this.apis.vrchatShowFile, {
    username: this.username,
    fileId,
  });
  return file;
};
