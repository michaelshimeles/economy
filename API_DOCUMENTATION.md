# GTA RP Economy System - API Documentation

## Overview

This is a comprehensive economy system for a GTA RP server built with **Elysia.js**, **Drizzle ORM**, and **PostgreSQL**. The system includes player management, job system, banking, government policies, and economic transactions.

**Base URL:** `http://localhost:3000/v1`

---

## 🏠 Root Endpoint

### GET `/`
- **Description:** Welcome message
- **Response:** `"GTA RP Economy"`
- **Authentication:** None

---

## 👤 Player Management

### GET `/players`
- **Description:** Get all players
- **Authentication:** None
- **Response:** List of all players with their details

### POST `/players/create`
- **Description:** Create a new player
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string", 
    "weight": "number",
    "height": "number",
    "hairColor": "string",
    "eyesColor": "string",
    "hairStyle": "string",
    "skinColor": "string",
    "sex": "string",
    "birthDate": "timestamp",
    "jobId": "number"
  }
  ```
- **Response:** Created player object

### GET `/players/get/:id`
- **Description:** Get specific player by ID
- **Authentication:** None
- **Parameters:** `id` (string) - Player ID
- **Response:** Player object

### POST `/players/update/:id`
- **Description:** Update player information
- **Authentication:** None
- **Parameters:** `id` (string) - Player ID
- **Request Body:** Partial player object with fields to update
- **Response:** Updated player object

---

## 💼 Job System

### POST `/jobs/create`
- **Description:** Create a new job
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "name": "string",
    "salary": "number"
  }
  ```
- **Response:** Created job object

### POST `/jobs/assign`
- **Description:** Assign a job to a player
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "playerId": "string",
    "jobId": "number"
  }
  ```
- **Response:** Assignment confirmation

### POST `/jobs/pay`
- **Description:** Pay salary to a player
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "playerId": "string"
  }
  ```
- **Response:** Payment confirmation

---

## 🏛️ Government & Economic Policy

### GET `/government/policy`
- **Description:** Get current government economic policy
- **Authentication:** None
- **Response:** Current policy object with economic settings

### POST `/government/policy/update`
- **Description:** Update government economic policy (creates new version)
- **Authentication:** 🔒 **Admin JWT Required**
- **Request Body:** Partial policy object:
  ```json
  {
    "savingsAPR": "number (optional)",
    "incomeTaxRate": "number (optional)",
    "salesTaxRate": "number (optional)", 
    "businessTaxRate": "number (optional)",
    "investingLockupMonths": "number (optional)",
    "isInvestingEnabled": "boolean (optional)"
  }
  ```
- **Response:** Updated policy object

### POST `/government/apply-interest`
- **Description:** Apply savings interest to all active savings accounts
- **Authentication:** 🔒 **Admin JWT Required**
- **Response:** Interest application results

---

## 🏦 Banking System

### GET `/bank/accounts/:playerId`
- **Description:** Get all bank accounts for a specific player
- **Authentication:** None
- **Parameters:** `playerId` (string) - Player ID
- **Response:** List of all accounts (chequing, savings, investing) for the player

### GET `/bank/account/:accountId`
- **Description:** Get specific bank account details by account ID
- **Authentication:** None
- **Parameters:** `accountId` (string) - Account ID
- **Response:** Account details including balance, type, APR

### POST `/bank/deposit`
- **Description:** Deposit cash into a bank account
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "playerId": "string",
    "accountId": "string", 
    "amount": "number"
  }
  ```
- **Response:** Transaction confirmation with updated balances

### POST `/bank/withdraw`
- **Description:** Withdraw money from bank account to cash
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "playerId": "string",
    "accountId": "string",
    "amount": "number"
  }
  ```
- **Response:** Transaction confirmation with updated balances

