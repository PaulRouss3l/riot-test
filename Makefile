.PHONY: help
help: ## Show this help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## to run only once
	npm i
	cp .env.sample .env

.PHONY: start
start: ## run the script
	docker-compose up -d
	npm start

.PHONY: test
test: # stop the DB
	docker-compose up -d
	npm run test

.PHONY: stop
stop: # stop the DB
	docker-compose stop

.PHONY: reset
reset: ## reset the DB
	docker-compose down --volumes
	docker-compose up -d

.PHONY: generate-schema
generate-schema: ## write schema
	npm run schema:generate
