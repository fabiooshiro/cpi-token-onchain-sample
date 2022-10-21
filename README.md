# Cross-Program Invocation

Just a project to show how to call the spl-token program on-chain to transfer tokens.

Made with love and Anchor.

```shell
tail -F ./.anchor/program-logs/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS.cpi_token_onchain_sample.log
```

```shell
anchor test
```

## Cartesi Adapter

```shell
export SOLANA_DATA_PATH=./data
cat ./tests/fixtures/create_token_account_in.txt | ./target/debug/cpi-token-onchain-sample
```
