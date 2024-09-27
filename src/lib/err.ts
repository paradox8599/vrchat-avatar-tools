export type ErrorName =
  | "AuthFailed"
  | "AvatarNotFound"
  | "TooManyRequests"
  | "Unknown";

export type ErrorMessage = Record<ErrorName, string>;

export function parseError(err: unknown) {
  const [name, value] = Object.entries(err as ErrorMessage)[0];
  return { name: name as ErrorName, value };
}
