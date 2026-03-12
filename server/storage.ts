import fs from "fs/promises";
import path from "path";
import { type Architecture, type InsertArchitecture } from "@shared/schema";

export interface IStorage {
  createArchitecture(arch: Omit<Architecture, "id" | "createdAt">): Promise<Architecture>;
  getArchitecture(id: number): Promise<Architecture | undefined>;
  listArchitectures(): Promise<Architecture[]>;
}

export class FileStorage implements IStorage {
  private filePath: string;

  constructor() {
    this.filePath = path.resolve(process.cwd(), "data", "architectures.json");
    this.init();
  }

  private async init() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }
  }

  private async readData(): Promise<Architecture[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeData(data: Architecture[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async createArchitecture(insertArch: Omit<Architecture, "id" | "createdAt">): Promise<Architecture> {
    const data = await this.readData();
    const newArch: Architecture = {
      ...insertArch,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    data.push(newArch);
    await this.writeData(data);
    return newArch;
  }

  async getArchitecture(id: number): Promise<Architecture | undefined> {
    const data = await this.readData();
    return data.find((a) => a.id === id);
  }

  async listArchitectures(): Promise<Architecture[]> {
    const data = await this.readData();
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new FileStorage();
