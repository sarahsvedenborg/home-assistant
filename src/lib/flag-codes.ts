export const FLAG_CODE_PATTERN = /^[a-z]{2}(?:-[a-z]{3})?$/;

export function isFlagCode(code: string): boolean {
  return FLAG_CODE_PATTERN.test(code);
}
