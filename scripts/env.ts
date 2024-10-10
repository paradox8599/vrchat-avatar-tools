import fs from "fs";

enum Action {
  Replace = "on",
  Restore = "off",
}

const action: Action = Bun.argv[2] as Action;

if (action !== Action.Replace && action !== Action.Restore) {
  console.log("invalid action: 'on' or 'off'");
  process.exit(1);
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

class TextFile {
  filename: string;
  text: string;

  constructor(filename: string) {
    this.filename = filename;
    this.text = fs.readFileSync(this.filename).toString();
  }

  write(text: string) {
    fs.writeFileSync(this.filename, text);
  }

  replace(template: string, text: string) {
    if (text !== "") {
      if (action === Action.Replace) {
        this.text = this.text.replaceAll(template, text);
        console.log(
          `[${this.filename}] ${action} "${template}" with "${text}"`,
        );
      } else {
        this.text = this.text.replaceAll(text, template);
        console.log(
          `[${this.filename}] ${action} from "${text}" to "${template}"`,
        );
      }
    }
    return this;
  }
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

const envs = [
  {
    tmpl: "{{APTABASE_HOST}}",
    value: process.env.APTABASE_HOST!,
  },
  {
    tmpl: "{{APTABASE_KEY}}",
    value: process.env.APTABASE_KEY!,
  },
];

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

console.log("\n\n");

const files = [new TextFile("src-tauri/src/constants.rs")];

for (const env of envs) {
  files
    .map((f) => f.replace(env.tmpl, env.value))
    .forEach((f) => f.write(f.text));
}

console.log("\n\n");
