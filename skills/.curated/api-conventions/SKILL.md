---
name: api-conventions
description: Apply YourOrg's REST API design standards when designing, reviewing, or implementing HTTP endpoints — naming, versioning, error shapes, pagination, and auth.
metadata:
  owner: platform-team
  category: standard
---

# YourOrg API Conventions

Use this skill whenever you are designing a new endpoint, reviewing an API PR, or
generating client/server code that exposes or consumes HTTP APIs at YourOrg.

## When to Use

- A new REST endpoint is being added or changed.
- Reviewing a PR that touches routes, controllers, or API schemas.
- Generating an OpenAPI spec or client SDK.

## Standards

### Resource naming
- Use plural, lowercase, hyphenated nouns: `/user-profiles`, not `/getUserProfile`.
- Nest no more than one level deep: `/orders/{id}/items` is fine; deeper is a smell.

### Versioning
- Version in the path: `/v1/...`. Never break a published version; add `/v2`.

### Error shape
All non-2xx responses use this body:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Human-readable summary.",
    "details": []
  }
}
```

`code` is a stable SCREAMING_SNAKE_CASE enum; `message` is for humans, never parsed.

### Pagination
- Cursor-based by default: `?limit=` + `?cursor=`. Return `next_cursor` (null at end).
- Never expose raw DB offsets.

### Auth
- Bearer tokens in `Authorization`. Never accept credentials in query strings.

## Review Checklist

1. Names follow the resource-naming rule.
2. Path is versioned.
3. Errors use the standard shape and a documented `code`.
4. List endpoints paginate with cursors.
5. No secrets in URLs or logs.
