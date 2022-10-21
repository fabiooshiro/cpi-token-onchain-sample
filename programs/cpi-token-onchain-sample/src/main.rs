use std::io;

use cpi_token_onchain_sample::entry;
use ctsi_sol::adapter::call_solana_program;


fn main() -> io::Result<()> {
    call_solana_program(entry)?;
    Ok(())
}
