# RVM sample data

rvm-sample.json contains eight fictional shops across Irish counties for local development.
The full dataset is not redistributed with this repository.
To import your own full file, run from backend/ with `DB_PASSWORD` set, as in [CONTRIBUTING.md](../../CONTRIBUTING.md):

```sh
mvn spring-boot:run -Dspring-boot.run.arguments="--import-rvms=/absolute/path/to/1.json"
```
