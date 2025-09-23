source .env
forge script --chain base-sepolia script/FullDeploymentScript.s.sol:FullDeploymentScript --rpc-url $BASE_SEPOLIA_URL --broadcast --verify -vvvv --interactives 1
