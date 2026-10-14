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
- `frontend/`: `npm ci && npm run typecheck && npm test`. The `typecheck` script runs `tsc --noEmit`, and `npm test` runs Jest with the `jest-expo` preset. For web changes, also run `npm run build:web` locally; that build fetches the machine list from the live API to generate the city pages. Set `API_URL` to use another backend.
- `admin-panel/`: `npm ci && npm run lint && npm run build`.

## Local development

You need Docker, JDK 21, Maven and Node.js. Clean compilation and all 13 tests passed locally with Microsoft JDK 21.0.6, Temurin JDK 24 and Homebrew JDK 25.0.2. Set `JAVA_HOME` explicitly and check `mvn -v` to confirm which JDK Maven uses.

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

From `admin-panel/`, run `npm ci` and create `.env.local` containing `NEXT_PUBLIC_API_URL=http://localhost:8080`. Then run `npm run dev`, open `http://localhost:3000` and log in with the admin account above.

## Running your own instance

To run the project for another city or country, fork it and change the values below.

In `frontend/app.config.ts`, set `owner` to your Expo account, choose your own `slug` and `scheme`, and put your Expo project's ID in `updates.url` and `extra.eas.projectId`. Give the apps their own `ios.bundleIdentifier` and `android.package`. `userInterfaceStyle` can stay. The name "Is It Full?" and the icons are not covered by the MIT license, so change `name` and the images in `frontend/assets/` as well.

Register the new bundle ID and package as iOS and Android apps in your Firebase project, then fill in the two config files from the example files, as [Frontend](#frontend) describes.

`frontend/eas.json` holds the `development`, `preview` and `production` build profiles. Its submit profiles read the Google Play service account key from `frontend/eas-submit-key.json`, which git ignores. The `preview` and `production` profiles also set `EXPO_PUBLIC_API_URL`, `SENTRY_ORG` and `SENTRY_PROJECT`. Point the API URL at your backend there and in `frontend/.env.example`.

On the backend, set `CORS_ALLOWED_ORIGINS` to the origins of your web app. [deploy/README.md](deploy/README.md) lists the other required environment variables and the server setup. The API's domain is set in `deploy/Caddyfile`.

`.github/workflows/deploy-backend.yml` needs the repository secrets listed in [deploy/README.md](deploy/README.md#step-2-github-actions----build-and-deploy-the-image). Its job runs only when `github.repository_owner` is `likun-fang`. Change that to your own account or organisation, or the deploy never runs in your fork.

The machine dataset is not part of the repository. [backend/data/README.md](backend/data/README.md) explains how to import one.

Some of the code assumes Ireland. The daily machine sync reads Re-turn's feed (`backend/src/main/java/com/ecoreturn/client/ReturnApiClient.java`). Address search is limited to Ireland in `LocationIqClient.java` and `GoogleGeocodingClient.java` in the same folder. The map opens on Dublin (`MAP_INITIAL_REGION` in `frontend/src/constants/config.ts`). `isitfull.ie` appears in the web build scripts in `frontend/scripts/` and in several screens in `frontend/src/screens/`.
