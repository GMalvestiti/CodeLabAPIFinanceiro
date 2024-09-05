export type ChannelRef = {
  ack: (message: unknown) => Promise<void>;
  nack: (message: unknown, p1: boolean, p2: boolean) => Promise<void>;
};
