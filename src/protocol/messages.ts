/**
 * The one typed contract for extension→webview messages.
 *
 * This module is authored in `src/` and imported by *both* bundles: the
 * extension host (which constructs these messages) and the webview React client
 * (which consumes them). It is deliberately **runtime-light** — its only
 * engine references are `import type` re-exports of the datapath-view shapes,
 * which erase at compile time — so pulling it into the webview bundle drags in
 * no CPU code. See ADR-0005 and `.scratch/client-view-seam/spec.md`.
 *
 * The union is discriminated on the existing `operation` field (grilling Q4-B),
 * so no `kind` tag and no `from` source guard are introduced: the webview only
 * ever receives extension messages, so shape validation at the boundary
 * (`parseExtensionMessage`) subsumes the dropped guard's job.
 *
 * This is the *expand* step of the type migration (ticket 02): the contract is
 * added beside the existing untyped path. Consumers migrate onto it in later
 * tickets; nothing else changes yet.
 */

// The concrete datapath-view types (`MonocycleWires` / `PipelineStages`) are
// re-exported from the sibling `./datapath-view` barrel, not from here. Keeping
// this file free of any `../vcpu` import is deliberate: a type import would force
// tsc to type-check the whole engine graph wherever this module is imported —
// which would drag the CPU sources into the webview bundle's build. The boundary
// parser needs only the *envelope* shape, so `step`'s payload is typed opaquely
// here; the pane pins the concrete view once the CPU is selected at mount
// (ADR-0005). See `./datapath-view` for the concrete re-exports the panes use.

/**
 * The datapath render payload carried by a `step` message, as it crosses the
 * wire: an object in its existing serialized (bit-string) shape. It is
 * intentionally opaque at the boundary — the parser validates only that it is
 * present and an object; the mounted pane narrows it to its concrete
 * `MonocycleWires` / `PipelineStages` view (re-exported from `./datapath-view`),
 * so nothing is duck-typed here (ADR-0005).
 */
export type DatapathView = { readonly [field: string]: unknown };

/** One entry of the `uploadMemory.typesInstruction` array. */
export interface InstructionTypeInfo {
  type: string;
}

/**
 * The initial program/memory snapshot the host loads into the webview before
 * the first step. Modelled as the fields the host sends today; the parser
 * validates it is a present object, not its full interior.
 */
export interface UploadMemoryPayload {
  memory: unknown;
  program: unknown;
  directivesWritableSize: unknown;
  directivesReadOnlySize: unknown;
  addressLine: unknown;
  symbols: unknown;
  asmList: unknown;
}

/** Initial program/memory load. */
export interface UploadMemoryMessage {
  operation: "uploadMemory";
  payload: UploadMemoryPayload;
  typeSimulator: string;
  initialLine: number;
  isReset: boolean;
  typesInstruction: ReadonlyArray<InstructionTypeInfo>;
}

/** A single register write to reflect in the registers table. */
export interface SetRegisterMessage {
  operation: "setRegister";
  register: string;
  value: string;
}

/**
 * One clock advanced. The monocycle/text path additionally carries `newPc`,
 * `currentMonocycletInst` and `lineDecorationNumber`; the pipeline path posts
 * only `result`. Hence `result` is the single required field and the rest are
 * optional — the parser accepts both variants.
 */
export interface StepMessage {
  operation: "step";
  result: DatapathView;
  newPc?: number;
  currentMonocycletInst?: unknown;
  lineDecorationNumber?: number;
}

/** The program ended (optionally with an error description). */
export interface StopMessage {
  operation: "stop";
  descerror?: string;
}

/** The kind of view the host is driving (e.g. "graphic"/"monocycle"/"pipeline"). */
export interface SimulatorTypeMessage {
  operation: "simulatorType";
  simulatorType: string;
}

/** The full program source text. */
export interface TextProgramMessage {
  operation: "textProgram";
  textProgram: string;
}

/** A memory read to highlight in the data-memory table. */
export interface ReadMemoryMessage {
  operation: "readMemory";
  address: number;
  _length: number;
}

/** A memory write to reflect in the data-memory table. */
export interface WriteMemoryMessage {
  operation: "writeMemory";
  address: number;
  value: string;
  _length: number;
}

/** The user clicked a source line in the editor. */
export interface ClickInLineMessage {
  operation: "clickInLine";
  lineNumber: number;
}

/** The stored API key for the assistant panel. */
export interface SetApiKeyMessage {
  operation: "setApiKey";
  key: string;
}

/**
 * Every message the extension host sends to the webview today, discriminated on
 * `operation`. Adding a microarchitecture or a message means adding a member
 * here and a case in `parseExtensionMessage` — the compiler then forces every
 * consumer to handle it.
 */
export type ExtensionMessage =
  | UploadMemoryMessage
  | SetRegisterMessage
  | StepMessage
  | StopMessage
  | SimulatorTypeMessage
  | TextProgramMessage
  | ReadMemoryMessage
  | WriteMemoryMessage
  | ClickInLineMessage
  | SetApiKeyMessage;

// --- Reverse direction: webview → extension ---------------------------------
//
// The messages the webview posts back to the extension, discriminated on the
// existing `event` field (mirroring `ExtensionMessage`'s `operation`). Ticket 06
// types the reverse direction so a dropped or renamed field on an outbound edit
// is a compile error, not a silent runtime miss. Scope (spec story 19): the
// state-mutating messages — register edits, data-memory edits, and reset. Their
// payloads cross in the untyped table (`Tabulator`) shape they carry today, so
// they are held opaque here just as `payload`/`result` are on the inbound side;
// the contract this union pins is the *envelope* (event tag + required fields).

