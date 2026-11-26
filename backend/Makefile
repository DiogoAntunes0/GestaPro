.PHONY: test build start down ci

IMAGE_NAME     := gestapro-backend:ci
CONTAINER_NAME := gestapro-api

test:
	./mvnw test

build:
	docker build -t $(IMAGE_NAME) .

start:
	docker run -d --name $(CONTAINER_NAME) -p 8080:8080 \
	  -e JWT_SECRET="$(JWT_SECRET)" \
	  -e DB_URL="$(DB_URL)" \
	  -e DB_USERNAME="$(DB_USERNAME)" \
	  -e DB_PASSWORD="$(DB_PASSWORD)" \
	  -e SPRING_PROFILES_ACTIVE="$(SPRING_PROFILES_ACTIVE)" \
	  $(IMAGE_NAME)

down:
	docker rm -f $(CONTAINER_NAME) 2>/dev/null || true

ci: test build start