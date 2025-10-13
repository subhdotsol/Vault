import * as anchor from "@coral-xyz/anchor";
import { BN, Program, web3 } from "@coral-xyz/anchor";
import { VaultProgram } from "../target/types/vault_program";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("vault-program", async () => {
  // get the provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // get the program
  const program = anchor.workspace.VaultProgram as Program<VaultProgram>;

  // gettign neccessary accounts

  // 1. getting the user_vault_pda where funds will be transferred
  const userVaultAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
    program.programId
  )[0];

  // 2. totalInteractionsAccount where the interactions will be stroed
  const totalInteractionsAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), provider.wallet.publicKey.toBuffer()],
    program.programId
  )[0];

  // first test depositing into the vault
  it("Deposit into Vault", async () => {
    const amount = new anchor.BN(1000000000);

    const tx = await program.methods
      .deposit(amount)
      .accounts({
        user_vault_account: userVaultAccount,
        userInteractionsCounter: totalInteractionsAccount,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Initialize transaction signature:", tx);
    console.log(
      `SolScan transaction link: https://solscan.io/tx/${tx}?cluster=devnet`
    );

    // Confirm transaction
    await provider.connection.confirmTransaction(tx);

    // Fetch the created account
    const vaultData = await program.account.userInteractions.fetch(
      totalInteractionsAccount
    );

    console.log("On-chain data is:", vaultData.totalDeposits);

    // user_vault_balance
    const balance = await provider.connection.getBalance(userVaultAccount);
    console.log(
      "User Vault Account Balance:",
      balance / anchor.web3.LAMPORTS_PER_SOL,
      "SOL"
    );

    assert.ok(1);
  });

  // withdrawing test
  it("Withdraw from vault", async () => {
    // Send transaction
    const amount = new anchor.BN(1000000000);
    const withdrawTx = await program.methods
      .withdraw(amount)
      .accounts({
        user_vault_account: userVaultAccount,
        userInteractionsCounter: totalInteractionsAccount,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Confirm transaction
    await provider.connection.confirmTransaction(withdrawTx);

    // Fetch the created account
    const vaultData = await program.account.userInteractions.fetch(
      totalInteractionsAccount
    );

    console.log("On-chain data is:", vaultData.totalDeposits);

    // user_vault_account balance
    const balance = await provider.connection.getBalance(userVaultAccount);
    console.log(
      "User Vault Account Balance:",
      balance / anchor.web3.LAMPORTS_PER_SOL,
      "SOL"
    );

    console.log("Initialize transaction signature:", withdrawTx);
    console.log(
      `SolScan transaction link: https://solscan.io/tx/${withdrawTx}?cluster=devnet`
    );

    assert.ok(1);
  });
});
