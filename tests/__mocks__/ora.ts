// Mock for ora to avoid ESM import issues in Jest
const oraMock = {
  start: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  warn: jest.fn().mockReturnThis(),
  info: jest.fn().mockReturnThis(),
  text: '',
};

const ora = jest.fn(() => oraMock);

export default ora;
export type Ora = typeof oraMock;
