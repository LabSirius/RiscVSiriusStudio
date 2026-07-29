# 01 — Client Vitest harness

**What to build:** the React client (`client/simulator/`) can run unit tests. Today
it has no test tooling; the extension host does. A developer can run the client's
test command and see a trivial test pass, and every later client ticket has a place
to put its tests. No runtime behavior of the simulator changes.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] The client has its own Vitest configuration, mirroring the root `vitest.config.ts` conventions.
- [x] A test command exists for the client and runs green in CI/local.
- [x] One trivial placeholder test passes, proving the harness works.
- [x] No change to any simulator behavior, diagram, or table.
