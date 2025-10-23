# Andika - A note taking app

## Screenshots



![Screenshot](./src/screenshots/image.png)

You can access the app at
[Link](https://notes.fastduka.co.ke)
# Option 1: Run With Docker

## create a .env file

Prefill the values

```sh
NEXTAUTH_URL=localhost:8000
POSTGRES_URL="postgresql://postgres:yourpassword@postgres:5432/notes_app"
NEXTAUTH_SECRET=auth_secret
# Google OAuth
GOOGLE_CLIENT_ID=clientid
GOOGLE_CLIENT_SECRET=secret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=notes_app
POSTGRES_PORT=5432
```

to generate the google auth credentials [visit](https://console.cloud.google.com/auth/)

```sh
docker compose up --build -d

```

## migrate the database

in your terminal

```sh
docker exec -it notes-app-postgres-1 psql -U postgres -d notes_app


```

paste the sql inside database-schema.sql and hit enter

exit the sql command line with `\q` and exit the container shell with `exit`

# Option 2: Run With npm

Create a .env file and prefill the values

Install deps

```sh
npm install

```

Run the project

```sh
npm run dev
```
