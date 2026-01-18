import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

/** Лёгкий «сервер» на Python для скоростных предсказаний (stdin/stdout). */
export class MLPredictor {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private q: Array<(v: number) => void> = [];
  private errQ: Array<(e: any) => void> = [];
  private ready = false;
  private pyPath: string;
  private modelPath: string;
  private scriptPath: string;

  constructor(opts: { python?: string; modelPath: string }) {
    this.pyPath = opts.python || "python3";
    this.modelPath = opts.modelPath;
    this.scriptPath = this.ensureScript();
  }

  private ensureScript(): string {
    const code = `
import sys, json, argparse, joblib
parser = argparse.ArgumentParser()
parser.add_argument("--model", required=True)
args = parser.parse_args()
model = joblib.load(args.model)
for line in sys.stdin:
    line=line.strip()
    if not line: continue
    try:
        obj=json.loads(line)
        x=obj.get("x", [])
        y=float(model.predict([x])[0])
        sys.stdout.write(json.dumps({"y": y}) + "\\n")
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write("ERR: %s\\n" % e)
        sys.stderr.flush()
`;
    const f = path.join(os.tmpdir(), "ml_predict_server.py");
    fs.writeFileSync(f, code, "utf8");
    return f;
  }

  async start(): Promise<void> {
    if (this.proc) return;
    this.proc = spawn(this.pyPath, ["-u", this.scriptPath, "--model", this.modelPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.proc.stderr.setEncoding("utf8");
    this.proc.stderr.on("data", (d) => console.error("[ML]", String(d).trim()));

    let buf = "";
    this.proc.stdout.setEncoding("utf8");
    this.proc.stdout.on("data", (chunk: string) => {
      buf += chunk;
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        try {
          const obj = JSON.parse(line);
          const res = this.q.shift();
          this.errQ.shift();
          res && res(obj.y);
        } catch (e) {
          const rej = this.errQ.shift();
          rej && rej(e);
        }
      }
    });

    this.proc.on("close", (code) => {
      while (this.errQ.length)
        (this.errQ.shift() as any)?.(new Error("ML exited " + code));
      this.q = [];
      this.proc = null;
    });

    this.ready = true;
  }

  async predict(x: number[]): Promise<number> {
    if (!this.ready) await this.start();
    return new Promise<number>((resolve, reject) => {
      if (!this.proc) return reject(new Error("ML not running"));
      this.q.push(resolve);
      this.errQ.push(reject);
      this.proc.stdin.write(JSON.stringify({ x }) + "\n", "utf8");
    });
  }

  close() {
    try {
      this.proc?.kill();
    } catch {}
    this.proc = null;
    this.ready = false;
  }
}
