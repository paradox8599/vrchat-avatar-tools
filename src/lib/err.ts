export type ErrorName = "StatusError" | "UnknownError";
type ErrorMessage = Record<ErrorName, unknown>;

export type StatusError = {
  type: "StatusError";
  status: number;
  message: string;
};

export type UnknownError = {
  type: "UnknownError";
  message: string;
};

export type ApiError = StatusError | UnknownError;

export function parseError(err: unknown): ApiError {
  const [name, value] = Object.entries(err as ErrorMessage)[0];

  switch (name as ErrorName) {
    case "StatusError":
      const [status, json] = value as [number, string];
      const errMsg = JSON.parse(json) as {
        error: { message: string; status: number };
      };

      return {
        type: "StatusError",
        status,
        message: errMsg.error.message,
      };

    case "UnknownError":
      return { type: "UnknownError", message: value as string };
  }
}
