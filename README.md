# Mezmo Docs

This is the repository that backs Mezmo's documentation site, docs.mezmo.com

If you have a suggested change to our documentation, please create an issue or draft a PR.

## Hidden Pages

To keep a page out of search embeddings, add `hidden: true` to its frontmatter:

```yaml
---
title: "My Page"
hidden: true
---
```

## Knowledge Base Sync

On every merge to `main`, a Jenkins pipeline (see `Jenkinsfile`) embeds the
docs into a Qdrant knowledge base and pushes a snapshot to S3:

1. Starts Qdrant and [qdrant-manager](https://github.com/answerbook/qdrant-manager)
   containers (`docker-compose.yml`).
2. Restores the latest `kb-*` snapshot from S3 into a fresh timestamped
   collection.
3. Runs `sync status` / `sync diff` / `sync apply` to incrementally embed
   added, modified, and deleted pages (all `.mdx`/`.md` files in the repo;
   pages with `hidden: true` and files without frontmatter are skipped).
4. Runs a RAG evaluation against the updated collection.
5. On `main` only, snapshots the collection back to S3.

PR branches run the same pipeline against a throwaway local collection but
never publish a snapshot.

## Local Testing
Mintlify offers a CLI that can be used to preview locally. To install globally:

```bash
npm i -g mint
```

To run the local application on the default port:
```bash
mint dev
```

This starts a local server at: http://localhost:3000 which will hot reload while you're making changes.

To use a custom port:
```bash
mint dev --port 3333
```