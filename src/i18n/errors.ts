import { TaskMintError } from '../domain/errors';

export function userErrorMessage(error: unknown, fallback: string): string {
  return error instanceof TaskMintError ? error.message : fallback;
}
