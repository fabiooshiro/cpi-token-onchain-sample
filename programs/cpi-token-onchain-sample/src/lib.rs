use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Mint, SetAuthority, TokenAccount};
use spl_token::instruction::AuthorityType;

declare_id!("7wFRuxMhXSj4AH4UGKSpaBWuYjxXkFLiakbKmE35W643");

#[program]
pub mod cpi_token_onchain_sample {

    use super::*;

    const WALLET_PDA_SEED: &[u8] = b"wallet";

    pub fn init_wallet(ctx: Context<InitWallet>) -> Result<()> {

        // take the ownership of this TokenAccount
        let cpi_accounts = SetAuthority {
            account_or_mint: ctx.accounts.escrow_wallet.to_account_info(),
            current_authority: ctx.accounts.user_sending.to_account_info(),
        };
        let cpi_context = CpiContext::new(ctx.accounts.token_program.clone(), cpi_accounts);
        let (vault_authority, _bump) =
            Pubkey::find_program_address(&[
                WALLET_PDA_SEED,
                ctx.accounts.mint.to_account_info().key.as_ref()
            ], ctx.program_id);
        token::set_authority(
            cpi_context,
            AuthorityType::AccountOwner,
            Some(vault_authority),
        )?;
        Ok(())
    }

    pub fn wallet_transfer(ctx: Context<WalletTransfer>, amount: u64) -> Result<()> {
        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[
                WALLET_PDA_SEED,
                ctx.accounts.mint.to_account_info().key.as_ref()
            ], ctx.program_id);
        let authority_seeds = &[
            &WALLET_PDA_SEED[..],
            ctx.accounts.mint.to_account_info().key.as_ref(), 
            &[vault_authority_bump]
        ];
        let signer = &[&authority_seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_wallet.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn transfer(ctx: Context<TransferInstruction>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.program_signer.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferInstruction<'info> {
    /// CHECK: xxx
    pub program_signer: AccountInfo<'info>,

    /// CHECK: xxx
    #[account(signer)] //authority should sign this txn
    pub authority: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    /// CHECK: xxx
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,

    /// CHECK: xxx
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,

    /// CHECK: We already know its address and that it's executable
    #[account(executable, constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,

    /// CHECK: xxx
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct InitWallet<'info> {

    #[account(
        init,
        payer = user_sending,
        seeds=[
            b"wallet".as_ref(),
            mint.key().as_ref()
        ],
        bump,
        token::mint=mint,
        token::authority=user_sending,
    )]
    escrow_wallet: Account<'info, TokenAccount>,

    // Users and accounts in the system
    #[account(mut)]
    user_sending: Signer<'info>, // Alice
    mint: Account<'info, Mint>,  // USDC

    /// CHECK: We already know its address and that it's executable
    #[account(executable, constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,

    /// CHECK: xxx
    pub system_program: AccountInfo<'info>,

    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WalletTransfer<'info> {
    #[account(mut, signer)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub transaction_payer: AccountInfo<'info>,

    #[account(mut)]
    escrow_wallet: Account<'info, TokenAccount>,
    mint: Account<'info, Mint>,  // USDC

    /// CHECK: xxx
    pub authority: AccountInfo<'info>,

    /// CHECK: xxx
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,

    /// CHECK: We already know its address and that it's executable
    #[account(executable, constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,

    /// CHECK: xxx
    pub system_program: AccountInfo<'info>,
}