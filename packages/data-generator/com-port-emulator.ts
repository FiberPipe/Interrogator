import { EventEmitter } from "node:events";

// === Псевдо COM-порт для эмуляции данных ===
class FakeSerialPort extends EventEmitter {
  private interval: NodeJS.Timer | null = null;
  private t0: number | null = null;

  constructor(private frequencyMs: number = 500) {
    super();
  }

  private generatePacket(): any {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0] + "." + now.getMilliseconds();

    const pkt: any = { time: timeStr };
    for (let i = 0; i < 16; i++) {
      pkt[`P${i}`] = +(2 + Math.random()).toFixed(3);
      pkt[`stdDev${i}`] = +(Math.random() * 0.05).toFixed(3);
    }

    pkt.P1 = +(2.5 + Math.random() * 0.1).toFixed(3);
    pkt.P2 = +(2.8 + Math.random() * 0.1).toFixed(3);
    pkt.P4 = +(2.6 + Math.random() * 0.1).toFixed(3);
    pkt.P12 = +(2.55 + Math.random() * 0.1).toFixed(3);

    const P1_norm = pkt.P1 - 2.515;
    const P2_norm = pkt.P2 - 2.820;
    const P4_norm = pkt.P4 - 2.600;
    const P12_norm = pkt.P12 - 2.560;

    const weights = [P1_norm, P2_norm, P4_norm, P12_norm];
    const lambdas = [1547.1, 1547.9, 1548.7, 1546.25];

    const sumWeights = weights.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
    pkt.lambda =
      sumWeights > 0
        ? weights.reduce((acc, w, i) => acc + (isFinite(w) ? w * lambdas[i] : 0), 0) / sumWeights
        : NaN;

    const t_pkt = now.getTime() / 1000;
    if (this.t0 === null) this.t0 = t_pkt;
    pkt.t_now = t_pkt - this.t0;

    return pkt;
  }

  public open() {
    console.log("Эмулятор COM13: порт открыт");
    this.interval = setInterval(() => {
      const pkt = this.generatePacket();
      this.emit("data", JSON.stringify(pkt));
    }, this.frequencyMs);
  }

  public close() {
    console.log("Эмулятор COM13: порт закрыт");
  }
}

// === Использование ===
const port = new FakeSerialPort();
const parser = port; // совместим с EventEmitter и 'data' событием

parser.on("data", (line: string) => {
  // здесь можно вставить handleData(line)
  console.log(line);
});

// "Открываем" эмулятор вместо реального COM13
port.open();

// Обработка выхода
process.on("SIGINT", () => {
  port.close();
  console.log("Эмулятор завершён пользователем");
  process.exit();
});
