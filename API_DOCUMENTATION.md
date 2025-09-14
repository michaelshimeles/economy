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

## 🏦 Banking System (Service Layer Only)

*Note: The banking functionality exists in the service layer but doesn't have exposed HTTP endpoints yet.*

### Available Banking Services:
- **Account Creation:** Create chequing, savings, and investing accounts for players
- **Deposits:** Transfer cash from player to bank account
- **Withdrawals:** Transfer money from bank account to player cash
- **Transfers:** Move money between bank accounts
- **Account Management:** Get accounts by owner, get account by ID
- **Transaction Logging:** All banking operations are logged

### Account Types:
- **Chequing:** 0% APR, always active
- **Savings:** Variable APR based on government policy
- **Investing:** Controlled by government policy, can be enabled/disabled

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

4. **Banking Infrastructure**
   - Multi-account system per player
   - Transaction logging
   - Deposit/withdrawal operations
   - Account type management (chequing, savings, investing)

5. **Economic Controls**
   - Automated savings interest application
   - Government treasury management
   - Policy-driven account creation

### 🔄 Service Layer (Backend Logic Ready):
- **Banking Operations:** Full deposit, withdrawal, transfer system
- **Account Management:** Create and manage multiple account types
- **Transaction History:** Complete audit trail
- **Interest Calculations:** Automated monthly interest application

### 🚧 Potential Next Steps:
1. **Expose Banking Endpoints:** Create HTTP endpoints for banking operations
2. **Black Market System:** Currently has empty service file
3. **Business Accounts:** Extend banking for business entities
4. **Investment System:** Implement the investing account functionality
5. **Tax Collection:** Implement automatic tax deduction on transactions
6. **Enhanced Security:** Add player-specific authentication
7. **Transaction History API:** Endpoints to view transaction history

---

## 🛠️ Technical Stack

- **Framework:** Elysia.js (Bun runtime)
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** JWT with role-based access
- **API Documentation:** OpenAPI/Swagger integration
- **Migration System:** Drizzle migrations

---

## 📝 Recent Fixes

- **Routing Issue Resolved:** Fixed missing module imports in main application
- **Module Registration:** All available modules now properly registered
- **Endpoint Accessibility:** `/v1/government/policy` and other endpoints now accessible

The system is now fully functional with all implemented endpoints accessible via the API.
