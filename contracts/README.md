## SEAL contracts

Solidity sources live in `src/`. You can build and test with **Foundry** or deploy with **Hardhat**.

### Hardhat (recommended for deploy)

From `contracts/`:

```bash
npm install
npx hardhat compile
```

**Ethereum Sepolia** — add `contracts/.env`:

```env
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

Deploy:

```bash
npm run deploy:sepolia
```

Or on PowerShell: `. .\deploy-sepolia.ps1`

Copy the printed **proxy** address into `frontend/.env` as `NEXT_PUBLIC_SEAL_CONTRACT_ADDRESS` and `backend/.env` as `CONTRACT_ADDRESS` (same value). Set backend `RPC_URL` to your Sepolia HTTPS endpoint.

**Local node** (e.g. `npx hardhat node` or Anvil on `8545`):

```bash
npx hardhat run scripts/deploy-sepolia.js --network localhost
```

### Foundry

```shell
forge build
forge test
```

Deploy (requires Foundry installed):

```shell
forge script script/Deploy.s.sol:DeploySEAL --rpc-url <your_rpc_url> --private-key <your_private_key>
```

See [Foundry book](https://book.getfoundry.sh/).
