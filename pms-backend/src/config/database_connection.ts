import { Pool } from 'pg';

class DatabaseConnection {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'pms_db',
      max: 20
    });

    this.pool.on('error', (err) => {
      console.error('Error imprevisto en el cliente de PostgreSQL:', err);
    });
  }

  public getPool(): Pool {
    return this.pool;
  }
}

// Exportación de la instancia única (Singleton idiomático en Node.js)
export const dbConnection = new DatabaseConnection();
