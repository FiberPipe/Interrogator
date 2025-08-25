import { BrowserWindow } from "electron";
import { FileWatcherService } from "../file-watcher";
import { Client } from "@grpc/grpc-js";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// Типы из discovery.proto
interface BdiModuleInfo {
  module_id: number;
  description: string;
  address: string;
}

interface DriverInfo {
  driver_id: number;
  description: string;
  address: string;
}

interface TestSourceInfo {
  source_id: number;
  description: string;
  address: string;
}

interface DiscoveryServiceClient extends Client {
  ListBdiModules(
    req: Record<string, never>,
    callback: (err: grpc.ServiceError | null, response: { modules: BdiModuleInfo[] }) => void
  ): void;

  ListDrivers(
    req: Record<string, never>,
    callback: (err: grpc.ServiceError | null, response: { drivers: DriverInfo[] }) => void
  ): void;

  ListTestSources(
    req: Record<string, never>,
    callback: (err: grpc.ServiceError | null, response: { sources: TestSourceInfo[] }) => void
  ): void;
}

export class ApiService {
  #fileWatcher: FileWatcherService;
  #client: DiscoveryServiceClient;

  constructor(window: BrowserWindow) {
    this.#fileWatcher = new FileWatcherService("message", window);

    // Загружаем gRPC-клиент для DiscoveryService
    const PROTO_PATH = path.join(__dirname, "./proto/discovery-api.proto");
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = (grpc.loadPackageDefinition(packageDefinition) as any).interrogator.api.v1;
    this.#client = new proto.DiscoveryService(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
  }

  start(): void {
    // можно будет запустить автоопрос или инициализацию
  }

  async listBdiModules(): Promise<BdiModuleInfo[]> {
    return new Promise((resolve, reject) => {
      this.#client.ListBdiModules({}, (err, response) => {
        if (err) return reject(err);
        resolve(response.modules);
      });
    });
  }

  async listDrivers(): Promise<DriverInfo[]> {
    return new Promise((resolve, reject) => {
      this.#client.ListDrivers({}, (err, response) => {
        if (err) return reject(err);
        resolve(response.drivers);
      });
    });
  }

  async listTestSources(): Promise<TestSourceInfo[]> {
    return new Promise((resolve, reject) => {
      this.#client.ListTestSources({}, (err, response) => {
        if (err) return reject(err);
        resolve(response.sources);
      });
    });
  }
}
