# API

### Responsible for 

* Authentication onto kchannels - DONE
* Providing redeemable quotes for asset exchanges without leaving the kchannel ecosystem - DONE
* Root account who is responsible for signing and executing transaction within a kchannel - DONE
* Defines a set of known asset pairs which can be used to make an exchange - DONE
* Executing asset swap trades within a kchannel

# Balance manager (TODO)

### Responsible for 

* Maintaining a healthy channel balance of available assets to swap
* Entering and exiting channel balances in order to make market (on-chain) trades from asset X to asset Y
* Managing high/low thresholds for balance management
* Root account who is responsible for signing and executing transaction both on-chain and within a kchannel

# Env Variables needed to run the API

* create a `.env` file in the root of the `api` project
```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_HOST=

## Account which is responsible for swapping assets
ASSET_SWAP_MASTER_ACCOUNT_PRIVATE_KEY=

# Infura - note: this is only required for non xdai chain
INFURA_KEY=

# Default asset swap chain
DEFAULT_CHAIN_ID=
```
