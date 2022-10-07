import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CpiTokenOnchainSample } from "../target/types/cpi_token_onchain_sample";
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo
} from "@solana/spl-token";

describe("cpi-token-onchain-sample", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CpiTokenOnchainSample as Program<CpiTokenOnchainSample>;

  it("Is initialized!", async () => {
    // Add your test here.
    const connection = anchor.getProvider().connection;
    const fromWallet = anchor.web3.Keypair.generate();
    const toWallet = anchor.web3.Keypair.generate();
    const signature = await connection.requestAirdrop(fromWallet.publicKey, 1000000000);
    await connection.confirmTransaction(signature, 'confirmed');
    console.log({ from: fromWallet.publicKey.toBase58() })
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, fromWallet.publicKey, 9);

    const fromAccount = await createAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey)
    await mintTo(connection, fromWallet, mint, fromAccount, fromWallet, 5000000000);
    const toAccount = await createAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey)
    console.log('Call contract...')
    const tx = await program.methods.initialize(new anchor.BN(2000000000), 1)
      .accounts({
        mint,
        from: fromAccount,
        to: toAccount,
        programSigner: fromWallet.publicKey,
        authority: fromWallet.publicKey,
      })
      .signers([fromWallet, fromWallet])
      .rpc();
    console.log("Your transaction signature", tx);
    const balance = await connection.getParsedTokenAccountsByOwner(
      fromWallet.publicKey, { mint }
    );
    console.log(balance.value[0]?.account.data.parsed.info.tokenAmount)
  });
});
