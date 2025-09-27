import * as path from "node:path";
import * as os from "node:os";

export const DEFAULT_INPUTS_PATH = path.join(os.homedir(), "Documents", "Interrogator", "inputs.json");
export const DEFAULT_FILE_PATHS_PATH = path.join(os.homedir(), "Documents", "Interrogator", "file_paths.json");
