"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { 
  getAllJobs, 
  createJob, 
  assignJob, 
  payPlayer,
  getAllPlayers,
  type Job, 
  type Player 
} from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [newJobSalary, setNewJobSalary] = useState<number>(0);
  
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<number>(0);
  
  const [paymentPlayer, setPaymentPlayer] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [jobsData, playersData] = await Promise.all([
        getAllJobs(),
        getAllPlayers()
      ]);
      setJobs(jobsData);
      setPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob() {
    if (!newJobName.trim() || newJobSalary <= 0) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const createdJob = await createJob(newJobName.trim(), newJobSalary);
      setJobs([...jobs, createdJob]);
      setNewJobName("");
      setNewJobSalary(0);
      setShowCreateForm(false);
      setSuccess(`Job "${createdJob.name}" created successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignJob() {
    if (!selectedPlayer || !selectedJob) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await assignJob(selectedPlayer, selectedJob);
      
      const playersData = await getAllPlayers();
      setPlayers(playersData);
      
      const job = jobs.find(j => j.id === selectedJob);
      const player = players.find(p => (p.playerId || p.id) === selectedPlayer);
      setSuccess(`Assigned "${job?.name}" to ${player?.firstName} ${player?.lastName}`);
      
      setSelectedPlayer("");
      setSelectedJob(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign job");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaySalary() {
    if (!paymentPlayer) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await payPlayer(paymentPlayer);
      
      const playersData = await getAllPlayers();
      setPlayers(playersData);
      
      const player = players.find(p => (p.playerId || p.id) === paymentPlayer);
      setSuccess(`Salary paid to ${player?.firstName} ${player?.lastName}`);
      
      setPaymentPlayer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pay salary");
    } finally {
      setLoading(false);
    }
  }

  function getJobName(jobId: number): string {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.name : "Unknown";
  }

  function getJobSalary(jobId: number): number {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.salary : 0;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl mt-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Jobs Center</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage jobs and employee assignments</p>
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

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "Create New Job"}
          </Button>

        </div>

        {/* Create Job Form */}
        {showCreateForm && (
          <Card className="w-full max-w-xl mx-auto">
            <h3 className="text-base font-semibold px-5">Create New Job</h3>
            <div className="space-y-4">
              <Input
                placeholder="Job Name (e.g. Police Officer)"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Salary per payment"
                value={newJobSalary}
                onChange={(e) => setNewJobSalary(Number(e.target.value))}
                min="1"
              />
              <Button 
                onClick={handleCreateJob}
                disabled={loading || !newJobName.trim() || newJobSalary <= 0}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </Card>
        )}

        {/* Jobs List */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Available Jobs ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No jobs available. Create one to get started.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">{job.name}</h3>
                    <p className="text-xl font-bold">${job.salary}</p>
                    <p className="text-sm text-muted-foreground">per payment</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Job Assignment */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Assign Job to Player</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">Select Player</label>
              <select 
                className="w-full p-2 border rounded-lg bg-transparent"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">Choose player...</option>
                {players.map(player => (
                  <option key={player.id || player.playerId} value={player.playerId || player.id}>
                    {player.firstName} {player.lastName}
                    {player.jobId ? ` (Current: ${getJobName(player.jobId)})` : ' (No Job)'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Job</label>
              <select 
                className="w-full p-2 border rounded-lg bg-transparent"
                value={selectedJob}
                onChange={(e) => setSelectedJob(Number(e.target.value))}
              >
                <option value="">Choose job...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.name} - ${job.salary}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAssignJob}
                disabled={loading || !selectedPlayer || !selectedJob}
                className="w-full"
              >
                {loading ? "Assigning..." : "Assign Job"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Salary Payment */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Pay Employee Salary</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Select Employee</label>
              <select 
                className="w-full p-2 border rounded-lg bg-transparent"
                value={paymentPlayer}
                onChange={(e) => setPaymentPlayer(e.target.value)}
              >
                <option value="">Choose employee...</option>
                {players.filter(p => p.jobId && p.jobId > 0).map(player => (
                  <option key={player.id || player.playerId} value={player.playerId || player.id}>
                    {player.firstName} {player.lastName} - {getJobName(player.jobId)} (${getJobSalary(player.jobId)})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handlePaySalary}
                disabled={loading || !paymentPlayer}
                className="w-full"
              >
                {loading ? "Paying..." : "Pay Salary"}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-4 rounded-lg border border-border">
            <h4 className="font-medium mb-2">How Salary Payment Works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Salary is paid directly to employee's chequing account</li>
              <li>• Income tax is automatically deducted based on government policy</li>
              <li>• Tax revenue goes to government treasury</li>
              <li>• Employee receives net salary after tax deduction</li>
            </ul>
          </div>
        </Card>

        {/* Employees List */}
        <Card>
          <h2 className="text-xl font-semibold mb-3">Current Employees</h2>
          {players.filter(p => p.jobId && p.jobId > 0).length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No employees assigned yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {players.filter(p => p.jobId && p.jobId > 0).map((player) => (
                <Card key={player.id || player.playerId} className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">
                      {player.firstName} {player.lastName}
                    </h3>
                    <p className="text-blue-500 font-medium">{getJobName(player.jobId)}</p>
                    <p className="font-bold">${getJobSalary(player.jobId)} salary</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {!player.lastName.includes("Government") && !player.lastName.includes("Business") ? (
                        <p>Cash: ${player.cash}</p>
                      ) : null}
                      <p>Bank: ${player.bank}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
