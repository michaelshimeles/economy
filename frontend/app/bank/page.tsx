"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { 
  getAllPlayers, 
  getPlayerAccounts, 
  deposit, 
  withdraw, 
  transfer,
  type Player, 
  type BankAccount 
} from "@/lib/api";

export default function MazeBankPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Transaction states
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [transferToPlayer, setTransferToPlayer] = useState<string>('');
  const [transferToAccount, setTransferToAccount] = useState<string>('');
  const [transferToAccounts, setTransferToAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerAccounts(selectedPlayer.playerId || selectedPlayer.id || '');
    }
  }, [selectedPlayer]);

  useEffect(() => {
    if (transferToPlayer) {
      loadTransferToAccounts(transferToPlayer);
    }
  }, [transferToPlayer]);

  async function loadPlayers() {
    try {
      setLoading(true);
      setError(null);
      const playersData = await getAllPlayers();
      setPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load players");
    } finally {
      setLoading(false);
    }
  }

  async function loadPlayerAccounts(playerId: string) {
    try {
      setLoading(true);
      setError(null);
      const accountsData = await getPlayerAccounts(playerId);
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  async function loadTransferToAccounts(playerId: string) {
    try {
      const accountsData = await getPlayerAccounts(playerId);
      setTransferToAccounts(accountsData);
    } catch (err) {
      console.error("Failed to load transfer accounts:", err);
    }
  }

  async function handleDeposit() {
    if (!selectedPlayer || !selectedAccount || amount <= 0) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const playerId = selectedPlayer.playerId || selectedPlayer.id || '';
      await deposit(playerId, selectedAccount, amount);
      
      setSuccess(`Successfully deposited $${amount}`);
      setAmount(0);
      
      // Reload accounts to show updated balances
      await loadPlayerAccounts(playerId);
      // Reload players to show updated cash
      await loadPlayers();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deposit");
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    if (!selectedPlayer || !selectedAccount || amount <= 0) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const playerId = selectedPlayer.playerId || selectedPlayer.id || '';
      await withdraw(playerId, selectedAccount, amount);
      
      setSuccess(`Successfully withdrew $${amount}`);
      setAmount(0);
      
      // Reload accounts to show updated balances
      await loadPlayerAccounts(playerId);
      // Reload players to show updated cash
      await loadPlayers();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw");
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer() {
    if (!selectedPlayer || !selectedAccount || !transferToAccount || amount <= 0) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const playerId = selectedPlayer.playerId || selectedPlayer.id || '';
      await transfer(selectedAccount, transferToAccount, amount, playerId);
      
      const toPlayerName = players.find(p => (p.playerId || p.id) === transferToPlayer);
      setSuccess(`Successfully transferred $${amount} to ${toPlayerName?.firstName} ${toPlayerName?.lastName}`);
      setAmount(0);
      setTransferToPlayer('');
      setTransferToAccount('');
      
      // Reload accounts to show updated balances
      await loadPlayerAccounts(playerId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer");
    } finally {
      setLoading(false);
    }
  }

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
  const transferToAccountData = transferToAccounts.find(acc => acc.id === transferToAccount);

  return (
    <div className="container mx-auto p-6 max-w-5xl mt-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Maze Bank</h1>
          <p className="text-sm text-muted-foreground mt-2">Your trusted banking partner in Los Santos</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            ← Back to Home
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Player Selection */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Select Customer</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {players.map((player) => (
                  <Card 
                    key={player.id || player.playerId} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPlayer?.id === player.id ? 'border-ring bg-secondary/60' : 'hover:bg-secondary/60'
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <h3 className="font-semibold">{player.firstName} {player.lastName}</h3>
                    {!player.lastName.includes("Government") && !player.lastName.includes("Business") ? (
                      <p className="text-sm text-muted-foreground">Cash: ${player.cash}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">Bank: ${player.bank}</p>
                  </Card>
                ))}
          </div>
        </Card>

        {selectedPlayer && (
          <>
            {/* Account Information */}
            <Card>
              <h2 className="text-xl font-semibold mb-3">
                {selectedPlayer.firstName} {selectedPlayer.lastName}'s Accounts
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.id} className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold capitalize">{account.subType} Account</h3>
                      <p className="text-2xl font-bold">${account.balance}</p>
                      <p className="text-sm text-muted-foreground">APR: {account.apr}%</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {account.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Banking Operations */}
            <Card>
              <h2 className="text-xl font-semibold mb-3">Banking Operations</h2>
              
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-5">
                <Button 
                  variant={activeTab === 'deposit' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('deposit')}
                >
                  Deposit Cash
                </Button>
                <Button 
                  variant={activeTab === 'withdraw' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('withdraw')}
                >
                  Withdraw Money
                </Button>
                <Button 
                  variant={activeTab === 'transfer' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('transfer')}
                >
                  Transfer Funds
                </Button>
              </div>

              {/* Deposit Tab */}
              {activeTab === 'deposit' && (
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Deposit Cash to Bank Account</h3>
                  {!selectedPlayer.lastName.includes("Government") && !selectedPlayer.lastName.includes("Business") ? (
                    <p className="text-sm text-muted-foreground">Available Cash: ${selectedPlayer.cash}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Business entities cannot deposit cash - use transfers instead</p>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Account</label>
                      <select 
                        className="w-full p-2 border rounded-lg bg-transparent"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                      >
                        <option value="">Choose account...</option>
                        {accounts.filter(acc => acc.isActive && acc.type === 'personal').map(account => (
                          <option key={account.id} value={account.id}>
                            {account.subType.charAt(0).toUpperCase() + account.subType.slice(1)} - ${account.balance}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Enter amount"
                        min="1"
                        max={selectedPlayer.cash}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDeposit}
                    disabled={loading || !selectedAccount || amount <= 0 || amount > selectedPlayer.cash}
                    className="w-full"
                  >
                    {loading ? "Processing..." : `Deposit $${amount || 0}`}
                  </Button>
                </div>
              )}

              {/* Withdraw Tab */}
              {activeTab === 'withdraw' && (
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Withdraw Money from Bank Account</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Account</label>
                      <select 
                        className="w-full p-2 border rounded-lg bg-transparent"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                      >
                        <option value="">Choose account...</option>
                        {accounts.filter(acc => acc.isActive && acc.balance > 0 && acc.type === 'personal').map(account => (
                          <option key={account.id} value={account.id}>
                            {account.subType.charAt(0).toUpperCase() + account.subType.slice(1)} - ${account.balance}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Enter amount"
                        min="1"
                        max={selectedAccountData?.balance || 0}
                      />
                    </div>
                  </div>
                  
                  {selectedAccountData && (
                    <p className="text-sm text-muted-foreground">
                      Available Balance: ${selectedAccountData.balance}
                    </p>
                  )}
                  
                  <Button 
                    onClick={handleWithdraw}
                    disabled={loading || !selectedAccount || amount <= 0 || amount > (selectedAccountData?.balance || 0)}
                    className="w-full"
                  >
                    {loading ? "Processing..." : `Withdraw $${amount || 0}`}
                  </Button>
                </div>
              )}

              {/* Transfer Tab */}
              {activeTab === 'transfer' && (
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Transfer Between Accounts</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">From Account</label>
                      <select 
                        className="w-full p-2 border rounded-lg bg-transparent"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                      >
                        <option value="">Choose source account...</option>
                        {accounts.filter(acc => acc.isActive && acc.balance > 0).map(account => (
                          <option key={account.id} value={account.id}>
                            {account.type === 'business' ? '[Business] ' : ''}{account.subType.charAt(0).toUpperCase() + account.subType.slice(1)} - ${account.balance}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">To Player</label>
                      <select 
                        className="w-full p-2 border rounded-lg bg-transparent"
                        value={transferToPlayer}
                        onChange={(e) => setTransferToPlayer(e.target.value)}
                      >
                        <option value="">Choose recipient...</option>
                        {players.filter(p => (p.playerId || p.id) !== (selectedPlayer.playerId || selectedPlayer.id)).map(player => (
                          <option key={player.id || player.playerId} value={player.playerId || player.id}>
                            {player.firstName} {player.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {transferToPlayer && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">To Account</label>
                        <select 
                          className="w-full p-2 border rounded-lg bg-transparent"
                          value={transferToAccount}
                          onChange={(e) => setTransferToAccount(e.target.value)}
                        >
                          <option value="">Choose destination account...</option>
                          {transferToAccounts.filter(acc => acc.isActive).map(account => (
                            <option key={account.id} value={account.id}>
                              {account.type === 'business' ? '[Business] ' : ''}{account.subType.charAt(0).toUpperCase() + account.subType.slice(1)} - ${account.balance}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          placeholder="Enter amount"
                          min="1"
                          max={selectedAccountData?.balance || 0}
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedAccountData && (
                    <p className="text-sm text-muted-foreground">
                      Available Balance: ${selectedAccountData.balance}
                    </p>
                  )}
                  
                  <Button 
                    onClick={handleTransfer}
                    disabled={loading || !selectedAccount || !transferToAccount || amount <= 0 || amount > (selectedAccountData?.balance || 0)}
                    className="w-full"
                  >
                    {loading ? "Processing..." : `Transfer $${amount || 0}`}
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
