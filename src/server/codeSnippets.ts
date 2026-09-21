export const BACKEND_FILES = [
  {
    path: 'server.ts',
    title: 'Servidor Express + Rutas REST',
    badge: 'Express API Server',
    description: 'Servidor HTTP en Node.js que expone endpoints para cartones, reservas temporales atómicas, órdenes y pagos.',
    code: `import express from 'express';
import path from 'path';
import { dbService } from './src/server/db';

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Bingos & Configuración
app.get('/api/bingos/active', (req, res) => {
  const bingo = dbService.getActiveBingo();
  const prizes = dbService.getPrizesByBingo(bingo.id);
  res.json({ bingo, prizes });
});

// 2. Cartones & Concurrencia de Reserva
app.get('/api/bingos/:id/cards', (req, res) => {
  const cards = dbService.getCardsByBingo(req.params.id);
  res.json({ cards });
});

// Reserva temporal atómica (10 minutos anti-colisión)
app.post('/api/cards/:id/reserve', (req, res) => {
  const { minutes = 10 } = req.body;
  const result = dbService.reserveCard(req.params.id, minutes);
  if (!result.success) {
    return res.status(409).json(result);
  }
  res.json(result);
});

app.post('/api/cards/:id/release', (req, res) => {
  const success = dbService.releaseCard(req.params.id);
  res.json({ success });
});

// 3. Emisión de Órdenes y Compradores
app.post('/api/orders', (req, res) => {
  const { bingoId, cardId, customer, amount, paymentMethod, paymentId } = req.body;
  const order = dbService.createOrder({
    bingoId,
    cardId,
    customer,
    amount,
    paymentMethod,
    paymentId,
  });
  res.status(201).json({ success: true, order });
});

// 4. Mercado Pago Webhooks & Preferencias
app.post('/api/mercadopago/create-preference', async (req, res) => {
  const { cardId, customer, amount } = req.body;
  // Integra SDK oficial de Mercado Pago
  res.json({ preferenceId: 'pref_' + Date.now() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Servidor escuchando en http://localhost:\${PORT}\`);
});`,
  },
  {
    path: 'src/server/db.ts',
    title: 'Esquema de BD SQLite & Servicio de Datos',
    badge: 'node:sqlite DatabaseSync',
    description: 'Definición DDL con 6 tablas relacionales, llaves foráneas, índices y lógica transaccional.',
    code: `import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'bingo.db');
export const db = new DatabaseSync(DB_PATH);

export function initSchema() {
  db.exec(\`
    PRAGMA foreign_keys = ON;

    -- 1. Tabla de Bingos
    CREATE TABLE IF NOT EXISTS bingos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      card_price REAL NOT NULL,
      currency TEXT DEFAULT 'ARS',
      status TEXT CHECK(status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'FINISHED', 'CANCELLED')) DEFAULT 'ACTIVE',
      max_reservation_minutes INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Tabla de Cartones Físicos (Matriz de 10 números)
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      bingo_id TEXT NOT NULL,
      card_number INTEGER NOT NULL,
      numbers_json TEXT NOT NULL,
      status TEXT CHECK(status IN ('AVAILABLE', 'RESERVED', 'SOLD')) DEFAULT 'AVAILABLE',
      reserved_until DATETIME,
      sold_to_order_id TEXT,
      FOREIGN KEY (bingo_id) REFERENCES bingos(id) ON DELETE CASCADE,
      UNIQUE(bingo_id, card_number)
    );

    -- 3. Tabla de Premios Oficiales
    CREATE TABLE IF NOT EXISTS prizes (
      id TEXT PRIMARY KEY,
      bingo_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      order_num INTEGER NOT NULL,
      icon_type TEXT,
      FOREIGN KEY (bingo_id) REFERENCES bingos(id) ON DELETE CASCADE
    );

    -- 4. Tabla de Clientes (DNI único)
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      dni TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      lastname TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Tabla de Órdenes de Compra
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      bingo_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      card_number INTEGER NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('PENDING', 'PAID', 'REJECTED')) DEFAULT 'PAID',
      payment_id TEXT,
      validation_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bingo_id) REFERENCES bingos(id),
      FOREIGN KEY (card_id) REFERENCES cards(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- 6. Configuración de Mercado Pago
    CREATE TABLE IF NOT EXISTS mp_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      public_key TEXT,
      access_token TEXT,
      webhook_url TEXT,
      sandbox_mode INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
    CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(card_number);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  \`);
}`,
  },
  {
    path: 'database_schema.sql',
    title: 'Esquema SQL Puro (DDL Exportable)',
    badge: 'SQL DDL Estándar',
    description: 'Script SQL estándar compatible con SQLite, PostgreSQL o MySQL para migraciones de base de datos.',
    code: `-- BINGO DIGITAL: ESQUEMA DE BASE DE DATOS COMPLETO

-- Tabla de Bingos
CREATE TABLE bingos (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  card_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  max_reservation_minutes INT DEFAULT 10,
  live_stream_url TEXT,
  terms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Premios
CREATE TABLE prizes (
  id VARCHAR(64) PRIMARY KEY,
  bingo_id VARCHAR(64) NOT NULL REFERENCES bingos(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  order_num INT NOT NULL,
  icon_type VARCHAR(50)
);

-- Tabla de Cartones
CREATE TABLE cards (
  id VARCHAR(64) PRIMARY KEY,
  bingo_id VARCHAR(64) NOT NULL REFERENCES bingos(id) ON DELETE CASCADE,
  card_number INT NOT NULL,
  numbers_json TEXT NOT NULL, -- Matriz con los 10 números de juego
  status VARCHAR(20) DEFAULT 'AVAILABLE', -- 'AVAILABLE' | 'RESERVED' | 'SOLD'
  reserved_until TIMESTAMP NULL,
  sold_to_order_id VARCHAR(64) NULL,
  UNIQUE (bingo_id, card_number)
);

-- Tabla de Clientes
CREATE TABLE customers (
  id VARCHAR(64) PRIMARY KEY,
  dni VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Órdenes
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  bingo_id VARCHAR(64) NOT NULL REFERENCES bingos(id),
  card_id VARCHAR(64) NOT NULL REFERENCES cards(id),
  card_number INT NOT NULL,
  customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'PAID',
  payment_id VARCHAR(100),
  validation_code VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  },
];
