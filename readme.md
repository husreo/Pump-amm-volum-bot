# 🔄 Pump.fun AMM volume Bot

A high-performance trading bot that interacts with the Pump.fun AMM swap platform. This bot is designed to automate the distribution of SOL to multiple wallets and execute endless buy and sell swap transactions on the Pump.fun AMM swap platform and withdraw remain fees and close token accounts simultaneously 

Contact: https://t.me/stevensprg

Tx: https://solscan.io/tx/3hkVuoQDocuxr2PMLupZafCtQjWHekzCUvDb8HXJTF3d3gYw3NG8m6WYNuBFMP7ovsUvKAkXjjTxcTCenZKT3a8U?cluster=devnet

## 📌 Features

- ✅ Create multiple wallets and airdrop SOL automatically 
- ✅ Buy random amount of tokens on certain pump swap pool
- ✅ Steadly search old wallets & sell tokens & withdraw SOL & close ATA
- ✅ Auto-logs transactions, volume metrics, and token stats
- ✅ Well Confirmed PumpSwap SDK for sell & buy & getting pool info & calculate buy, sell amount and so on.
- ✅ Configurable Parameters: Allows customization of buy amounts, intervals, distribution settings, and more..


## 💻 Video

https://github.com/user-attachments/assets/562d597f-0961-47e0-802e-ae74341f1fea

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/m4rcu5o/Burn-ATA-Solana.git
cd Burn-ATA-Solana
```
### 2. Clone the Repo
Fill out .env 
```env
MAIN_KEYPAIR_HEX=
TREASURY_WALLET=
MAIN_RPC_URL=
MAIN_WSS_URL=
DEV_RPC_URL=
DEV_WSS_URL=
``` 
### 3. Figure out initial settings

- Example
```typescript
{
    isPumpToken: "y",
    basemint: new web3.PublicKey("Frno4J9Yqdf8uwQKziNyybSQz4bD73mTsmiHQWxhJwGM"),
    minAndMaxBuy: "0.00001 0.00001",
    minAndMaxSell: "0.00001 0.00001",
    delay: "2 3",
    jitoTipAmt: "0.01",
    cycles: 3,
    marketID: "Frno4J9Yqdf8uwQKziNyybSQz4bD73mTsmiHQWxhJwGM"
}
```
### 4. Run with command

Install node modules and run bot with command
```bash
yarn
yarn dev
```

```package.json
"start": "node dist/index.js",
"dev": "ts-node-dev src/index.ts",
"build": "tsc",
```

