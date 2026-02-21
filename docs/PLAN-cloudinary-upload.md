# PLAN: Cloudinary Image Upload Integration

Integration of Cloudinary for image storage and optimization, replacing the current local file system storage in the Cafe POS system.

## Overview
Currently, the system saves uploaded images to the `public/uploads` directory. This plan outlines the steps to migrate this to Cloudinary, leveraging its powerful image optimization and CDN capabilities.

## Success Criteria
- [ ] Images are successfully uploaded to Cloudinary instead of local storage.
- [ ] API returns Cloudinary secure URLs.
- [ ] Images are automatically optimized (delivery in modern formats like WebP/AVIF, quality adjustment).
- [ ] Environment variables are correctly configured and validated.
- [ ] Error handling for Cloudinary API failures.

## Tech Stack
- **Cloudinary SDK**: `cloudinary` (Node.js SDK)
- **Environment Management**: `.env`
- **Backend**: Next.js App Router (existing)

## File Structure Changes
- `lib/cloudinary.ts`: (New) Utility for Cloudinary configuration and helper functions.
- `app/api/upload/route.ts`: (Modify) Update to use Cloudinary SDK instead of `fs/promises`.
- `.env`: (Modify) Add Cloudinary credentials.

## Task Breakdown

### Phase 1: Foundation & Setup
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT→OUTPUT→VERIFY |
|---------|------|-------|--------|----------|--------------|----------------------|
| Setup-1 | Install Dependencies | `backend-specialist` | `clean-code` | P0 | None | `npm install cloudinary` -> `package.json` updated -> Verify `cloudinary` in `node_modules`. |
| Setup-2 | Env Configuration | `backend-specialist` | `clean-code` | P0 | None | Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to `.env` -> `.env` updated -> Verify keys are present. |
| Setup-3 | Cloudinary Utility | `backend-specialist` | `clean-code` | P1 | Setup-1, Setup-2 | Create `lib/cloudinary.ts` with config initialization -> `lib/cloudinary.ts` created -> Verify config export. |

### Phase 2: Implementation
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT→OUTPUT→VERIFY |
|---------|------|-------|--------|----------|--------------|----------------------|
| Impl-1 | Refactor Upload API | `backend-specialist` | `clean-code` | P0 | Setup-3 | Replace `fs` logic in `app/api/upload/route.ts` with `cloudinary.uploader.upload_stream` -> `route.ts` updated -> Verify no `fs` imports for uploads. |
| Impl-2 | Implement Optimization | `backend-specialist` | `frontend-design` | P1 | Impl-1 | Apply `auto` format and `auto` quality transformations in the upload call -> `route.ts` updated -> Verify Cloudinary URL contains optimization params if applicable or set via upload preset. |

### Phase 3: Cleanup & Verification
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT→OUTPUT→VERIFY |
|---------|------|-------|--------|----------|--------------|----------------------|
| Verify-1 | Integration Test | `test-engineer` | `webapp-testing` | P0 | Impl-2 | Test upload via UI or Postman -> Multi-part form-data -> SUCCESS with Cloudinary URL. |
| Cleanup-1| Remove Local Uploads | `backend-specialist` | `clean-code` | P2 | Verify-1 | (Optional) Clean up `public/uploads` if no longer needed -> Files deleted -> Verify folder is empty. |

## Phase X: Final Verification
- [ ] Run `npm run lint`
- [ ] Run `python .agent/scripts/verify_all.py .`
- [ ] Manual test: Upload a large image and check the returned URL/size.

## ✅ PHASE X COMPLETE
- Lint: [ ]
- Security: [ ]
- Build: [ ]
- Date: [Current Date]
