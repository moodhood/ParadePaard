# ParadePaard

Short instructions for running the project locally.

## Start the backend

Open a terminal in the `microservice` folder:

```sh
cd microservice
docker compose up --build -d
```

This builds and starts the backend services in Docker.

## Start the frontend

Open another terminal in the `frontend` folder:

```sh
cd frontend
npm run dev
```

When Vite starts, open:

```text
http://localhost:5173
```

## Admin login

Use this admin account to log in:

```text
Username: sanne.admin
Password: ParadeAdmin123!
```

## Stop the backend

From the `microservice` folder:

```sh
docker compose down
```
