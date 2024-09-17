export function selectFile({
  accept,
}: React.InputHTMLAttributes<HTMLInputElement>): Promise<string> {
  return new Promise((res, rej) => {
    const input = document.createElement("input");
    input.type = "file";
    accept && (input.accept = accept);
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return res("");
      return res(await file.text());
    };
    input.onerror = rej;
    input.click();
  });
}

export function exportFile(
  lines: string[],
  filename: string,
  type: "text/plain" | "text/csv",
) {
  const blob = new Blob([lines.join("\n")], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
