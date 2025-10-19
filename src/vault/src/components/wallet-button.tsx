"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { WalletName } from "@solana/wallet-adapter-base";
import React from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export default function WalletButton() {
  const { connect, connected, wallet, wallets, publicKey, select, disconnect } =
    useWallet();

  const [showDialog, setShowDialog] = React.useState(false);
  const [loading, setLoading] = React.useState<
    null | "connecting" | "disconnecting"
  >(null);
  const [error, setError] = React.useState<string | null>(null);

  // Reset dialog and errors when connected
  React.useEffect(() => {
    if (connected) {
      setShowDialog(false);
      setLoading(null);
      setError(null);
    }
  }, [connected]);

  const shortKey = React.useMemo(() => {
    if (!publicKey) return "";
    const base58 = publicKey.toBase58();
    return `${base58.slice(0, 4)}…${base58.slice(-4)}`;
  }, [publicKey]);

  async function handleSelectWallet(name: WalletName) {
    try {
      setError(null);
      setLoading("connecting");
      select(name);
      await connect();
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect");
      setLoading(null);
    }
  }

  async function handleDisconnect() {
    try {
      setError(null);
      setLoading("disconnecting");
      await disconnect();
    } catch (e: any) {
      setError(e?.message ?? "Failed to disconnect");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative">
      {connected && publicKey && wallet ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={loading === "disconnecting"}
            onClick={() => setShowDialog(true)}
            className="min-w-[170px] justify-between"
          >
            <span className="flex items-center gap-2">
              {wallet.adapter.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={wallet.adapter.icon}
                  alt="wallet"
                  className="size-4 rounded"
                />
              )}
              <span>{shortKey}</span>
            </span>
            {loading === "disconnecting" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span className="text-xs text-muted-foreground">Connected</span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleDisconnect}
            disabled={loading === "disconnecting"}
            className="text-destructive hover:text-destructive"
            aria-label="Disconnect wallet"
          >
            {loading === "disconnecting" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Disconnecting
              </span>
            ) : (
              "Disconnect"
            )}
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setShowDialog(true)}
          disabled={loading === "connecting"}
          className="min-w-[170px]"
        >
          {loading === "connecting" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Connecting…
            </span>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}

      {showDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => (loading ? null : setShowDialog(false))}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Select a wallet</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowDialog(false)}
                disabled={loading !== null}
                aria-label="Close"
              >
                ✕
              </Button>
            </div>

            {error && (
              <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {wallets && wallets.length > 0 ? (
              <ul className="grid gap-2">
                {wallets.map((w) => (
                  <li key={w.adapter.name}>
                    <button
                      className="w-full rounded-md border bg-card px-3 py-2 text-left transition-colors hover:bg-accent disabled:opacity-70"
                      onClick={() => handleSelectWallet(w.adapter.name)}
                      disabled={loading === "connecting"}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          {w.adapter.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={w.adapter.icon}
                              alt="icon"
                              className="size-5 rounded"
                            />
                          )}
                          <span className="font-medium">{w.adapter.name}</span>
                        </span>
                        {loading === "connecting" &&
                        wallet?.adapter.name === w.adapter.name ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Connect
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
                No wallets found. Install a Solana wallet (e.g., Phantom or
                Solflare) or add wallets to the provider.
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={loading !== null}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
