// API client for the Economy System backend
const API_BASE_URL = 'http://localhost:3000/v1';

export interface Player {
  id?: string;
  playerId?: string;
  firstName: string;
  lastName: string;
  weight: number;
  height: number;
  hairColor: string;
  eyesColor: string;
  hairStyle: string;
  skinColor: string;
  sex: string;
  birthDate: string | number;
  jobId: number;
  cash: number;
  bank: number;
}

export interface BankAccount {
  id: string;
  ownerId: string;
  type: string; // "personal" or "business"
  subType: 'chequing' | 'savings' | 'investing';
  balance: number;
  apr: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  playerId: string;
  accountId?: string;
  type: string;
  amount: number;
  description?: string;
  timestamp: string;
}

export interface Job {
  id: number;
  name: string;
  salary: number;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Player API functions
export async function getAllPlayers(): Promise<Player[]> {
  const response = await apiRequest<{success: boolean, allPlayers: Player[], message: string}>('/players');
  return response.allPlayers;
}

export async function createPlayer(playerData: Player): Promise<Player> {
  const response = await apiRequest<{success: boolean, newPlayer: Player, message: string}>('/players/create', {
    method: 'POST',
    body: JSON.stringify(playerData),
  });
  return response.newPlayer;
}

export async function getPlayer(id: string): Promise<Player> {
  return apiRequest<Player>(`/players/get/${id}`);
}

export async function updatePlayer(id: string, playerData: Partial<Player>): Promise<Player> {
  return apiRequest<Player>(`/players/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(playerData),
  });
}

// Bank API functions
export async function getPlayerAccounts(playerId: string): Promise<BankAccount[]> {
  const response = await apiRequest<{success: boolean, accounts: BankAccount[], message: string}>(`/bank/accounts/${playerId}`);
  return response.accounts;
}

export async function getAccount(accountId: string): Promise<BankAccount> {
  const response = await apiRequest<{success: boolean, account: BankAccount, message: string}>(`/bank/account/${accountId}`);
  return response.account;
}

export async function deposit(playerId: string, accountId: string, amount: number): Promise<any> {
  return apiRequest('/bank/deposit', {
    method: 'POST',
    body: JSON.stringify({ playerId, accountId, amount }),
  });
}

export async function withdraw(playerId: string, accountId: string, amount: number): Promise<any> {
  return apiRequest('/bank/withdraw', {
    method: 'POST',
    body: JSON.stringify({ playerId, accountId, amount }),
  });
}

export async function transfer(fromId: string, toId: string, amount: number, playerId: string): Promise<any> {
  return apiRequest('/bank/transfer', {
    method: 'POST',
    body: JSON.stringify({ fromId, toId, amount, playerId }),
  });
}

// Transaction API functions
export async function getPlayerTransactions(playerId: string, limit?: number): Promise<Transaction[]> {
  const url = limit ? `/transactions/player/${playerId}?limit=${limit}` : `/transactions/player/${playerId}`;
  return apiRequest<Transaction[]>(url);
}

export async function getAccountTransactions(accountId: string, limit?: number): Promise<Transaction[]> {
  const url = limit ? `/transactions/account/${accountId}?limit=${limit}` : `/transactions/account/${accountId}`;
  return apiRequest<Transaction[]>(url);
}

export async function getTransaction(id: string): Promise<Transaction> {
  return apiRequest<Transaction>(`/transactions/${id}`);
}

// Job API functions
export async function getAllJobs(): Promise<Job[]> {
  const response = await apiRequest<{success: boolean, jobs: Job[], message: string}>('/jobs');
  return response.jobs;
}

export async function createJob(name: string, salary: number): Promise<Job> {
  const response = await apiRequest<{success: boolean, job: Job, message: string}>('/jobs/create', {
    method: 'POST',
    body: JSON.stringify({ name, salary }),
  });
  return response.job;
}

export async function assignJob(playerId: string, jobId: number): Promise<any> {
  return apiRequest('/jobs/assign', {
    method: 'POST',
    body: JSON.stringify({ playerId, jobId }),
  });
}

export async function payPlayer(playerId: string): Promise<any> {
  return apiRequest('/jobs/pay', {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  });
}

// Government API functions
export async function getPolicy(): Promise<any> {
  const response = await apiRequest<{success: boolean, policy: any, message: string}>('/government/policy');
  return response.policy;
}

export async function getGovernmentAccount(): Promise<any> {
  const response = await apiRequest<{success: boolean, account: any, message: string}>('/government/account');
  return response.account;
}

export async function updatePolicy(policyData: any): Promise<any> {
  const response = await apiRequest<{success: boolean, policy: any, message: string}>('/government/policy/update', {
    method: 'POST',
    body: JSON.stringify(policyData),
  });
  return response.policy;
}

export async function applySavingsInterest(): Promise<any> {
  return apiRequest('/government/apply-interest', {
    method: 'POST',
  });
}
