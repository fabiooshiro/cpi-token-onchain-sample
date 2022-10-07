use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Mint, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod cpi_token_onchain_sample {

    use super::*;

    pub fn initialize(ctx: Context<TransferInstruction>, amount: u64, nonce: u8) -> Result<()> {
        let seeds = &[
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[nonce],
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.program_signer.clone(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        msg!("Calling transfer...");
        token::transfer(cpi_ctx, amount).expect("transfer2 failed"); //?;
        msg!("Transfer success.");
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

    /// CHECK: xxx
    // We already know its address and that it's executable
    #[account(executable, "token_program.key == &token::ID")]
    pub token_program: AccountInfo<'info>,

    /// CHECK: xxx
    pub system_program: AccountInfo<'info>,
}
