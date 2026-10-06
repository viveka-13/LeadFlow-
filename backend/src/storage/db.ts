import fs from 'fs';
import path from 'path';
import { Lead } from '../types';

const DB_FILE = path.join(__dirname, '../../db.json');

class Storage {
  private leads: Map<string, Lead> = new Map();

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          parsed.forEach((lead: Lead) => this.leads.set(lead.id, lead));
        }
      }
    } catch (err) {
      console.error('[Storage] Error loading db:', err);
    }
  }

  private save() {
    try {
      const data = Array.from(this.leads.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error saving db:', err);
    }
  }

  public addLead(lead: Lead): boolean {
    if (this.leads.has(lead.id)) {
      return false; // Already exists
    }
    this.leads.set(lead.id, lead);
    this.save();
    return true;
  }

  public getLeads(): Lead[] {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getLead(id: string): Lead | undefined {
    return this.leads.get(id);
  }
}

export const db = new Storage();
