import * as fs from 'fs';
import path from 'path';
import * as sqlite3 from 'sqlite3';

import type { Database } from 'sqlite3';
export class DatabaseService {
    private db: Database | null = null;

    async connect(): Promise<void> {
        const dataDirectory = path.resolve(process.cwd(), 'data');

        if (!fs.existsSync(dataDirectory)) {
            fs.mkdirSync(dataDirectory, { recursive: true });
        }

        const databasePath = path.join(dataDirectory, 'database.sqlite');

        this.db = new sqlite3.Database(databasePath);

        await this.createTables();
    }

    private async createTables(): Promise<void> {
        if (this.db) {
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS updates (
                    id INTEGER PRIMARY KEY,
                    date TEXT NOT NULL,
                    data TEXT NOT NULL
                )
            `);
        }
    }

    async insertUpdate(date: string, data: string): Promise<void> {
        if (this.db) {
            this.db.run(
                `INSERT INTO updates (date, data) VALUES (?, ?)`,
                date,
                data,
            );
        }
    }

    async getLastUpdate(): Promise<any> {
        if (this.db) {
            const row = this.db.get(
                `SELECT * FROM updates ORDER BY date DESC LIMIT 1`,
            );
            return row;
        }
        return null;
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
