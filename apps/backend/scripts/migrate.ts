#!/usr/bin/env node

/**
 * Database Migration Manager
 * Sistema de controle de migrations com rastreamento automático
 */

import { Pool } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '../../.env') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurada no .env')
  console.error('   Exemplo: DATABASE_URL=postgresql://user:password@localhost:5432/ludolens')
  process.exit(1)
}

interface Migration {
  version: string
  name: string
  filename: string
  path: string
}

interface ExecutedMigration {
  version: string
  name: string
  executed_at: Date
}

async function ensureMigrationsTable(client: any) {
  // Verifica se a tabela schema_migrations existe
  const tableExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'schema_migrations'
    )
  `)

  if (!tableExists.rows[0].exists) {
    console.log('🔄 Criando tabela de controle de migrations...')
    const migrationPath = join(__dirname, '..', 'migrations', '000_create_migrations_table.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    await client.query(migrationSQL)
    console.log('✅ Tabela schema_migrations criada')
  }
}

async function getExecutedMigrations(client: any): Promise<ExecutedMigration[]> {
  const result = await client.query(`
    SELECT version, name, executed_at
    FROM schema_migrations
    ORDER BY version
  `)
  return result.rows
}

function getAvailableMigrations(): Migration[] {
  const migrationsDir = join(__dirname, '..', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  return files.map((filename) => {
    const match = filename.match(/^(\d+)_(.+)\.sql$/)
    if (!match) {
      throw new Error(`Nome de migration inválido: ${filename}`)
    }

    const [, version, name] = match
    return {
      version,
      name,
      filename,
      path: join(migrationsDir, filename),
    }
  })
}

async function executeMigration(client: any, migration: Migration) {
  console.log(`🔄 Executando migration ${migration.version}: ${migration.name}...`)

  const sql = readFileSync(migration.path, 'utf-8')

  await client.query('BEGIN')
  try {
    await client.query(sql)

    // Registra a migration executada (exceto a 000 que se auto-registra)
    if (migration.version !== '000') {
      await client.query(
        'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
        [migration.version, migration.name]
      )
    }

    await client.query('COMMIT')
    console.log(`✅ Migration ${migration.version} executada com sucesso`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function runMigrations(specificVersion?: string) {
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    console.log('🔄 Conectando ao PostgreSQL...')
    const client = await pool.connect()
    console.log('✅ Conexão estabelecida\n')

    // Garante que a tabela de controle existe
    await ensureMigrationsTable(client)

    // Busca migrations executadas e disponíveis
    const executed = await getExecutedMigrations(client)
    const available = getAvailableMigrations()

    const executedVersions = new Set(executed.map((m) => m.version))

    if (specificVersion) {
      // Executa migration específica
      const migration = available.find((m) => m.version === specificVersion)

      if (!migration) {
        console.error(`❌ Migration ${specificVersion} não encontrada`)
        process.exit(1)
      }

      if (executedVersions.has(specificVersion)) {
        console.log(`⚠️  Migration ${specificVersion} já foi executada`)
        console.log('   Execute novamente se tiver certeza que quer reprocessar')
      }

      await executeMigration(client, migration)
    } else {
      // Executa migrations pendentes
      const pending = available.filter((m) => !executedVersions.has(m.version))

      if (pending.length === 0) {
        console.log('✅ Todas as migrations já foram executadas')
        console.log('\nMigrations executadas:')
        executed.forEach((m) => {
          console.log(`   ✓ ${m.version} - ${m.name}`)
        })
      } else {
        console.log(`📋 ${pending.length} migration(s) pendente(s):\n`)

        for (const migration of pending) {
          await executeMigration(client, migration)
        }

        console.log('\n🎉 Todas as migrations foram executadas com sucesso!')
      }
    }

    // Validações finais
    console.log('\n🔍 Validando estrutura do banco...')

    // Verifica extensão pgvector
    const extensionCheck = await client.query(
      `SELECT * FROM pg_extension WHERE extname = 'vector'`
    )
    if (extensionCheck.rows.length > 0) {
      console.log('✅ Extensão pgvector instalada')
    }

    // Verifica tabelas principais
    const tables = ['schema_migrations', 'game_manuals_vectors', 'game_manuals']
    for (const tableName of tables) {
      const tableCheck = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = $1
        )`,
        [tableName]
      )

      if (tableCheck.rows[0].exists) {
        console.log(`✅ Tabela ${tableName} existe`)
      }
    }

    client.release()
    console.log('\n✨ Banco de dados pronto para uso!')
    console.log('   Execute: npm run dev')
  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Parse argumentos de linha de comando
const args = process.argv.slice(2)
const specificVersion = args[0]

runMigrations(specificVersion)
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
