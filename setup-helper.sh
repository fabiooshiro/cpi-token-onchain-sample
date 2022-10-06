# install solana cli
sh -c "$(curl -sSfL https://release.solana.com/v1.14.3/install)"
export PATH="/home/gitpod/.local/share/solana/install/active_release/bin:$PATH"

# verifica a instalacao
solana --version

solana-keygen new

# install anchor
sudo apt-get update && sudo apt-get upgrade && sudo apt-get install -y pkg-config build-essential libudev-dev
cargo install --git https://github.com/project-serum/anchor avm --locked --force
avm install 0.24.2

export BROWSER=

yarn install

# verificando se funciona
anchor test
