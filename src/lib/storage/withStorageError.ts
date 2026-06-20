import { getStorageErrorMessage } from "@/lib/storage/storageErrorMessage";

export async function withStorageError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(getStorageErrorMessage(error));
  }
}
