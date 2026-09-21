import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Server,
  RefreshCw,
  Play,
  Table,
  Terminal,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Clock,
  Layers,
  ShoppingBag,
  Users,
  Trophy,
  DollarSign,
  Download,
  Code,
  RotateCcw,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { BACKEND_FILES } from '../../server/codeSnippets';

interface DBStats {
  dbPath: string;
  engine: string;
  status: string;
  sizeBytes: number;
  sizeFormatted: string;
  tables: {
    bingos: number;
    prizes: number;
    cards: {
      total: number;
      available: number;
      reserved: number;
      sold: number;
    };
    customers: number;
    orders: number;
  };
  totalRevenue: number;
  serverTime: string;
}

interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

interface DBTableInfo {
  name: string;
  rowCount: number;
  columns: TableColumn[];
}

const PRESET_QUERIES = [
  {
    label: 'Cartones Disponibles',
    sql: "SELECT card_number, status, numbers_json FROM cards WHERE status = 'AVAILABLE' LIMIT 10;",
  },
  {
    label: 'Cartones Reservados (Concurrencia)',
    sql: "SELECT card_number, status, reserved_until FROM cards WHERE status = 'RESERVED';",
  },
  {
    label: 'Últimas Órdenes Pagadas',
    sql: 'SELECT id, card_number, amount, payment_status, validation_code, created_at FROM orders ORDER BY created_at DESC LIMIT 5;',
  },
  {
    label: 'Clientes Registrados (DNI)',
    sql: 'SELECT dni, name, lastname, phone, email FROM customers ORDER BY created_at DESC LIMIT 5;',
  },
  {
    label: 'Premios del Bingo',
    sql: 'SELECT order_num, name, amount, icon_type FROM prizes ORDER BY order_num ASC;',
  },
  {
    label: 'Estructura de Tabla Cards (PRAGMA)',
    sql: 'PRAGMA table_info(cards);',
  },
];

const API_ENDPOINTS = [
  { method: 'GET', url: '/api/health', label: 'Health Check' },
  { method: 'GET', url: '/api/bingos/active', label: 'Bingo Activo & Premios' },
  { method: 'GET', url: '/api/orders', label: 'Listado de Órdenes' },
  { method: 'GET', url: '/api/db/stats', label: 'Estadísticas SQLite' },
  { method: 'GET', url: '/api/db/tables', label: 'Esquema de Tablas' },
];

