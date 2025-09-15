"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { getAllPlayers, createPlayer, type Player } from "@/lib/api";

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Player>({
    firstName: "",
    lastName: "",
    weight: 70,
    height: 180,
    hairColor: "brown",
    eyesColor: "brown",
    hairStyle: "short",
    skinColor: "medium",
    sex: "male",
    birthDate: new Date().toISOString(),
    jobId: 0,
    cash: 500,
    bank: 0
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      setLoading(true);
      setError(null);
      const playersData = await getAllPlayers();
      console.log("playersData", playersData);
      setPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load players");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePlayer() {
    try {
      setLoading(true);
      setError(null);
      const createdPlayer = await createPlayer(newPlayer);
      setPlayers([...players, createdPlayer]);
      setShowCreateForm(false);
      setNewPlayer({
        firstName: "",
        lastName: "",
        weight: 70,
        height: 180,
        hairColor: "brown",
        eyesColor: "brown",
        hairStyle: "short",
        skinColor: "medium",
        sex: "male",
        birthDate: new Date().toISOString(),
        jobId: 0,
        cash: 500,
        bank: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl mt-12">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Flourishing Economy</h1>
          <p className="text-sm text-muted-foreground mt-2">A modern economy system for your GTA RP server</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg w-full">
            {error}
          </div>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "Create Player"}
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/bank")}
          >
            🏦 Maze Bank
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/jobs")}
          >
            💼 Jobs Center
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/government")}
          >
            🏛️ Government
          </Button>
        </div>

        {showCreateForm && (
          <Card className="w-full max-w-md">
            <h3 className="text-base font-semibold px-5">Create New Player</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name"
                  value={newPlayer.firstName}
                  onChange={(e) => setNewPlayer({ ...newPlayer, firstName: e.target.value })}
                />
                <Input
                  placeholder="Last Name"
                  value={newPlayer.lastName}
                  onChange={(e) => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Weight (kg)"
                  value={newPlayer.weight}
                  onChange={(e) => setNewPlayer({ ...newPlayer, weight: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Height (cm)"
                  value={newPlayer.height}
                  onChange={(e) => setNewPlayer({ ...newPlayer, height: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Hair Color"
                  value={newPlayer.hairColor}
                  onChange={(e) => setNewPlayer({ ...newPlayer, hairColor: e.target.value })}
                />
                <Input
                  placeholder="Eye Color"
                  value={newPlayer.eyesColor}
                  onChange={(e) => setNewPlayer({ ...newPlayer, eyesColor: e.target.value })}
                />
              </div>
              <Button
                onClick={handleCreatePlayer}
                disabled={loading || !newPlayer.firstName || !newPlayer.lastName}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Player"}
              </Button>
            </div>
          </Card>
        )}

        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Players ({players.length})</h2>
          </div>
          {players.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No players found. Create one to get started.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {players.map((player) => (
                <Card key={player.id} className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">
                      {player.firstName} {player.lastName}
                    </h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Height: {player.height}cm · Weight: {player.weight}kg</p>
                      <p>Hair: {player.hairColor} · Eyes: {player.eyesColor}</p>
                      <p>Sex: {player.sex}</p>
                      {!player.lastName.includes("Government") && !player.lastName.includes("Business") ? (
                        <p className="text-foreground">Cash: ${player.cash}</p>
                      ) : null}
                      <p className="text-foreground">Bank: ${player.bank}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
