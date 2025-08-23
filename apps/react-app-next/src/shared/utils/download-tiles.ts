const fs = require("fs");
const path = require("path");

// ----------------------------
// Конфигурация
// ----------------------------
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OUTPUT_DIR = path.resolve("src", "shared", "assets", "tiles");
const MIN_ZOOM = 10;
const MAX_ZOOM = 13;

// Москва — bounding box
const BOUNDS = {
    north: 56.0,
    south: 55.5,
    west: 37.3,
    east: 37.9,
};

// ----------------------------
// Utils
// ----------------------------
function lon2tile(lon: number, zoom: number): number {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number): number {
    return Math.floor(
        ((1 -
            Math.log(
                Math.tan((lat * Math.PI) / 180) +
                1 / Math.cos((lat * Math.PI) / 180)
            ) /
            Math.PI) /
            2) *
        Math.pow(2, zoom)
    );
}

// ----------------------------
// Основная функция
// ----------------------------
async function downloadTiles(): Promise<void> {
    for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
        const xStart = lon2tile(BOUNDS.west, z);
        const xEnd = lon2tile(BOUNDS.east, z);
        const yStart = lat2tile(BOUNDS.north, z);
        const yEnd = lat2tile(BOUNDS.south, z);

        console.log(`Zoom ${z}: x=${xStart}..${xEnd}, y=${yStart}..${yEnd}`);

        for (let x = xStart; x <= xEnd; x++) {
            for (let y = yStart; y <= yEnd; y++) {
                const url = TILE_URL.replace("{z}", z.toString())
                    .replace("{x}", x.toString())
                    .replace("{y}", y.toString());

                const dir = path.join(OUTPUT_DIR, z.toString(), x.toString());
                const filePath = path.join(dir, `${y}.png`);

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                if (fs.existsSync(filePath)) {
                    console.log(`⏩ Пропускаю (уже скачан): ${filePath}`);
                    continue;
                }

                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Ошибка загрузки ${url}`);
                
                    const arrayBuffer = await res.arrayBuffer();
                    const uint8 = new Uint8Array(arrayBuffer);
                
                    fs.writeFileSync(filePath, uint8);
                    console.log(`✅ Скачан: ${filePath}`);
                } catch (err) {
                    console.error(`❌ Ошибка: ${url}`, (err as Error).message);
                }
                
            }
        }
    }
}

// Запуск
downloadTiles()
    .then(() => {
        console.log("🎉 Все тайлы скачаны");
    })
    .catch((err) => {
        console.error("Ошибка загрузки тайлов:", err);
    });
