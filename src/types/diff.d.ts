declare module "diff" {
  export function diffLines(
    oldStr: string,
    newStr: string,
  ): Array<{
    value: string;
    added?: boolean;
    removed?: boolean;
  }>;

  export function diffWords(
    oldStr: string,
    newStr: string,
  ): Array<{
    value: string;
    added?: boolean;
    removed?: boolean;
  }>;

  export function diffChars(
    oldStr: string,
    newStr: string,
  ): Array<{
    value: string;
    added?: boolean;
    removed?: boolean;
  }>;
}
