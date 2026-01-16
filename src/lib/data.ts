import { HistoryEntry } from './types';
import * as fs from 'fs';
import * as path from 'path';

// This runs at build time in Next.js
export function getHistoryData(): HistoryEntry[] {
  const historyDir = path.join(process.cwd(), 'data', 'history');

  if (!fs.existsSync(historyDir)) {
    return [];
  }

  const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
  const entries: HistoryEntry[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(historyDir, file), 'utf-8');
      const data = JSON.parse(content) as HistoryEntry;
      if (data.date) {
        entries.push(data);
      }
    } catch {
      // Skip invalid files
    }
  }

  // Sort by date ascending
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}