### POST `/bank/transfer`
- **Description:** Transfer money between bank accounts
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "fromId": "string",
    "toId": "string",
    "amount": "number",
    "playerId": "string"
  }
  ```
- **Response:** Transfer confirmation with updated account balances

### Account Types:
- **Chequing:** 0% APR, always active, primary account for daily transactions
- **Savings:** Variable APR based on government policy, earns interest
- **Investing:** Controlled by government policy, can be enabled/disabled, potential lockup periods

---

## 📊 Transaction History

### GET `/transactions/player/:playerId`
- **Description:** Get transaction history for a specific player
- **Authentication:** None
- **Parameters:** 
  - `playerId` (string) - Player ID
- **Query Parameters:**
  - `limit` (optional, number) - Maximum number of transactions to return (default: 50)
- **Response:** List of transactions ordered by most recent first

### GET `/transactions/account/:accountId`
- **Description:** Get transaction history for a specific bank account
- **Authentication:** None
- **Parameters:**
  - `accountId` (string) - Account ID
- **Query Parameters:**
  - `limit` (optional, number) - Maximum number of transactions to return (default: 50)
- **Response:** List of account transactions ordered by most recent first

### GET `/transactions/:id`
- **Description:** Get specific transaction details by transaction ID
- **Authentication:** None
- **Parameters:** `id` (string) - Transaction ID
- **Response:** Single transaction object with full details

---

## 🗃️ Database Schema

### Players Table
- Personal information (name, physical attributes)
- Financial data (cash, bank balance)
- Job assignment
- Unique player ID system

### Jobs Table
- Job definitions with salaries
- Referenced by players

### Bank Accounts Table
- Multiple account types per player
- Balance tracking
- APR settings
- Active/inactive status

### Transactions Table
- Complete transaction history
- Links to players and accounts
- Transaction types and metadata

### Government Tables
- Government entity management
- Economic policy versioning
- Policy history tracking

---

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control:

- **Public Endpoints:** Player management, job operations, policy viewing
- **Admin Protected:** Policy updates, interest application

Authentication is handled by the `jwtAuth` middleware with role verification.

---

## 🚀 What's Been Implemented

### ✅ Completed Features:
1. **Player Management System**
   - CRUD operations for players
   - Character creation with detailed attributes
   - Default starting money (500 cash, 1000 bank)

2. **Job System**
   - Job creation and management
   - Player job assignment
   - Salary payment system

3. **Government Policy System**
   - Economic policy management
   - Versioned policy updates (historical tracking)
   - Interest rate controls
   - Tax rate management
   - Automated savings interest application

4. **Complete Banking System**
   - Multi-account system per player (chequing, savings, investing)
   - **NEW:** Full HTTP API for banking operations
   - Deposit operations (cash → bank account)
   - Withdrawal operations (bank account → cash)
   - Transfer operations (bank account → bank account)
   - Account management and querying
   - Transaction logging with complete audit trail

5. **Transaction History System**
   - **NEW:** Complete transaction history API
   - Player transaction history with pagination
   - Account-specific transaction history
   - Individual transaction lookup
   - Chronological ordering (most recent first)

6. **Economic Controls**
   - Government treasury management
   - Policy-driven account creation and management
   - Interest rate controls affecting savings accounts

### 🎯 Major Recent Additions:
- **Banking HTTP Endpoints:** All banking operations now accessible via REST API
- **Transaction History API:** Complete transaction audit and history system
- **Enhanced Module Structure:** Proper separation of banking and transaction concerns

### 🚧 Potential Next Steps:
1. **Account Creation API:** HTTP endpoint for creating new bank accounts
2. **Black Market System:** Currently has empty service file
3. **Business Accounts:** Extend banking for business entities  
4. **Investment System:** Implement the investing account functionality
5. **Tax Collection:** Implement automatic tax deduction on transactions
6. **Enhanced Security:** Add player-specific authentication for banking operations
7. **Advanced Transaction Features:** Transaction categories, descriptions, recurring transactions

---

## 🛠️ Technical Stack

- **Framework:** Elysia.js (Bun runtime)
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** JWT with role-based access
- **API Documentation:** OpenAPI/Swagger integration
- **Migration System:** Drizzle migrations

---

## 📝 Recent Fixes & Updates

### Major System Expansion:
- **Banking HTTP API:** Complete banking system now exposed via REST endpoints
- **Transaction History API:** Full transaction audit and history system implemented
- **Module Structure:** Enhanced separation of concerns with dedicated banking and transaction modules

### Previous Fixes:
- **Routing Issue Resolved:** Fixed missing module imports in main application  
- **Module Registration:** All available modules now properly registered
- **Endpoint Accessibility:** All endpoints now accessible and functional

## 📊 API Summary

**Total HTTP Endpoints: 19**
- **Root:** 1 endpoint
- **Players:** 4 endpoints (CRUD operations)
- **Jobs:** 3 endpoints (create, assign, pay)
- **Government:** 3 endpoints (policy management)
- **Banking:** 5 endpoints (accounts, deposit, withdraw, transfer)
- **Transactions:** 3 endpoints (history and audit)

The system is now a comprehensive economy platform with full banking capabilities, transaction history, and government economic controls.
