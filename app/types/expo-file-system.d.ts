declare module "expo-file-system" {
  export const documentDirectory: string | null;

  export function readAsStringAsync(
    fileUri: string,
    options?: { encoding?: "utf8" | "base64" }
  ): Promise<string>;
}