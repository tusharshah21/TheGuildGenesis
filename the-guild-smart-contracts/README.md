## TheGuild Smart Contracts

The idea is to be able to create badges and then send them to other users (denominated by their address). 

### Badges
Anybody can create a badge. The idea is to let the community input whatever they want and see what they come up with. Badges should be reused and have a description and a unique name. 

We will create a smart contract TheGuildBadgeRegistry that will have a list of badges with unique non-duplicate names.

### Attestations
Then, we let users create an attestation of a badge to another user. The attestation can contain an optional justification (link to a project, or text explanation).

To do this, we can just use EAS' already deployed contracts. First we will register our schema (using their sdk or their UI): "bytes32 badgeName, bytes32 justification". Then, in the front end, we can use their sdk to create attestation from one user to another, referencing our schema id, the unique badge name, and a justification. We can also use EAS Resolver contract to prevent duplicate badges and reward attestations with Activity Token.

### Integration
For detailed frontend integration instructions, see [INTEGRATION.md](./INTEGRATION.md).

## Foundry Usage

https://book.getfoundry.sh/

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Deterministic Deployments (CREATE2)

Follow the Foundry guide on deterministic deployments using CREATE2: https://getfoundry.sh/guides/deterministic-deployments-using-create2

We configured `foundry.toml` to pin `solc`, set `evm_version`, and disable metadata hashing for stable bytecode, and enabled `always_use_create_2_factory`.

Use the deploy script with a salt (env var `CREATE2_SALT`) to deploy at a deterministic address:

```shell
# Example on Sepolia (replace RPC and PK)
export CREATE2_SALT=1
forge script script/TheGuildBadgeRegistry.s.sol:TheGuildBadgeRegistryScript \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast

# Use a specific salt value (hex string -> uint)
export CREATE2_SALT=123456
forge script script/TheGuildBadgeRegistry.s.sol:TheGuildBadgeRegistryScript --rpc-url <RPC> --private-key <PK> --broadcast
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
