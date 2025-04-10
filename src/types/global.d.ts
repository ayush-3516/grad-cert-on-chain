declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isTokenPocket?: boolean;
      request: (request: { method: string; params?: Array<unknown> }) => Promise<unknown>;
      on: (event: string, handler: (...args: Array<unknown>) => void) => void;
      removeListener: (event: string, handler: (...args: Array<unknown>) => void) => void;
      removeAllListeners: (event?: string) => void;
    };
    web3?: {
      currentProvider?: unknown;
    };
  }
}
