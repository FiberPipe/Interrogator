const grpc = require("@grpc/grpc-js");
const protoLoader  = require("@grpc/proto-loader");
const path = require("path");

// Загружаем proto-файл
const PROTO_PATH = path.join(process.cwd(), "./proto/discovery-api.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).interrogator.api.v1;

// Реализация DiscoveryService
const discoveryService = {
  ListBdiModules: (call, callback) => {
    callback(null, {
      modules: [
        { module_id: 1, description: "БДИ №1", address: "192.168.1.10:5000" },
        { module_id: 2, description: "БДИ №2", address: "192.168.1.11:5000" },
      ],
    });
  },

  ListDrivers: (call, callback) => {
    callback(null, {
      drivers: [
        { driver_id: 1, description: "Лазерный драйвер 1", address: "192.168.1.20:5001" },
        { driver_id: 2, description: "Лазерный драйвер 2", address: "192.168.1.21:5001" },
      ],
    });
  },

  ListTestSources: (call, callback) => {
    callback(null, {
      sources: [
        { source_id: 1, description: "Тестовый источник 1", address: "192.168.1.30:5002" },
        { source_id: 2, description: "Тестовый источник 2", address: "192.168.1.31:5002" },
      ],
    });
  },
};

// Запуск сервера
function main() {
  const server = new grpc.Server();
  server.addService(proto.DiscoveryService.service, discoveryService);

  const address = "0.0.0.0:50051";
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Ошибка запуска сервера:", err);
      return;
    }
    console.log(`🚀 gRPC DiscoveryService запущен на ${address}`);
    server.start();
  });
}

main();
