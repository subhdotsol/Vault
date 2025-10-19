import { AnchorProvider, Provider } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import React from "react";

export function useSolanaProvider(): Provider | undefined {
  const [provider, setProvider] = React.useState<Provider>();

  const { connection } = useConnection();
  const { connected } = useWallet();
  const wallet = useAnchorWallet();

  React.useEffect(() => {
    if (connection && wallet && connected === true) {
      setProvider(
        new AnchorProvider(connection, wallet, {
          commitment: "confirmed",
        })
      );
    }
  }, [connected]);

  return provider;
}
