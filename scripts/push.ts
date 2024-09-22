import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateUpdateInfo } from "./lib/updater";
import { getLatestReleaseFile } from "./lib/files";

const prefix = "release/";
const Bucket = "vrchat-avatar-tools";

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ID!,
    secretAccessKey: process.env.R2_SECRET!,
  },
});

async function pushLatestInfo() {
  const latest = generateUpdateInfo();
  const putCmd = new PutObjectCommand({
    Bucket,
    Key: `${prefix}latest.json`,
    Body: JSON.stringify(latest),
    ContentType: "application/json",
  });

  console.log("Pushing [latest.json]...");
  const putResult = await client.send(putCmd);
  if (putResult.$metadata.httpStatusCode === 200) {
    console.log("Latest info pushed");
  }
}

async function pushLatestFile() {
  const { full, file, version } = getLatestReleaseFile();
  const buffer = fs.readFileSync(full);
  const size = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(`Pushing [${file}] (${size}mb)...`);

  async function putLatest() {
    const latestFilename = file.replace(version.raw, "latest");
    const putLatestCmd = new PutObjectCommand({
      Bucket,
      Key: `${prefix}${latestFilename}`,
      Body: buffer,
      ContentType: "application/x-msdownload",
    });
    const putResult = await client.send(putLatestCmd);
    if (putResult.$metadata.httpStatusCode === 200) {
      console.log("Latest installer pushed");
    }
  }

  async function putVerLatest() {
    const putCmd = new PutObjectCommand({
      Bucket,
      Key: `${prefix}${file}`,
      Body: buffer,
      ContentType: "application/x-msdownload",
    });
    const putResult = await client.send(putCmd);
    if (putResult.$metadata.httpStatusCode === 200) {
      console.log("Versioned installer pushed");
    }
  }

  await Promise.all([putLatest(), putVerLatest()]);
}

async function pushAll() {
  await Promise.all([pushLatestInfo(), pushLatestFile()]);
}

pushAll();
