import { describe, it, expect } from "vitest";
import {
  buildRegisterRows,
  resetRegisterRows,
  setRowValue,
  setRowWatched,
  setRowViewType,
  rowsToValues,
  pad32,
} from "./registerRows";

const ZERO = "0".repeat(32);
const values = () => Array.from({ length: 32 }, (_, i) => i.toString(2).padStart(32, "0"));

describe("buildRegisterRows", () => {
  it("builds 32 rows with rawName = xN prefix, hex default, unwatched", () => {
    const rows = buildRegisterRows(values());
    expect(rows).toHaveLength(32);
    expect(rows[0].rawName).toBe("x0");
    expect(rows[0].name).toBe("x0 zero");
    expect(rows[2].rawName).toBe("x2");
    expect(rows.every((r) => r.viewType === 16 && r.watched === false)).toBe(true);
    expect(rows[5].value).toBe((5).toString(2).padStart(32, "0"));
  });

  it("falls back to a zero word when a value is missing", () => {
    const rows = buildRegisterRows([]);
    expect(rows[0].value).toBe(ZERO);
  });
});

describe("resetRegisterRows", () => {
  it("returns 32 zeroed, unwatched, hex rows", () => {
    const rows = resetRegisterRows();
    expect(rows).toHaveLength(32);
    expect(rows.every((r) => r.value === ZERO && !r.watched && r.viewType === 16)).toBe(true);
  });
});

describe("pad32 / setRowValue", () => {
  it("pads a short value to 32 bits", () => {
    expect(pad32("101")).toBe("101".padStart(32, "0"));
    expect(pad32(ZERO).length).toBe(32);
  });

  it("sets a value by id and pads it, without mutating the input", () => {
    const rows = resetRegisterRows();
    const next = setRowValue(rows, 3, "1111");
    expect(next[3].value).toBe("1111".padStart(32, "0"));
    expect(rows[3].value).toBe(ZERO); // input untouched
    expect(next[4].value).toBe(ZERO); // others untouched
  });
});

describe("setRowWatched / setRowViewType", () => {
  it("toggles watched only on the matching rawName", () => {
    const rows = setRowWatched(resetRegisterRows(), "x5", true);
    expect(rows.find((r) => r.rawName === "x5")?.watched).toBe(true);
    expect(rows.filter((r) => r.watched)).toHaveLength(1);
  });

  it("sets viewType only on the matching rawName", () => {
    const rows = setRowViewType(resetRegisterRows(), "x7", "signed");
    expect(rows.find((r) => r.rawName === "x7")?.viewType).toBe("signed");
    expect(rows.find((r) => r.rawName === "x6")?.viewType).toBe(16);
  });
});

describe("rowsToValues", () => {
  it("projects row values back to a flat 32-entry array by id", () => {
    const rows = setRowValue(resetRegisterRows(), 10, "1");
    const out = rowsToValues(rows);
    expect(out).toHaveLength(32);
    expect(out[10]).toBe("1".padStart(32, "0"));
    expect(out[0]).toBe(ZERO);
  });
});
