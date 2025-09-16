source .env
forge script --chain amoy script/TheGuildBadgeRegistry.s.sol:TheGuildBadgeRegistryScript --rpc-url $AMOY_RPC_URL --broadcast --verify -vvvv --interactives 1

