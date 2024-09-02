declare module "xbr-js" {
  export function xbr2x(
    array: Uint32Array,
    width: number,
    height: number,
    options?: { blendColors?: boolean; scaleAlpha?: boolean }
  ): Uint32Array;

  export function xbr3x(
    array: Uint32Array,
    width: number,
    height: number,
    options?: { blendColors?: boolean; scaleAlpha?: boolean }
  ): Uint32Array;

  export function xbr4x(
    array: Uint32Array,
    width: number,
    height: number,
    options?: { blendColors?: boolean; scaleAlpha?: boolean }
  ): Uint32Array;
}
