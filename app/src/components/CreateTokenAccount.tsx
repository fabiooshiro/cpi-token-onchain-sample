import React, { useCallback } from "react";
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { CpiTokenOnchainSample } from "../anchor/types/cpi_token_onchain_sample";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../anchor/idl/cpi_token_onchain_sample.json";

export function CreateTokenAccount() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { publicKey } = wallet;
    const onClick = useCallback(async () => {
        if (!wallet?.publicKey) throw new WalletNotConnectedError();

        let provider = new anchor.AnchorProvider(connection, wallet as any, {});
        anchor.setProvider(provider);
        const programID = new PublicKey(idl.metadata.address);
        const program = new Program<CpiTokenOnchainSample>(idl as any, programID, provider);

        const mint = new PublicKey("CasshNb6PacBzSwbd5gw8uqoQEjcWxaQ9u9byFApShwT");
        const [escrowWallet, bump] = await PublicKey.findProgramAddress(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                mint.toBuffer(),
            ],
            program.programId
        );
        console.log('Init wallet...', {
            from: wallet.publicKey.toBase58(),
            escrowWallet: escrowWallet.toBase58(),
            bump
        });
        await program.methods
            .initWallet()
            .accounts({
                escrowWallet,
                mint,
                userSending: wallet.publicKey,
            })
            .rpc();
    }, [wallet, connection]);
    return (
        <button onClick={onClick} disabled={!publicKey}>
            Create Escrow Account
        </button>
    )
}
