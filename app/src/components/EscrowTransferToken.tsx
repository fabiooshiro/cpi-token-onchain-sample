import React, { useCallback, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { CpiTokenOnchainSample } from "../anchor/types/cpi_token_onchain_sample";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../anchor/idl/cpi_token_onchain_sample.json";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export function EscrowTransferToken() {
    const [destinationAccountOwnerBase58, setDestinationAccountOwnerBase58] = useState('');
    const { connection } = useConnection();
    const wallet = useWallet();
    const { publicKey } = wallet;
    const onClick = useCallback(async () => {
        if (!wallet?.publicKey) throw new WalletNotConnectedError();

        try {
            let provider = new anchor.AnchorProvider(connection, wallet as any, {});
            anchor.setProvider(provider);
            const programID = new PublicKey(idl.metadata.address);
            const program = new Program<CpiTokenOnchainSample>(idl as any, programID, provider);

            // insert your token
            const mint = new PublicKey("CasshNb6PacBzSwbd5gw8uqoQEjcWxaQ9u9byFApShwT");

            const [escrowWallet] = await PublicKey.findProgramAddress(
                [
                    Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                    mint.toBuffer(),
                ],
                program.programId
            );

            const toOwner = new PublicKey(destinationAccountOwnerBase58);

            const toAccount = await getAssociatedTokenAddress(mint, toOwner)
            console.log('Sending to owner', destinationAccountOwnerBase58);
            console.log('Sending to account', toAccount.toBase58());
            await program.methods
                .walletTransfer(new anchor.BN(500_000_000))
                .accounts({
                    escrowWallet,
                    to: toAccount,
                    // taker: wallet.publicKey, // transaction payer
                    authority: escrowWallet,
                    mint,
                })
                .rpc();
        } catch (e) {
            console.error(`Unexpected error:`, e);
            if (e instanceof Error) {
                alert(e.message);
            }
        }
    }, [wallet, connection, destinationAccountOwnerBase58]);

    return (
        <div>
            Destination: <input onChange={e => {
                setDestinationAccountOwnerBase58(e.target.value);
            }} />
            <button onClick={onClick} disabled={!publicKey}>
                Escrow Transfer Token
            </button>
        </div>
    )
}