/** A register-table edit sent back to be applied to the running CPU. */
export interface RegisterEditMessage {
  event: "registersChanged";
  registers: unknown;
}

/** A data-memory-table edit sent back to be applied to the running CPU. */
export interface MemoryEditMessage {
  event: "memoryChanged";
  memory: unknown;
}

/** The user asked to reset the simulation. */
export interface ResetMessage {
  event: "reset";
}

/**
 * Every state-mutating message the webview posts back to the extension,
 * discriminated on `event`. Routed through the typed {@link sendWebviewMessage}
 * sender so a dropped/renamed field surfaces at compile time.
 */
export type WebviewMessage =
  | RegisterEditMessage
  | MemoryEditMessage
  | ResetMessage;

// --- Boundary parser ---------------------------------------------------------
//
// `parseExtensionMessage` is the single place an `unknown` from the postMessage
// boundary becomes a typed `ExtensionMessage`. It validates the *envelope* — the
// operation and each message's required top-level fields — and returns a fresh
// typed object, dropping foreign fields (such as the legacy `from`). Deep
// interior validation of `payload`/`result` is deliberately not done here: those
// shapes are pinned statically at the pane once the CPU is selected (ADR-0005).
//
// It never throws past the boundary: malformed, foreign, or dropped/renamed-field
// input yields `null` (rejected) rather than an exception.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Validate an optional field. Returns `[true, undefined]` when absent (skip it),
 * `[true, value]` when present and valid, and `[false, undefined]` when present
 * but the wrong type (reject the whole message). Centralises the absent /
 * invalid / valid contract the `step` and `stop` cases each need.
 */
function optional<T>(
  raw: Record<string, unknown>,
  key: string,
  guard: (value: unknown) => value is T
): [ok: boolean, value: T | undefined] {
  const value = raw[key];
  if (value === undefined) {
    return [true, undefined];
  }
  return guard(value) ? [true, value] : [false, undefined];
}

/**
 * Parse a raw postMessage value into a typed {@link ExtensionMessage}, or return
 * `null` if it is not a recognised, well-formed message. Pure and total: any
 * input is safe to pass, and nothing is thrown.
 */
export function parseExtensionMessage(raw: unknown): ExtensionMessage | null {
  if (!isObject(raw)) {
    return null;
  }
  const operation = raw["operation"];
  if (!isString(operation)) {
    return null;
  }

  switch (operation) {
    case "uploadMemory": {
      const payload = raw["payload"];
      const typeSimulator = raw["typeSimulator"];
      const initialLine = raw["initialLine"];
      const isReset = raw["isReset"];
      const typesInstruction = raw["typesInstruction"];
      if (
        !isObject(payload) ||
        !isString(typeSimulator) ||
        !isNumber(initialLine) ||
        !isBoolean(isReset) ||
        !Array.isArray(typesInstruction)
      ) {
        return null;
      }
      return {
        operation,
        payload: payload as unknown as UploadMemoryPayload,
        typeSimulator,
        initialLine,
        isReset,
        typesInstruction: typesInstruction as ReadonlyArray<InstructionTypeInfo>,
      };
    }

    case "setRegister": {
      const register = raw["register"];
      const value = raw["value"];
      if (!isString(register) || !isString(value)) {
        return null;
      }
      return { operation, register, value };
    }

    case "step": {
      const result = raw["result"];
      if (!isObject(result)) {
        return null;
      }
      const message: StepMessage = { operation, result };
      const [pcOk, newPc] = optional(raw, "newPc", isNumber);
      const [lineOk, lineDecorationNumber] = optional(raw, "lineDecorationNumber", isNumber);
      if (!pcOk || !lineOk) {
        return null;
      }
      if (newPc !== undefined) {
        message.newPc = newPc;
      }
      if (lineDecorationNumber !== undefined) {
        message.lineDecorationNumber = lineDecorationNumber;
      }
      if (raw["currentMonocycletInst"] !== undefined) {
        message.currentMonocycletInst = raw["currentMonocycletInst"];
      }
      return message;
    }

    case "stop": {
      const message: StopMessage = { operation };
      const [descOk, descerror] = optional(raw, "descerror", isString);
      if (!descOk) {
        return null;
      }
      if (descerror !== undefined) {
        message.descerror = descerror;
      }
      return message;
    }

    case "simulatorType": {
      const simulatorType = raw["simulatorType"];
      if (!isString(simulatorType)) {
        return null;
      }
      return { operation, simulatorType };
    }

    case "textProgram": {
      const textProgram = raw["textProgram"];
      if (!isString(textProgram)) {
        return null;
      }
      return { operation, textProgram };
    }

    case "readMemory": {
      const address = raw["address"];
      const length = raw["_length"];
      if (!isNumber(address) || !isNumber(length)) {
        return null;
      }
      return { operation, address, _length: length };
    }

    case "writeMemory": {
      const address = raw["address"];
      const value = raw["value"];
      const length = raw["_length"];
      if (!isNumber(address) || !isString(value) || !isNumber(length)) {
        return null;
      }
      return { operation, address, value, _length: length };
    }

    case "clickInLine": {
      const lineNumber = raw["lineNumber"];
      if (!isNumber(lineNumber)) {
        return null;
      }
      return { operation, lineNumber };
    }

    case "setApiKey": {
      const key = raw["key"];
      if (!isString(key)) {
        return null;
      }
      return { operation, key };
    }

    default:
      // Foreign / unknown operation.
      return null;
  }
}
