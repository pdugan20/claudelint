import { z } from 'zod';

/** Public IPv4 ranges accepted by the managed gatewayInternalNetworks setting. */
export const GatewayNetworksSchema = z
  .array(z.string().cidrv4())
  .max(4)
  .superRefine((values, context) => {
    const ranges: Array<[number, number]> = [];
    const privateRanges: Array<[number, number]> = [
      [0x0a000000, 0x0affffff],
      [0xac100000, 0xac1fffff],
      [0xc0a80000, 0xc0a8ffff],
    ];
    values.forEach((value, index) => {
      if (!z.string().cidrv4().safeParse(value).success) return;
      const [address, length] = value.split('/');
      const prefix = Number(length);
      if (prefix < 8) {
        context.addIssue({
          code: 'custom',
          path: [index],
          message: 'Network prefix must be between /8 and /32',
        });
        return;
      }
      const ip = address.split('.').reduce((n, octet) => n * 256 + Number(octet), 0);
      const size = 2 ** (32 - prefix);
      const start = Math.floor(ip / size) * size;
      const end = start + size - 1;
      if ([...privateRanges, ...ranges].some(([low, high]) => start <= high && end >= low)) {
        context.addIssue({
          code: 'custom',
          path: [index],
          message: 'Network overlaps private space or another configured network',
        });
      }
      ranges.push([start, end]);
    });
  });
