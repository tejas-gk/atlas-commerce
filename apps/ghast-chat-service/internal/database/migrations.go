package database

import (
	"database/sql"
	"fmt"
	"strings"
)

// Migration represents a single database migration
type Migration struct {
	Name string
	SQL  string
}

// RunMigrations executes all database migrations in order
func RunMigrations(db *sql.DB) error {
	migrations := []Migration{
		{
			Name: "create_users_table",
			SQL:  createUsersTable,
		},
		{
			Name: "create_conversations_table",
			SQL:  createConversationsTable,
		},
		{
			Name: "create_conversation_members_table",
			SQL:  createConversationMembersTable,
		},
		{
			Name: "create_messages_table",
			SQL:  createMessagesTable,
		},
		{
			Name: "create_indexes",
			SQL:  createIndexes,
		},
	}

	for i, migration := range migrations {
		if err := executeMigration(db, migration, i+1); err != nil {
			return err
		}
	}

	return nil
}

// executeMigration runs a single migration and handles errors
func executeMigration(db *sql.DB, migration Migration, sequence int) error {
	_, err := db.Exec(migration.SQL)
	if err != nil {
		return fmt.Errorf("migration %d (%s) failed: %w", sequence, migration.Name, err)
	}
	return nil
}

// RunMigrationsWithTransaction runs all migrations within a transaction
func RunMigrationsWithTransaction(db *sql.DB) error {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		}
	}()

	// Create migrations table if it doesn't exist
	if err := createMigrationsTable(tx); err != nil {
		tx.Rollback()
		return err
	}

	migrations := []Migration{
		{
			Name: "create_users_table",
			SQL:  createUsersTable,
		},
		{
			Name: "create_conversations_table",
			SQL:  createConversationsTable,
		},
		{
			Name: "create_conversation_members_table",
			SQL:  createConversationMembersTable,
		},
		{
			Name: "create_messages_table",
			SQL:  createMessagesTable,
		},
		{
			Name: "create_indexes",
			SQL:  createIndexes,
		},
	}

	for _, migration := range migrations {
		// Check if migration has already been applied
		applied, err := isMigrationApplied(tx, migration.Name)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to check migration status: %w", err)
		}

		if applied {
			continue
		}

		// Execute migration
		if _, err := tx.Exec(migration.SQL); err != nil {
			tx.Rollback()
			return fmt.Errorf("migration %s failed: %w", migration.Name, err)
		}

		// Record migration
		if err := recordMigration(tx, migration.Name); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration: %w", err)
		}
	}

	return tx.Commit()
}

// createMigrationsTable creates the migrations tracking table
func createMigrationsTable(tx *sql.Tx) error {
	createMigrationsTableSQL := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id SERIAL PRIMARY KEY,
			migration_name VARCHAR(255) NOT NULL UNIQUE,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`
	_, err := tx.Exec(createMigrationsTableSQL)
	return err
}

// isMigrationApplied checks if a migration has already been applied
func isMigrationApplied(tx *sql.Tx, migrationName string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM schema_migrations WHERE migration_name = $1`
	err := tx.QueryRow(query, migrationName).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// recordMigration records a successful migration
func recordMigration(tx *sql.Tx, migrationName string) error {
	_, err := tx.Exec(`INSERT INTO schema_migrations (migration_name) VALUES ($1)`, migrationName)
	return err
}

// Table definitions
const (
	createUsersTable = `
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`

	createConversationsTable = `
		CREATE TABLE IF NOT EXISTS conversations (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			description TEXT,
			is_group BOOLEAN DEFAULT false,
			creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`

	createConversationMembersTable = `
		CREATE TABLE IF NOT EXISTS conversation_members (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			role VARCHAR(50) DEFAULT 'member',
			joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(conversation_id, user_id)
		);
	`

	createMessagesTable = `
		CREATE TABLE IF NOT EXISTS messages (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
			sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			type VARCHAR(50) DEFAULT 'text',
			status VARCHAR(50) DEFAULT 'sent',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`
)

var createIndexes = strings.Join([]string{
	"CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);",
	"CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);",
	"CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);",
	"CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);",
	"CREATE INDEX IF NOT EXISTS idx_conversations_creator_id ON conversations(creator_id);",
}, "\n")
