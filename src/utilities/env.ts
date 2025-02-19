function getEnvString(variable: string): string | null {
  const value = process.env[variable] ?? null;
  return value;
}

// Environment variables
export const getSmartyAuthId = () => getEnvString('SMARTY_AUTH_ID');
export const getSmartyAuthToken = () => getEnvString('SMARTY_AUTH_TOKEN');
