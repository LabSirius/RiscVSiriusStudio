import {
  provideVSCodeDesignSystem,
  allComponents,
} from "@vscode/webview-ui-toolkit";

import {
  ColumnDefinition,
  Options,
  TabulatorFull as Tabulator,
} from "tabulator-tables";

import _ from "lodash-es";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  sendMessageToExtension({ command: "log-" + kind, obj: { object } });
}

function main() {
  let instTable = createInstructionTable();

  // Message dispatcher
  window.addEventListener("message", (event) => {
    dispatch(event, instTable);
  });
  hideInstructionView();
}

function dispatch(event: MessageEvent, table: InstTable) {
  const data = event.data;
  switch (data.operation) {
    case "showInstructionView":
      showInstructionView();
      break;
    case "hideInstructionView":
      hideInstructionView();
      break;
    case "reflectInstruction":
      reflectInstruction(data.instruction, table);
      break;
    default:
      throw new Error("Unknown operation " + data.operation);
  }
}

function hideInstructionView() {
  const table = document.getElementById("instruction") as HTMLElement;
  const cover = document.getElementById("instruction-cover") as HTMLElement;
  cover.style.display = "block";
  table.style.display = "none";
}

function showInstructionView() {
  const table = document.getElementById("instruction") as HTMLElement;
  const cover = document.getElementById("instruction-cover") as HTMLElement;
  cover.style.display = "none";
  table.style.display = "block";
}

type TypeInstructionValue = {
  opcode: string;
  rd: string;
  f3: string;
  rs1: string;
  rs2: string;
  f7: string;
};

function instTableColumnDefinition(instType: string): ColumnDefinition[] {
  const headerRange = (name: string, lb: number, ub: number): string => {
    const br = name === "" ? name : "<br>";
    return `${name}${br}<span style="float:left;font-size:0.7em">${ub}</span><span style="float:right;font-size:0.7em">${lb}</span>`;
  };
  const generalColumnSettings = {
    headerSort: false,
    headerHozAlign: "right",
    hozAlign: "right",
  };
  const opcode = _.assign(
    {
      title: headerRange("Opcode", 0, 6),
      field: "opcode",
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const rd = _.assign(
    {
      title:
        instType === "S"
          ? headerRange("IMM[4:0]", 7, 11)
          : instType === "B"
          ? headerRange("IMM[4:1|11]", 7, 11)
          : headerRange("RD", 7, 11),
      field: "rd",
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const f3 = _.assign(
    {
      title:
        instType === "U" || instType === "J"
          ? headerRange("", 12, 14)
          : headerRange("F3", 12, 14),
      field: "f3",
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const rs1 = _.assign(
    {
      title:
        instType === "U" || instType === "J"
          ? headerRange("", 15, 19)
          : headerRange("RS1", 15, 19),
      field: "rs1",
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const rs2 = _.assign(
    {
      title:
        instType === "U" || instType === "J" || instType === "I"
          ? headerRange("", 20, 24)
          : headerRange("RS2", 20, 24),
      field: "rs2",
    },
    generalColumnSettings
  ) as ColumnDefinition;

  const f7 = _.assign(
    {
      title:
        instType === "R"
          ? headerRange("F7", 25, 31)
          : instType === "S"
          ? headerRange("IMM[11:5]", 25, 31)
          : instType === "B"
          ? headerRange("IMM[12|10:5]", 25, 31)
          : headerRange("", 25, 31),
      field: "f7",
    },
    generalColumnSettings
  ) as ColumnDefinition;

  let columns = [] as ColumnDefinition[];
  switch (instType) {
    case "R":
    case "S":
    case "B":
      columns = [f7, rs2, rs1, f3, rd, opcode];
      break;
    case "I":
      columns = [
        { title: "IMM[11:0]", columns: [f7, rs2] },
        rs1,
        f3,
        rd,
        opcode,
      ];
      break;
    case "U":
      columns = [
        { title: "IMM[31:12]", columns: [f7, rs2, rs1, f3] },
        rd,
        opcode,
      ];
      break;
    case "J":
      columns = [
        { title: "IMM[20|10:1|11|19:12]", columns: [f7, rs2, rs1, f3] },
        rd,
        opcode,
      ];
      break;
  }
  return columns;
}

type InstTable = {
  table: Tabulator;
  handler: (name: string) => void;
};

function createInstructionTable(): InstTable {
  // Settings for all the tables
  const tableData = [] as Array<TypeInstructionValue>;
  const definitions = {
    R: instTableColumnDefinition("R"),
    I: instTableColumnDefinition("I"),
    S: instTableColumnDefinition("S"),
    B: instTableColumnDefinition("B"),
    U: instTableColumnDefinition("U"),
    J: instTableColumnDefinition("J"),
  };

  const columns = definitions.R;
  const generalSettings = {
    layout: "fitColumns",
    layoutColumnsOnNewData: true,
    data: tableData,
    reactiveData: true,
    columnHeaderVertAlign: "bottom",
    index: "opcode",
    columns: columns,
  } as Options;

  let table = new Tabulator("#instruction", generalSettings);
  tableData.push({
    f7: "0000000",
    rs2: "00000",
    rs1: "00000",
    f3: "000",
    rd: "00000",
    opcode: "0000000",
  });
  tableData.pop();

  const tableHandler = (instType: string) => {
    table.setColumns(definitions[instType]);
  };
  return { table: table, handler: tableHandler };
}

function reflectInstruction(instruction: any, instTable: InstTable) {
  const {
    type,
    encoding: { binEncoding },
  } = instruction;

  const pattern = (type as string).toLocaleUpperCase();
  instTable.handler(pattern);
  updateColumnValues(instTable, binEncoding);
  instTable.table.redraw(true);
}

function updateColumnValues(instTable: InstTable, binEncoding: string) {
  const regex =
    /^(?<f7>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<f3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/;
  const result = binEncoding.match(regex);

  if (result && "groups" in result) {
    const data = result.groups as TypeInstructionValue;
    instTable.table.clearData();
    instTable.table.addRow(data);
  }
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
