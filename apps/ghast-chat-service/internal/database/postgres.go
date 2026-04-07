package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func Connect(dsn string) (*sql.DB, error) {
	if dsn == "" {
		dsn = "user=postgres password=postgres dbname=ghast_chat host=localhost port=5432 sslmode=disable"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}