export const DatabaseManagerTab: React.FC = () => {
  const { refreshFromBackend } = useBingo();
  const [stats, setStats] = useState<DBStats | null>(null);
  const [tables, setTables] = useState<DBTableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('cards');
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT card_number, status, numbers_json FROM cards LIMIT 10;");
  const [sqlResult, setSqlResult] = useState<{ rowCount: number; rows: any[] } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);

  // API Tester state
  const [testedEndpoint, setTestedEndpoint] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Code Viewer state
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'SQL' | 'API' | 'CODE'>('OVERVIEW');

  // Load database statistics
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/db/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error fetching DB stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Load database tables
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/db/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (e) {
      console.error('Error fetching DB tables:', e);
    }
  }, []);

  // Load rows for the currently selected table
  const fetchTableRows = useCallback(async (tableName: string) => {
    setIsLoadingTable(true);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: `SELECT * FROM ${tableName} LIMIT 25;` }),
      });
      if (res.ok) {
        const data = await res.json();
        setTableRows(data.rows || []);
      }
    } catch (e) {
      console.error('Error fetching table rows:', e);
    } finally {
      setIsLoadingTable(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTables();
  }, [fetchStats, fetchTables]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableRows(selectedTable);
    }
  }, [selectedTable, fetchTableRows]);

  // Execute custom SQL query
  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecutingSql(true);
    setSqlError(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const duration = Math.round(performance.now() - start);
      setQueryExecutionTime(duration);

      const data = await res.json();
      if (!res.ok) {
        setSqlError(data.error || 'Error ejecutando consulta');
        setSqlResult(null);
      } else {
        setSqlResult(data);
      }
    } catch (e: any) {
      setSqlError(e.message || 'Error de conexión');
      setSqlResult(null);
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Test an API endpoint
  const handleTestApi = async (method: string, url: string) => {
    setTestedEndpoint(url);
    setIsLoadingApi(true);
    setApiResponse(null);
    try {
      const res = await fetch(url, { method });
      setApiStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (e: any) {
      setApiStatus(500);
      setApiResponse({ error: e.message });
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Reset & reseed database
  const handleResetDb = async () => {
    if (
      !confirm(
        '¿Deseas restaurar la base de datos SQLite con los datos iniciales de fábrica? Esto recreará las tablas y sembrará los 30 cartones y premios oficiales.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        await refreshFromBackend();
        await fetchStats();
        await fetchTables();
        if (selectedTable) {
          await fetchTableRows(selectedTable);
        }
        alert('Base de datos SQLite restablecida con éxito.');
      }
    } catch (e) {
      alert('Error restaurando la base de datos.');
    }
  };

  // Export database JSON
  const handleExportJson = () => {
    if (!stats) return;
    const exportData = {
      timestamp: new Date().toISOString(),
      stats,
      tables,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo-sqlite-dump-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">Base de Datos SQLite & Backend REST</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  SQLite Conectado
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Almacenamiento persistente en <code className="text-amber-400 font-mono">bingo.db</code> vía motor nativo{' '}
                <code className="text-indigo-300 font-mono">node:sqlite DatabaseSync</code> + servidor Express en puerto 3000.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                fetchStats();
                fetchTables();
                if (selectedTable) fetchTableRows(selectedTable);
                refreshFromBackend();
              }}
              disabled={isLoadingStats}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              title="Refrescar estadísticas desde el backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              title="Descargar estado de la base de datos en JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={handleResetDb}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-xs text-red-300 border border-red-900/50 transition-colors"
              title="Restaurar base de datos SQLite con datos iniciales"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Restaurar BD</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Tamaño Archivo</span>
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {stats?.sizeFormatted || 'Calculando...'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">bingo.db</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Cartones Totales</span>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {stats?.tables.cards.total ?? 0}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              {stats?.tables.cards.available ?? 0} disponibles
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Cartones Vendidos</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-base font-black text-purple-300 mt-1">
              {stats?.tables.cards.sold ?? 0}
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              {stats?.tables.cards.reserved ?? 0} reservados
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Órdenes Emitidas</span>
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-black text-emerald-400 mt-1">
              {stats?.tables.orders ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              ${(stats?.totalRevenue ?? 0).toLocaleString('es-AR')} ARS
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Compradores (DNI)</span>
              <Users className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {stats?.tables.customers ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">En tabla customers</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Premios Oficiales</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black text-white mt-1">
              {stats?.tables.prizes ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">En tabla prizes</div>
          </div>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('OVERVIEW')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Visor de Tablas SQLite</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SQL')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'SQL'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Consola SQL Interactiva</span>
        </button>

        <button
          onClick={() => setActiveSubTab('API')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'API'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Probador de Endpoints REST</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CODE')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'CODE'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-amber-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Ver Código Backend & Modelo BD</span>
        </button>
      </div>

      {/* SUBTAB 1: TABLE EXPLORER */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Table Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold mr-1">Tabla:</span>
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedTable === t.name
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{t.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    selectedTable === t.name ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.rowCount}
                </span>
              </button>
            ))}
          </div>

          {/* Table Schema Definition */}
          {tables.find((t) => t.name === selectedTable) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  Esquema de la tabla <span className="text-amber-400 font-mono font-bold">"{selectedTable}"</span>
                </span>
                <span className="text-xs text-slate-400">
                  Total de registros: <strong className="text-white">{tables.find((t) => t.name === selectedTable)?.rowCount}</strong>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tables
                  .find((t) => t.name === selectedTable)
                  ?.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono"
                    >
                      <span className="text-white font-bold">{col.name}</span>
                      <span className="text-indigo-400 font-semibold">{col.type}</span>
                      {col.pk && (
                        <span className="px-1 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          PK
                        </span>
                      )}
                      {col.notnull && <span className="text-slate-500 text-[9px]">NOT NULL</span>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Table Data View */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">
                Mostrando hasta primeros 25 registros en SQLite
              </span>
              <button
                onClick={() => fetchTableRows(selectedTable)}
                disabled={isLoadingTable}
                className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingTable ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              {tableRows.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No hay filas almacenadas en la tabla <code className="font-mono text-slate-400">{selectedTable}</code>.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="bg-slate-950/80 sticky top-0 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
                    <tr>
                      {Object.keys(tableRows[0] || {}).map((col) => (
                        <th key={col} className="p-3 font-bold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {tableRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                        {Object.entries(row).map(([key, val]) => (
                          <td key={key} className="p-3 whitespace-nowrap max-w-xs truncate">
                            {val === null ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : typeof val === 'object' ? (
                              JSON.stringify(val)
                            ) : key.includes('status') ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  val === 'AVAILABLE'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : val === 'RESERVED'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : val === 'SOLD'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {String(val)}
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE SQL CONSOLE */}
      {activeSubTab === 'SQL' && (
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Consultas SQL Rápidas:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSqlQuery(preset.sql)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4" />
                <span>sqlite&gt; Ejecutar consulta (SELECT / PRAGMA)</span>
              </span>
              <button
                onClick={handleExecuteSql}
                disabled={isExecutingSql}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecutingSql ? 'Ejecutando...' : 'Ejecutar SQL'}</span>
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-400 resize-y"
              placeholder="Escribe tu consulta SQL aquí (ej: SELECT * FROM cards WHERE status = 'AVAILABLE';)"
            />

            {sqlError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{sqlError}</span>
              </div>
            )}
          </div>

          {/* Query Results */}
          {sqlResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Resultados: <strong className="text-emerald-400">{sqlResult.rowCount} fila(s)</strong>
                </span>
                {queryExecutionTime !== null && (
                  <span className="text-slate-400 font-mono text-[11px] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Tiempo de ejecución: {queryExecutionTime} ms</span>
                  </span>
                )}
              </div>

              <div className="overflow-x-auto max-h-96">
                {sqlResult.rows.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    La consulta no devolvió ningún registro.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead className="bg-slate-950/80 sticky top-0 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
                      <tr>
                        {Object.keys(sqlResult.rows[0] || {}).map((col) => (
                          <th key={col} className="p-3 font-bold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {sqlResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                          {Object.entries(row).map(([key, val]) => (
                            <td key={key} className="p-3 whitespace-nowrap max-w-xs truncate">
                              {val === null ? (
                                <span className="text-slate-600 italic">null</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: REST API TESTER */}
      {activeSubTab === 'API' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Probar Endpoints Reales del Servidor Express:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {API_ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.url}
                  onClick={() => handleTestApi(endpoint.method, endpoint.url)}
                  className={`flex items-center justify-between p-3 rounded-xl text-left border transition-all text-xs ${
                    testedEndpoint === endpoint.url
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="font-bold">{endpoint.label}</div>
                    <div className="text-[10px] font-mono text-indigo-400">{endpoint.url}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {endpoint.method}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Response Inspector */}
          {testedEndpoint && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-amber-400 font-bold">{testedEndpoint}</span>
                  {apiStatus && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        apiStatus >= 200 && apiStatus < 300
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      HTTP {apiStatus}
                    </span>
                  )}
                </div>
                {isLoadingApi && <span className="text-slate-400 text-xs animate-pulse">Cargando...</span>}
              </div>

              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-auto max-h-96 leading-relaxed select-text">
                <code>{apiResponse ? JSON.stringify(apiResponse, null, 2) : 'Sin respuesta todavía'}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: CODE & DATABASE MODEL VIEWER */}
      {activeSubTab === 'CODE' && (
        <div className="space-y-4">
          {/* File selector buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {BACKEND_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                  selectedFileIndex === idx
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.path}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
                    selectedFileIndex === idx ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {file.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Active File Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header with Title and Copy button */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-black text-amber-400">
                    {BACKEND_FILES[selectedFileIndex].path}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-200 font-semibold">
                    {BACKEND_FILES[selectedFileIndex].title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {BACKEND_FILES[selectedFileIndex].description}
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(BACKEND_FILES[selectedFileIndex].code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 border border-slate-700 transition-colors shrink-0 self-start sm:self-auto"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <div className="p-4 overflow-x-auto max-h-[550px] bg-slate-950 font-mono text-xs leading-relaxed">
              <pre className="text-slate-300 select-text">
                <code>{BACKEND_FILES[selectedFileIndex].code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
