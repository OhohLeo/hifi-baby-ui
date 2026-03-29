#!/usr/bin/env bash
# Run quality checks and tests: ESLint, Knip, Vitest (Vue Test Utils).
# Optional: pass --all anywhere to also run Playwright E2E tests (./tests/*.spec.ts).
# Vitest receives every argument except --all, e.g. ./test.sh tests/unit/stores
set -euo pipefail
cd "$(dirname "$0")"

RUN_PLAYWRIGHT=false
VITEST_ARGS=()
for arg in "$@"; do
  if [[ "${arg}" == "--all" ]]; then
    RUN_PLAYWRIGHT=true
  else
    VITEST_ARGS+=("${arg}")
  fi
done

npm run lint:check
npm run knip
npx vitest run "${VITEST_ARGS[@]}"

if [[ "${RUN_PLAYWRIGHT}" == true ]]; then
  npx playwright test
fi
