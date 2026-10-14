# Contributing

## Layout

| Path | Contents |
| --- | --- |
| `backend/` | Spring Boot API (Java 21, Maven) |
| `backend/src/main/resources/db/init.sql` | Database schema and the first admin account |
| `backend/data/` | Sample machines for local development |
| `frontend/` | Expo app for iOS, Android and web |
| `admin-panel/` | Next.js admin panel |
| `docker-compose.yml` | PostgreSQL and Redis for local development, plus an optional `backend` service |
| `deploy/` | Production Compose file, Caddy config, backup script and the [deployment guide](deploy/README.md) |
| `.github/workflows/` | Checks changed components on pull requests and `main`, and deploys backend changes on `main` |

## Branches

Name branches `<type>/<short-name>` with a type from the list below, e.g. `fix/web-enter-key-search`.

## Commits and pull request titles

Use Conventional Commits: `<type>: <description>`, e.g. `fix: add Enter key search and Get Directions button on web`. The types are `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf` and `ci`.

## Pull requests

- Open pull requests against `main` and fill in the template.
- Keep each pull request to one topic, small enough to review in one sitting.
- The checks below must pass for every part you changed.

## Checks

[checks.yml](.github/workflows/checks.yml) runs on every pull request and push to `main`. Each component runs when its folder changes; changes to the workflow run all three. Superseded runs are cancelled.

- `backend/`: `mvn verify`. The tests use an in-memory database and need no Docker.
- `frontend/`: `npm ci && npm run typecheck`. The `typecheck` script runs `tsc --noEmit`. For web changes, also run `npm run build:web` locally; that build fetches the machine list from the live API to generate the city pages. Set `API_URL` to use another backend.
- `admin-panel/`: `npm ci --legacy-peer-deps && npm run lint && npm run build`. `react-leaflet` 4 declares React 18 while the panel uses React 19, so a plain `npm ci` fails.

## Local development

You need Docker, JDK 21, Maven and Node.js. Newer JDKs up to 24 also work.

### Database and Redis

Copy `.env.example` to `.env` and choose a database password. Keep `DB_USERNAME=postgres`; the commands below assume it. Start PostgreSQL (with PostGIS) and Redis, then create the schema:

```sh
docker compose up -d db redis
docker compose exec -T db psql -U postgres -d eco_return < backend/src/main/resources/db/init.sql
```

Run the second command once, on a new database. It also creates the admin account `admin` with the password `changeme123`. To start again from an empty database, run `docker compose down -v`, which deletes all local data.

### Backend

The backend does not read `.env`, so pass it the same password. From `backend/`:

```sh
DB_PASSWORD=<password from .env> mvn spring-boot:run
```

The API listens on `http://localhost:8080`, with API docs at `http://localhost:8080/swagger-ui.html`. On an empty database it imports the sample machines in `backend/data/rvm-sample.json`. To start from a full dataset instead, set `RVM_SEED_FILE` to its path before the first start. [backend/data/README.md](backend/data/README.md) explains how to import into a database that already has machines.

The other settings are environment variables, listed in `backend/src/main/resources/application.yml`. You can also set them in `backend/src/main/resources/application-local.yml`, which git ignores. Google and Apple sign-in need `FIREBASE_SERVICE_ACCOUNT`, the path to a Firebase service account key; without it only guest sign-in works. Address search needs `LOCATIONIQ_API_KEY` and `GOOGLE_GEOCODING_API_KEY`.

### Frontend

From `frontend/`, run `npm ci`, copy `.env.example` to `.env` and fill in your own keys. The example points `EXPO_PUBLIC_API_URL` at production; set it to `http://localhost:8080/api/v1` to use your local backend, or to your computer's network address when testing on a phone. Copy `google-services.example.json` to `google-services.json` and `GoogleService-Info.example.plist` to `GoogleService-Info.plist`, then fill them in from your Firebase project.

Run `npx expo start` and press `w` to open the web app. The iOS and Android apps use native modules that Expo Go does not include, so build a development app once with `npm run ios` or `npm run android` (this needs Xcode or Android Studio). After that, `npx expo start` serves your changes to it. Native builds need Firebase apps registered for the iOS bundle ID and Android package `ie.isitfull.mobile`, or changed identifiers in `frontend/app.config.ts`.

### Admin panel

From `admin-panel/`, run `npm ci --legacy-peer-deps` and create `.env.local` containing `NEXT_PUBLIC_API_URL=http://localhost:8080`. Then run `npm run dev`, open `http://localhost:3000` and log in with the admin account above.
