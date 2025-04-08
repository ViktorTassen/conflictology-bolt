import { storage } from '#imports';


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