SHELL := /bin/bash
.DEFAULT_GOAL := help

DB_URL ?= postgresql://postgres:1111@localhost:5432/techstore

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS=":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install all workspace dependencies
	pnpm install

.PHONY: dev
dev: ## Run the full stack in watch mode (web + api + types)
	pnpm dev

.PHONY: build
build: ## Production build of every package/app
	pnpm build

.PHONY: lint
lint: ## Lint the monorepo
	pnpm lint

.PHONY: typecheck
typecheck: ## Typecheck the monorepo
	pnpm typecheck

.PHONY: migrate
migrate: ## Apply DB migrations (DB_URL overridable)
	cd packages/db && DATABASE_URL="$(DB_URL)" npx prisma migrate deploy

.PHONY: generate
generate: ## Regenerate the Prisma client
	cd packages/db && DATABASE_URL="$(DB_URL)" npx prisma generate

.PHONY: seed
seed: ## Seed the database (reads SEED_OWNER_* from .env)
	cd packages/db && DATABASE_URL="$(DB_URL)" NODE_ENV=development pnpm seed

.PHONY: seed-demo
seed-demo: ## Load the rich DEMO catalog + demo accounts (dev only)
	cd packages/db && DATABASE_URL="$(DB_URL)" NODE_ENV=development pnpm seed:demo

.PHONY: demo
demo: migrate seed-demo ## Migrate + load demo data, then run the dev stack
	NEXT_PUBLIC_DEV_MODE=true pnpm dev

.PHONY: studio
studio: ## Open Prisma Studio
	cd packages/db && DATABASE_URL="$(DB_URL)" npx prisma studio

.PHONY: up
up: ## Start dev infra (Postgres) via Docker
	docker compose up -d db --wait

.PHONY: down
down: ## Stop dev infra
	docker compose down

.PHONY: prod-build
prod-build: ## Build production Docker images
	docker compose -f docker-compose.prod.yml build

.PHONY: prod-up
prod-up: ## Start the production stack
	docker compose -f docker-compose.prod.yml up -d --wait
