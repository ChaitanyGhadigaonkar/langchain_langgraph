export type Output<T = Record<string, unknown>> = {
  success: boolean;
  message: string;
} & T;
