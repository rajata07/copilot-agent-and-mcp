name: ArchitectureGuard
description: Enforces architectural rules for this project.
instructions: |
  - Ensure all backend business logic stays inside /backend/services.
  - Routes should never access the database directly.
  - Frontend API calls should live in /frontend/src/api/.
  - If rules are violated, warn me and propose a fix.
