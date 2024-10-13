import vrchat from "vrchat";
import { VRChatClient } from "./_base";

declare module "./_base" {
  export interface VRChatClient {
    getFiles(): Promise<vrchat.ModelFile[]>;
    showFile(fileId: string): Promise<vrchat.ModelFile>;
    downloadFile(fileId: string, version: number): Promise<unknown>;
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

VRChatClient.prototype.downloadFile = async function (
  fileId: string,
  versionId: number,
) {
  const file = await this.invoke<unknown>(this.apis.vrchatDownloadFile, {
    username: this.username,
    fileId,
    versionId,
  });
  return file;
};
