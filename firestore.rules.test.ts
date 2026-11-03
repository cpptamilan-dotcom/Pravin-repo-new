/**
 * Firestore Security Rules Test Suite (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'create' | 'update';
  payload: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Artwork Create',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', title: 'Test', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Oversized Title Resource Exhaustion',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', title: 'A'.repeat(250) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Empty Categories Array',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', categories: [] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unbounded Categories Array',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', categories: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Non-String Category Element',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', categories: [12345] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Invalid Aspect Ratio Enum',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', aspectRatio: 'diagonal' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Client createdAt Timestamp on Create',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-1', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Mutating Immutable createdAt on Update',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'update',
    payload: { id: 'art-1', createdAt: '2029-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning Attack',
    collection: 'artworks',
    docId: 'bad$id!@#',
    operation: 'create',
    payload: { id: 'bad$id!@#' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Path Mismatch Spoofing',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'create',
    payload: { id: 'art-2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value Poisoning on Update',
    collection: 'artworks',
    docId: 'art-1',
    operation: 'update',
    payload: { title: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Shadow Key on SiteSetting Update',
    collection: 'settings',
    docId: 'siteConfig',
    operation: 'update',
    payload: { secretKey: 'hacked' },
    expectedResult: 'PERMISSION_DENIED',
  },
];
