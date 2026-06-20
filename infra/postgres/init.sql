-- Runs automatically the first time the postgres container's data volume is created.
-- Enables pgvector now so Week 4 (semantic matching) needs zero extra setup.
CREATE EXTENSION IF NOT EXISTS vector;
