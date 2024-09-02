declare module "svg2img" {
  interface Options {
    format?: string;
    width?: number;
    height?: number;
    quality?: number;
  }

  export default function svg2img(
    svg: string,
    options: Options,
    callback: (error: Error | null, buffer: Buffer) => void
  ): void;
}
