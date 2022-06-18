# Usher Graph Service

Includes:
1. `ingest` function that runs on a recurring basis
2. `backup` function that creates backups of the graph database


## Unit Testing

The package, including unit tests, avoid importing `@glaze` or `ceramic` related packages as they're built with `{ "module": "esnext" }`, and this causes a great deal of pain to execute in a Node environment.
