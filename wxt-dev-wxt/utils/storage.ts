import { storage } from '#imports';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Save and retrieve functions
export async function savePlayerName(name: string): Promise<void> {
  await storage.setItems([
    { key: 'local:playerName', value: name },
  ]);
}

export async function getPlayerName(): Promise<string | null> {
  return await storage.getItem('local:playerName');
}

export async function savePlayerId(id: number): Promise<void> {
  await storage.setItems([
    { key: 'local:playerId', value: id },
  ]);
}

export async function getPlayerId(): Promise<number | null> {
  return await storage.getItem('local:playerId');
}

export async function getUser(): Promise<User | null> {
  return await storage.getItem('local:user');
}

export async function saveUser(user: User): Promise<void> {
  await storage.setItems([
    { key: 'local:user', value: user },
  ]);
}

export async function clearUser(): Promise<void> {
  await storage.removeItem('local:user');
}