// Mock for chalk to avoid ESM import issues in Jest
const chalk = {
  red: (str: string) => str,
  yellow: (str: string) => str,
  green: (str: string) => str,
  blue: (str: string) => str,
  gray: (str: string) => str,
  bold: (str: string) => str,
  dim: (str: string) => str,
};

export default chalk;
