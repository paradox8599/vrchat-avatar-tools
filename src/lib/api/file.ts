import vrchat from "vrchat";
import { VRChatClient } from "./_base";

type UploadFileRequest = {
  fileId: string;
  fileType: string;
  contentType: string;
  versionId: number;
};

export type FileType = "file" | "signature" | "delta";

declare module "./_base" {
  export interface VRChatClient {
    getFiles(): Promise<vrchat.ModelFile[]>;

    showFile(fileId: string): Promise<vrchat.ModelFile>;

    downloadFile(
      fileId: string,
      version: number,
      fileType: FileType,
    ): Promise<unknown>;

    createFile(
      createFileRequest: vrchat.CreateFileRequest,
    ): Promise<vrchat.ModelFile>;

    createFileVersion(
      fileId: string,
      createFileVersionRequest?: vrchat.CreateFileVersionRequest,
    ): Promise<vrchat.ModelFile>;

    deleteFileVersion(
      fileId: string,
      versionId: number,
    ): Promise<vrchat.ModelFile>;

    uploadFile(uploadFileRequest: UploadFileRequest): Promise<void>;
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
  fileType: FileType,
) {
  await this.invoke(this.apis.vrchatDownloadFile, {
    username: this.username,
    fileId,
    versionId,
    fileType,
  });
};

VRChatClient.prototype.createFile = async function (
  createFileRequest: vrchat.CreateFileRequest,
) {
  const file = await this.invoke<vrchat.ModelFile>(this.apis.vrchatCreateFile, {
    username: this.username,
    createFileRequest,
  });
  return file;
};

VRChatClient.prototype.createFileVersion = async function (
  fileId: string,
  createFileVersionRequest?: vrchat.CreateFileVersionRequest,
) {
  const file = await this.invoke<vrchat.ModelFile>(
    this.apis.vrchatCreateFileVersion,
    { username: this.username, fileId, createFileVersionRequest },
  );
  return file;
};

VRChatClient.prototype.deleteFileVersion = async function (
  fileId: string,
  versionId: number,
) {
  const file = await this.invoke<vrchat.ModelFile>(
    this.apis.vrchatCreateFileVersion,
    { username: this.username, fileId, versionId },
  );
  return file;
};

VRChatClient.prototype.uploadFile = async function (
  uploadFileRequest: UploadFileRequest,
) {
  await this.invoke(this.apis.vrchatUploadFile, uploadFileRequest);
};
