// Runtime environment variable validation
export function getEnvVar(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing environment variable: ${key}`);
    console.error('Available vars:', Object.keys(process.env).join(', '));
  }
  return value;
}
