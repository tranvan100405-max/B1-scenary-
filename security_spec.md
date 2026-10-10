# Security Specification

## Data Invariants
1. A user profile document `/users/{userId}` can only be read, created, and modified by the authenticated user whose `request.auth.uid == userId`.
2. Word progress records `/users/{userId}/wordProgress/{wordId}` belong exclusively to the parent user and can only be accessed or modified by `request.auth.uid == userId`.
3. Quiz history logs `/users/{userId}/quizHistory/{quizId}` belong exclusively to the parent user and can only be created and accessed by `request.auth.uid == userId`.

## Dirty Dozen Attack Scenarios
1. Unauthenticated reading of `/users/{userId}` -> PERMISSION_DENIED.
2. User A attempting to read User B's `/users/{userId}` -> PERMISSION_DENIED.
3. User A attempting to update User B's coin balance -> PERMISSION_DENIED.
4. User A attempting to overwrite User B's wardrobe -> PERMISSION_DENIED.
5. User A attempting to read User B's `/wordProgress` -> PERMISSION_DENIED.
6. User A attempting to inject word progress into User B's subcollection -> PERMISSION_DENIED.
7. User A attempting to delete User B's quiz history -> PERMISSION_DENIED.
8. Unauthenticated batch queries listing all users -> PERMISSION_DENIED.
9. Malicious document ID injection (> 128 characters) -> PERMISSION_DENIED.
10. Impersonation via forged UID payload -> PERMISSION_DENIED.
11. Reading root collection without auth -> PERMISSION_DENIED.
12. Arbitrary write to undesignated collections -> PERMISSION_DENIED.
