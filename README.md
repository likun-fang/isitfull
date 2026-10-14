# Is It Full?

Is It Full? ([isitfull.ie](https://isitfull.ie)) helps people in Ireland find Re-turn reverse vending machines, the machines that take back bottles and cans under the Deposit Return Scheme. People who visit a machine report whether it is available, busy or broken, and the app shows each machine's latest status on a map. It is an independent community project, not affiliated with Re-turn or the scheme's operator.

## Parts

| Folder | What it is |
| --- | --- |
| `backend/` | Spring Boot API that stores machines, status reports and users |
| `frontend/` | Expo app for iOS, Android and web |
| `admin-panel/` | Next.js panel for managing machines, reports, issues and users |

## Architecture

The backend keeps its data in PostgreSQL with PostGIS, which finds the machines near a location. Redis caches machine status and holds the rate limits. The schema is one SQL file, `backend/src/main/resources/db/init.sql`, applied by hand to a new database. The apps sign users in with Google or Apple through Firebase Authentication, and the backend checks the Firebase token and issues its own tokens; guests can use the app without an account. Search uses Google Geocoding for Eircodes and LocationIQ for addresses. A daily job refreshes the machine list from re-turn.ie. [deploy/README.md](deploy/README.md) describes the production setup.

## Getting started

[CONTRIBUTING.md](CONTRIBUTING.md) explains how to run each part locally and which checks to run.

To run it for another city or country, see [Running your own instance](CONTRIBUTING.md#running-your-own-instance).

## License

MIT. See [LICENSE](LICENSE). The name "Is It Full?", the logo and the app icons are not covered by the MIT license; the retailer logos under `frontend/assets/brands/` belong to their respective owners.
