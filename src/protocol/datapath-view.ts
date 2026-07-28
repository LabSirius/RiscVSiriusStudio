/**
 * The protocol module's single home for the concrete datapath-view types. The
 * client imports `MonocycleWires` / `PipelineStages` from here instead of
 * re-declaring the drifted hand-mirrors (`ResultState` / `PipelineCycleResult`)
 * it carries today (ADR-0005, spec Q2-A).
 *
 * This is kept separate from `./messages` on purpose. Re-exporting these types
 * makes tsc type-check the engine's CPU sources (`../vcpu/...`) wherever this
 * barrel is imported. The boundary parser and message envelopes in `./messages`
 * must stay free of that graph so they can be imported into the webview bundle
 * cheaply; only the panes — which genuinely need the concrete view shape — import
 * this barrel, and they do so from later tickets.
 *
 * These are pure type re-exports: `datapathView()` and its shapes are untouched
 * (spec Out of Scope); this file only gives them a stable protocol-side name.
 */
export type { MonocycleWires } from "../vcpu/singlecycle";
export type { PipelineStages } from "../vcpu/pipeline/pipeline";
