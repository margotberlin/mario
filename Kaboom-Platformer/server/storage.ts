export interface IStorage {
  // Add backend storage methods here if needed in the future
}

export class MemStorage implements IStorage {
  // In-memory storage implementation
}

export const storage = new MemStorage();
