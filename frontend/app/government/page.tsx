"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { 
  getPolicy, 
  getGovernmentAccount, 
  updatePolicy,
  applySavingsInterest,
  getAllPlayers,
  type Player 
} from "@/lib/api";

interface Policy {
  id: number;
  savingsAPR: number;
  incomeTaxRate: number;
  salesTaxRate: number;
  businessTaxRate: number;
  investingLockupMonths: number;
  isInvestingEnabled: boolean;
}

interface GovernmentAccount {
  id: string;
  balance: number;
  type: string;
  subType: string;
  apr: number;
  isActive: boolean;
}

export default function GovernmentPage() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [account, setAccount] = useState<GovernmentAccount | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Policy update states
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<Policy>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [policyData, accountData, playersData] = await Promise.all([
        getPolicy(),
        getGovernmentAccount(),
        getAllPlayers()
      ]);
      setPolicy(policyData);
      setAccount(accountData);
      setPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load government data");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePolicy() {
    if (!newPolicy || Object.keys(newPolicy).length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const updatedPolicy = await updatePolicy(newPolicy);
      setPolicy(updatedPolicy);
      setNewPolicy({});
      setShowPolicyForm(false);
      setSuccess("Economic policy updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update policy");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyInterest() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await applySavingsInterest();
      
      await loadData();
      setSuccess("Savings interest applied to all accounts!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply interest");
    } finally {
      setLoading(false);
    }
  }

  const totalTaxRevenue = account ? account.balance - 10 : 0;

  const govPlayer = players.find(p => p.firstName === "Los" && p.lastName.includes("Government"));

  return (
    <div className="container mx-auto p-6 max-w-5xl mt-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Los Santos Government</h1>
          <p className="text-sm text-muted-foreground mt-2">Economic Policy & Treasury Management</p>
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

        {/* Government Treasury */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Government Treasury</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Treasury Balance</h3>
              <p className="text-3xl font-bold">${account?.balance.toLocaleString() || '0'}</p>
              <p className="text-sm text-muted-foreground mt-1">Total government funds</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Tax Revenue Collected</h3>
              <p className="text-3xl font-bold">${totalTaxRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">From income taxes</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Account Type</h3>
              <p className="text-xl font-bold capitalize">{account?.subType} Account</p>
              <p className="text-sm text-muted-foreground mt-1">Business account</p>
            </Card>
          </div>
        </Card>

        {/* Current Economic Policy */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Current Economic Policy</h2>
            <Button onClick={() => setShowPolicyForm(!showPolicyForm)}>
              {showPolicyForm ? "Cancel" : "Update Policy"}
            </Button>
          </div>
          
          {policy && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Savings APR</h3>
                <p className="text-2xl font-bold">{policy.savingsAPR}%</p>
                <p className="text-sm text-muted-foreground">Annual interest rate</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Income Tax Rate</h3>
                <p className="text-2xl font-bold">{policy.incomeTaxRate}%</p>
                <p className="text-sm text-muted-foreground">On salary payments</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Sales Tax Rate</h3>
                <p className="text-2xl font-bold">{policy.salesTaxRate}%</p>
                <p className="text-sm text-muted-foreground">On transactions</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Business Tax Rate</h3>
                <p className="text-2xl font-bold">{policy.businessTaxRate}%</p>
                <p className="text-sm text-muted-foreground">On business income</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Investment Lockup</h3>
                <p className="text-2xl font-bold">{policy.investingLockupMonths} months</p>
                <p className="text-sm text-muted-foreground">Investment term</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Investment Status</h3>
                <p className={`text-2xl font-bold ${policy.isInvestingEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {policy.isInvestingEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-muted-foreground">Investment accounts</p>
              </Card>
            </div>
          )}
        </Card>

        {/* Policy Update Form */}
        {showPolicyForm && (
          <Card>
            <h3 className="text-base font-semibold mb-3">Update Economic Policy</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-2">Savings APR (%)</label>
                <Input
                  type="number"
                  placeholder={policy?.savingsAPR.toString()}
                  value={newPolicy.savingsAPR || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, savingsAPR: Number(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Income Tax Rate (%)</label>
                <Input
                  type="number"
                  placeholder={policy?.incomeTaxRate.toString()}
                  value={newPolicy.incomeTaxRate || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, incomeTaxRate: Number(e.target.value)})}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sales Tax Rate (%)</label>
                <Input
                  type="number"
                  placeholder={policy?.salesTaxRate.toString()}
                  value={newPolicy.salesTaxRate || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, salesTaxRate: Number(e.target.value)})}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Business Tax Rate (%)</label>
                <Input
                  type="number"
                  placeholder={policy?.businessTaxRate.toString()}
                  value={newPolicy.businessTaxRate || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, businessTaxRate: Number(e.target.value)})}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Investment Lockup (months)</label>
                <Input
                  type="number"
                  placeholder={policy?.investingLockupMonths.toString()}
                  value={newPolicy.investingLockupMonths || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, investingLockupMonths: Number(e.target.value)})}
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Enable Investing</label>
                <select 
                  className="w-full p-2 border rounded-lg bg-transparent"
                  value={newPolicy.isInvestingEnabled !== undefined ? newPolicy.isInvestingEnabled.toString() : ''}
                  onChange={(e) => setNewPolicy({...newPolicy, isInvestingEnabled: e.target.value === 'true'})}
                >
                  <option value="">Choose...</option>
                  <option value="true">Enable</option>
                  <option value="false">Disable</option>
                </select>
              </div>
            </div>
            
            <Button 
              onClick={handleUpdatePolicy}
              disabled={loading || Object.keys(newPolicy).length === 0}
              className="w-full mt-4"
            >
              {loading ? "Updating..." : "Update Policy"}
            </Button>
          </Card>
        )}

        {/* Government Actions */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Government Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Apply Savings Interest</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Apply {policy?.savingsAPR}% annual interest to all active savings accounts
              </p>
              <Button 
                onClick={handleApplyInterest}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Applying..." : "Apply Interest"}
              </Button>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Refresh Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reload all government data and treasury information
              </p>
            </Card>
          </div>
        </Card>

        {/* Economic Statistics */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Economic Statistics</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Total Citizens</h3>
              <p className="text-2xl font-bold">{players.filter(p => !p.lastName.includes("Government")).length}</p>
              <p className="text-sm text-muted-foreground">Active players</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Employed Citizens</h3>
              <p className="text-2xl font-bold">
                {players.filter(p => p.jobId && p.jobId > 0 && !p.lastName.includes("Government")).length}
              </p>
              <p className="text-sm text-muted-foreground">With jobs</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Total Cash in Economy</h3>
              <p className="text-2xl font-bold">
                ${players.filter(p => !p.lastName.includes("Government")).reduce((sum, p) => sum + p.cash, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Physical money</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Total Bank Deposits</h3>
              <p className="text-2xl font-bold">
                ${players.filter(p => !p.lastName.includes("Government")).reduce((sum, p) => sum + p.bank, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">In bank accounts</p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
