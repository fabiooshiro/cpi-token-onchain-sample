FROM gitpod/workspace-full

RUN sudo apt-get --yes update && sudo apt-get --yes upgrade && sudo apt-get install --yes --force-yes pkg-config build-essential libudev-dev
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.14.3/install)"
ENV PATH="/home/gitpod/.local/share/solana/install/active_release/bin:$PATH"

# Anchor
RUN cargo install --git https://github.com/project-serum/anchor avm --locked --force
RUN avm install 0.24.2

# anchor test problem
ENV BROWSER=
