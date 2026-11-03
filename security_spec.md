# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **ID Hardening Invariant**: Every document ID (`{artworkId}`, `{settingId}`) must match `^[a-zA-Z0-9_\-]+$` and have length `<= 128`.
2. **Strict Schema & Shadow-Field Prohibition**:
   - `Artwork` documents in `/artworks/{artworkId}` must contain required keys (`id`, `catalogueNumber`, `title`, `categories`, `medium`, `year`, `description`, `technicalNotes`, `imageUrl`, `aspectRatio`, `isPlaceholder`, `replacementPathHint`, `createdAt`, `updatedAt`) and only allowed optional keys (`tamilTitle`, `companionImageUrl`, `companionLabel`).
   - `SiteSetting` documents in `/settings/{settingId}` must contain strictly `heroImageUrl`, `artistPortraitUrl`, `sculptureStudioUrl`, and `updatedAt`.
3. **Volumetric String & Array Bounds**:
   - Every string field has an explicit `.size() <= MAX` bound matching `firebase-blueprint.json`.
   - `categories` array must contain between 1 and 7 elements (`categories.size() >= 1 && categories.size() <= 7`) and verify `categories[0] is string && categories[0].size() <= 50`.
4. **Temporal Integrity**:
   - On `create`, `createdAt == request.time` and `updatedAt == request.time`.
   - On `update`, `createdAt == resource.data.createdAt` (immutable) and `updatedAt == request.time`.
5. **Public Gallery Read & Admin Write Governance**:
   - Public visitors can read portfolio artworks (`allow get, list: if resource.data.id is string && resource.data.id.size() <= 128;`) and site settings (`allow get: if isValidId(settingId);`).
   - Write operations require strict `isValidArtwork(incoming())` / `isValidSiteSetting(incoming())` validation.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Shadow Field Injection on Artwork Create**: Adding `"isAdmin": true` to `/artworks/art-1`. (Rejected by `hasOnly`).
2. **Oversized Title Resource Exhaustion**: Sending a 5,000-character `title` on `/artworks/art-1`. (Rejected by `title.size() <= 200`).
3. **Empty Categories Array**: Sending `categories: []` on `/artworks/art-1`. (Rejected by `categories.size() >= 1`).
4. **Unbounded Categories Array**: Sending 20 items in `categories`. (Rejected by `categories.size() <= 7`).
5. **Non-String Category Element**: Sending `categories: [12345]`. (Rejected by `categories[0] is string`).
6. **Invalid Aspect Ratio Enum**: Sending `aspectRatio: "diagonal"`. (Rejected by enum check `in ['portrait', 'square', 'landscape']`).
7. **Forged Client `createdAt` Timestamp on Create**: Sending a past or future timestamp instead of `request.time`. (Rejected by `incoming().createdAt == request.time`).
8. **Mutating Immutable `createdAt` on Update**: Attempting to alter `createdAt` during an artwork update. (Rejected by `incoming().createdAt == existing().createdAt`).
9. **ID Poisoning Attack**: Creating a document with path `/artworks/bad$id!@#`. (Rejected by `isValidId(artworkId)`).
10. **Path Mismatch Spoofing**: Creating `/artworks/art-1` where `data.id == "art-2"`. (Rejected by `incoming().id == artworkId`).
11. **Value Poisoning on Update**: Updating `title` to a boolean `true` on `/artworks/art-1`. (Rejected by `isValidArtwork(incoming())` wrapping the `update` block).
12. **Shadow Key on SiteSetting Update**: Updating `/settings/siteConfig` with an undeclared field `secretKey`. (Rejected by `affectedKeys().hasOnly(...)` and `isValidSiteSetting(incoming())`).
