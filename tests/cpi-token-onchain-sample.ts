import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CpiTokenOnchainSample } from "../target/types/cpi_token_onchain_sample";
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo
} from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction, Connection, Commitment } from '@solana/web3.js';
import { expect } from "chai";


describe("cpi-token-onchain-sample", () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CpiTokenOnchainSample as Program<CpiTokenOnchainSample>;
  const connection = anchor.getProvider().connection;

  it("should initialize the pda token account", async () => {
    const fromWallet = anchor.web3.Keypair.generate();
    const toWallet = anchor.web3.Keypair.generate();
    const signature = await connection.requestAirdrop(fromWallet.publicKey, 1_000_000_000);
    await connection.confirmTransaction(signature, 'confirmed');
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, fromWallet.publicKey, 9);

    const [escrowWallet, bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
        mint.toBuffer(),
      ],
      program.programId
    );
    const userReceiving = toWallet.publicKey;
    console.log('Init wallet...', {
      from: fromWallet.publicKey.toBase58(),
      escrowWallet: escrowWallet.toBase58(),
      bump
    });
    await program.methods
      .initWallet()
      .accounts({
        escrowWallet,
        mint,
        userSending: fromWallet.publicKey,
      })
      .signers([fromWallet])
      .rpc();
    console.log('minting to...');
    await mintTo(connection, fromWallet, mint, escrowWallet, fromWallet, 5_000_000_000);
    const accountInfo = await connection.getParsedAccountInfo(escrowWallet);
    console.log(JSON.stringify(accountInfo.value.data, null, 4));
    const toAccount = await createAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey)
    
    console.log('wallet transfer', toAccount.toBase58());
    await program.methods
      .walletTransfer(new anchor.BN(1_500_000_000))
      .accounts({
        escrowWallet,
        to: toAccount,
        taker: userReceiving,
        authority: escrowWallet,
        mint,
        // tokenProgram: escrowWallet,
      })
      .signers([toWallet])
      .rpc();

    const accountInfo2 = await connection.getParsedAccountInfo(escrowWallet);
    console.log(JSON.stringify(accountInfo2.value.data, null, 4));
    expect(+(accountInfo2.value.data as any).parsed.info.tokenAmount.amount).to.eq(3_500_000_000);
  })

  it("should do p2p transfer", async () => {
    const fromWallet = anchor.web3.Keypair.generate();
    const toWallet = anchor.web3.Keypair.generate();
    const signature = await connection.requestAirdrop(fromWallet.publicKey, 1_000_000_000);
    await connection.confirmTransaction(signature, 'confirmed');
    console.log({ from: fromWallet.publicKey.toBase58() });
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, fromWallet.publicKey, 9);

    const fromAccount = await createAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey)
    await mintTo(connection, fromWallet, mint, fromAccount, fromWallet, 5_000_000_000);
    const toAccount = await createAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey)

    // wait for the next block
    // await delay(1);
    console.log('Call "simple" transfer...');
    const tx = await program.methods.transfer(new anchor.BN(2_000_000_000))
      .accounts({
        mint,
        from: fromAccount,
        to: toAccount,
        programSigner: fromWallet.publicKey,
        authority: fromWallet.publicKey,
      })
      .signers([fromWallet])
      .rpc();
    console.log("Your transaction signature", tx);
    const balance = await connection.getParsedTokenAccountsByOwner(
      fromWallet.publicKey, { mint }
    );
    console.log(balance.value[0]?.account.data.parsed.info.tokenAmount)
    expect(+balance.value[0]?.account.data.parsed.info.tokenAmount.amount).to.eq(3_000_000_000);
  });
});
