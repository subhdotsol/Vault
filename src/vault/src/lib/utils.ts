import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { PublicKey } from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import idlFile from "./../utils/vault_program.json";
import { VaultProgram } from "@/utils/vault_program";
import { Idl } from "@coral-xyz/anchor";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// get the vault token account
// get the vault interaction token

export const userVaultAccount = (publicKey: PublicKey) => {
  const [userVaultAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), publicKey.toBuffer()],
    programId
  );

  return userVaultAccount;
};

export const totalInteractionsAccount = (publicKey: PublicKey) => {
  const [totalInteractions] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), publicKey.toBuffer()],
    programId
  );

  return totalInteractions;
};

const idl = idlFile as Idl;

export const programId = new PublicKey(idl.address);
