function getEnvString(variable: string): string | null {
  const value = process.env[variable] ?? null;
  return value;
}

// Environment variables
export const SMARTY_AUTH_ID = getEnvString('SMARTY_AUTH_ID');
export const SMARTY_AUTH_TOKEN = getEnvString('SMARTY_AUTH_TOKEN');
