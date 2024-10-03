export enum ErrorName {
  StatusError = "UnsuccessfulStatus",
  ConnectionError = "NoConnection",
  UnknownError = "Unknown",
}
// export type ErrorName = "UnsuccessfulStatus" | "NoConnection" | "Unknown";
type ErrorMessage = Record<ErrorName, unknown>;

export type StatusError = {
  type: ErrorName.StatusError;
  status: number;
  message: string;
};

export type NoConnectionError = {
  type: ErrorName.ConnectionError;
  message: string;
};

export type UnknownError = {
  type: ErrorName.UnknownError;
  message: string;
};

export type ApiError = StatusError | NoConnectionError | UnknownError;

export function parseError(err: unknown): ApiError {
  const [name, value] = Object.entries(err as ErrorMessage)[0];

  switch (name as ErrorName) {
    case ErrorName.StatusError:
      const [status, json] = value as [number, string];
      const errMsg = JSON.parse(json) as {
        error: { message: string; status: number };
      };

      return {
        type: ErrorName.StatusError,
        status,
        message: errMsg.error.message,
      };

    case ErrorName.ConnectionError:
      return {
        type: ErrorName.ConnectionError,
        message: value as string,
      };
    case ErrorName.UnknownError:
      return {
        type: ErrorName.UnknownError,
        message: value as string,
      };
  }
}
