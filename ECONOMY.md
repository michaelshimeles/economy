# GTA V RP Economy System

This document describes the design of a **full-fledged GTA V RP economy** powered by:

- **Elysia (Bun)** → API layer
- **Postgres** → Ledger & persistence
- **Treasury Wallet (Blockchain)** → On/off ramp for crypto deposits/withdrawals

The goal is to create a **realistic, scalable, and secure economy** that feels immersive in-game while being backed by real-world value.

---

## 🏦 Core Principles

1. **Ledger First**  
   - All in-game balances and transactions are tracked in **Postgres**.  
   - Postgres is the **source of truth** for gameplay.

2. **Crypto-Backed**  
   - Players can deposit crypto (e.g., USDC, ETH, or RPToken) into a **treasury wallet**.  
   - Deposits credit their in-game bank balance.  
   - Withdrawals debit their in-game balance and send tokens on-chain.

3. **Separation of Concerns**  
   - **Elysia** handles API + business logic.  
   - **Postgres** handles persistence + audit logs.  
   - **Blockchain** is only used for deposits/withdrawals, not every in-game action.

---

## 📊 Economy Components

### 1. Player Finances
- **Cash** (on-hand, risk of robbery/loss)
- **Bank balance** (safe, used for large transactions)
- **Debt/Credit** (loans, mortgages, credit score)
- **Transaction history** (ledger of all actions)

### 2. Jobs & Income
- **Whitelisted jobs**: Police, EMS, Mechanic, Government
- **Civilian jobs**: Taxi, Delivery, Garbage, Trucking, Fishing, Mining
- **Freelance jobs**: Hacking, Smuggling, Bounty Hunting
- **Paychecks**: Salaries paid every X minutes

### 3. Businesses
- **Player-owned businesses**: Shops, Gas stations, Restaurants, Dealerships
- **Stock/inventory system**: Must buy supplies to sell goods
- **Employees**: Hiring, wages, profit sharing
- **Business accounts**: Separate from player accounts
- **Taxes & licenses**

### 4. Assets
- **Vehicles**: Purchase, insurance, fuel, repairs, impound
- **Properties**: Houses, apartments, warehouses, property taxes
- **Upgrades**: Furniture, security systems

### 5. Items & Inventory
- **Consumables**: Food, drinks, medical supplies
- **Weapons**: Legal (licensed) and illegal (black market)
- **Crafting**: Recipes, resource gathering, processing

### 6. Government & Regulation
- **Taxes**: Income, sales, property, business
- **Fines**: Speeding, crimes, parking
- **Public services**: Police/EMS salaries, welfare, subsidies
- **Court system** (optional, for RP depth)

### 7. Black Market
- **Illegal jobs**: Drug production, weapon trafficking, robberies
- **Dirty money**: Must be laundered
- **Turf/gang control**: Passive income from territories

### 8. Meta-Economy
- **Money sinks**: Taxes, fines, consumables, repairs
- **Inflation control**: Balance payouts vs. costs
- **Dynamic pricing** (optional): Supply/demand affects prices

---

## 🗄️ Database Schema (Ledger)

### Tables

#### `players`
- `id` (PK)
- `name`
- `wallet` (on-chain address, optional)
- `cash` (int)
- `bank` (int)
- `job_id` (FK → jobs)

#### `jobs`
- `id` (PK)
- `name`
- `salary`

#### `transactions`
- `id` (PK)
- `player_id` (FK → players)
- `amount`
- `type` (deposit, withdraw, payment, fine, salary, etc.)
- `metadata` (JSON for details)
- `created_at`

#### `businesses`
- `id` (PK)
- `owner_id` (FK → players)
- `name`
- `balance`
- `type` (shop, gas, nightclub, etc.)

#### `deposits`
- `id` (PK)
- `player_id` (FK → players)
- `tx_hash` (on-chain transaction hash)
- `amount`
- `status` (pending, confirmed, failed)
- `created_at`

#### `withdrawals`
- `id` (PK)
- `player_id` (FK → players)
- `to_wallet`
- `amount`
- `tx_hash`
- `status` (pending, confirmed, failed)
- `created_at`

---

## 🔗 Blockchain Integration

### Treasury Wallet
- Controlled by server owner.
- Receives deposits from players.
- Sends withdrawals to players.

### Deposit Flow
1. Player sends tokens to treasury wallet.
2. Backend listens for `Transfer` events.
3. On confirmation, backend credits player’s bank balance in Postgres.
4. Record stored in `deposits` table.

### Withdrawal Flow
1. Player requests withdrawal in-game.
2. Backend checks Postgres balance.
3. Deducts balance in Postgres.
4. Sends tokens from treasury wallet to player’s wallet.
5. Record stored in `withdrawals` table.

---

## 🔐 Security

- **API Authentication**: Only FiveM server can call Elysia API (API key or IP whitelist).
- **Ledger Integrity**: All transactions logged in Postgres.
- **Withdrawal Limits**: Prevent draining treasury wallet.
- **Hot/Cold Wallets**: Use hot wallet for daily ops, cold wallet for reserves.
- **Anti-Cheat**: Validate all economy actions server-side.

---

## 🚀 Build Roadmap

### Phase 1: Core Ledger
- [ ] Player accounts (cash, bank)
- [ ] Transactions table
- [ ] Jobs & salaries
- [ ] Basic API (deposit, withdraw, transfer, paycheck)

### Phase 2: Businesses & Assets
- [ ] Player-owned businesses
- [ ] Vehicle ownership
- [ ] Property ownership
- [ ] Inventory system

### Phase 3: Government & Regulation
- [ ] Taxes & fines
- [ ] Licenses
- [ ] Public service salaries

### Phase 4: Black Market
- [ ] Illegal jobs
- [ ] Dirty money & laundering
- [ ] Turf/gang system

### Phase 5: Blockchain Integration
- [ ] Treasury wallet setup
- [ ] Deposit listener (on-chain → Postgres credit)
- [ ] Withdrawal endpoint (Postgres debit → on-chain transfer)
- [ ] Admin dashboard for monitoring

---

## ✅ Summary

- **Postgres = Ledger** (fast, auditable, flexible)
- **Elysia = API** (connects FiveM to ledger + blockchain)
- **Treasury Wallet = Bridge** (crypto in/out of the game)
- **FiveM = Gameplay** (commands, HUD, RP logic)

This design ensures:
- Smooth in-game economy
- Real-world value backing
- Security and auditability
- Expandability (jobs, businesses, crime, etc.)