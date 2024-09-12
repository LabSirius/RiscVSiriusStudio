import {
  provideVSCodeDesignSystem,
  Button,
  allComponents,
} from "@vscode/webview-ui-toolkit";
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  Placement,
} from "@floating-ui/dom";
import { Modal } from "bootstrap";
import { elementToSVG, inlineResources } from "dom-to-svg";

import { jsPDF } from "jspdf";
import "svg2pdf.js";

import * as Handlers from "./handlers";
import { SimulatorInfo } from "./SimulatorInfo.js";
import { InstructionView } from "./InstructionView.js";
import { usedRegisters } from "../utilities/instructions.js";
import { SCCPUResult } from "../vcpu/singlecycle";

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  vscode.postMessage({ command: kind, object: object });
}

function main() {
  const instView = new InstructionView();
  const cpuData = new SimulatorInfo(log, instView);
  cpuData.initializeSVGElements(Handlers);

  const step = document.getElementById("step-execution") as Button;
  step.addEventListener("click", (e) => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "stepClicked",
    });
  });

  const inspect = document.getElementById("inspect-registers") as Button;
  inspect.addEventListener("click", (e) => {
    const registers = usedRegisters(cpuData.instructionType()) as string[];
    registers.forEach((reg) => {
      const register = cpuData.getInstruction()[reg].regeq;
      sendMessageToExtension({
        command: "event",
        from: "simulator",
        message: "watchRegister",
        register: register,
      });
    });
  });

  const exportSVG = document.getElementById("export-svg") as Button;
  exportSVG.addEventListener("click", (e) => {
    exportToSVG();
  });

  // Install message dispatcher
  window.addEventListener("message", (event) => {
    messageDispatch(event, cpuData, instView);
  });

  installListeners(cpuData);
  log("info", { simulatorView: "Initialization finished" });
}

function messageDispatch(
  event: MessageEvent,
  cpuData: SimulatorInfo,
  instView: InstructionView
) {
  const message = event.data;
  switch (message.operation) {
    case "setInstruction":
      setInstruction(message.instruction, message.result, cpuData, instView);
      break;
    case "updateRegister":
      log("info", "set register data");
      cpuData.updateRegister(message.name, message.value);
      break;
    case "simulationFinished":
      simulationFinished(cpuData);

      break;
    default:
      log("info", { message: "Message not recognized by webview" });
      throw Error("Message not recognized by webview" + message.operation);
  }
}

function simulationFinished(cpuData: SimulatorInfo) {
  const step = document.getElementById("step-execution") as Button;
  step.disabled = true;
  const modal = new Modal(document.getElementById("simulator-modal"), {
    backdrop: "static",
  });
  modal.show();
  cpuData.terminate();
}

function setInstruction(
  instruction: any,
  result: SCCPUResult,
  cpuData: SimulatorInfo,
  instView: InstructionView
) {
  cpuData.setInstruction(instruction, result);

  cpuData.setAssemblerInstruction(
    `<span class="instruction">${instruction.asm}</span>`
  );

  const inspect = document.getElementById("inspect-registers") as Button;
  inspect.disabled = false;

  instView.newInstruction(cpuData.getInstruction());

  // log('info', { m: 'Execution result', result });
  cpuData.update();
}

/**
 *
 * @param element to install the tooltip on
 * @param text function to compute the tooltip text
 */
function setTooltip(
  element: Element,
  place: Placement,
  text: string | Function
) {
  const tooltip = document.getElementById("tooltip") as HTMLElement;
  function update() {
    // const arrowElement = document.getElementById('arrow') as HTMLElement;
    // element.style.border = '2pt dashed red';

    /**
     * If the element has a g tag then it is probably an svg element from
     * draw.io. In that case we go deep in the hierarchy to position the tooltip
     * properly.
     */
    if (element.tagName === "g") {
      // could be an svg element from draw.io
      const elems = element.getElementsByTagName("rect");
      if (elems.length > 0) {
        element = elems[0];
      }
    }
    computePosition(element, tooltip, {
      placement: place,
      // middleware: [arrow({ element: arrowElement })]
      middleware: [flip(), shift({ padding: 5 })],
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
    });
    tooltip.innerHTML = typeof text === "string" ? text : text();
  }

  function showTooltip() {
    tooltip.style.display = "block";
    update();
  }
  function hideTooltip() {
    tooltip.style.display = "";
    (element as HTMLElement).style.border = "none";
  }

  const events: [keyof HTMLElementEventMap, () => void][] = [
    ["mouseenter", showTooltip],
    ["mouseleave", hideTooltip],
    ["focus", showTooltip],
    ["blur", hideTooltip],
  ];
  events.forEach(([event, listener]) => {
    element.addEventListener(event, listener);
  });
}
/**
 * Simulator initialization.
 *
 * The simulator will execute the instructions of a program once at the time. To
 * do that it follows a very simple approach:
 *
 * - The data memory is initialized along with the registers values. This is
 *   done before starting any simulation.
 * - The intermediate representation of the program (IR) is loaded referenced
 *   from the window object. This representation is an array of objects
 *   representing every instruction in the source program.
 * - While there are still instructions to execute:
 *    - The next instruction IR is stored in window.cpuData.instruction
 *    - A click event is sent to the (invisible) button in
 *      window.cpuData.buttonExecute.
 *    - Every element of the CPU (component, connection, signal) that is
 *      subscribed to that event will be executed changing its state
 *      accordingly.
 *
 * The stateful components of the cpu will retrieve and persist its data to
 * their respective objects:
 *  - The registers unit data is stored in cpuData.ruData
 *  - The data memory unit data is stored in cpuData.dmData
 *
 * The complete output from the parser is stored at: cpuData.parser
 */

/**
 * Fetches all the elements present in the SVG image with the tag "data-cpuName"
 * defined. Every element is stored in the cpuElements object inside the cpuData
 * object under the value of the attribute.
 */

function installListeners(cpuData: SimulatorInfo) {
  // Install some listeners
  /**
   * When the mouse is over the instruction memory then the instruction is
   * selected in the proram memory view.
   */
  cpuData.getSVGElement("IM").addEventListener("mouseenter", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "imMouseenter",
    });
  });

  cpuData.getSVGElement("IM").addEventListener("mouseleave", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "imMouseleave",
    });
  });
  /**
   * When the mouse is over the rs1 label in the registers unit then the
   * register is selected in the register view.
   */
  cpuData.getSVGElement("RUTEXTINRS1").addEventListener("mouseenter", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "rs1Mouseenter",
    });
  });
  cpuData.getSVGElement("RUTEXTINRS1").addEventListener("mouseleave", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "rs1Mouseleave",
    });
  });
  cpuData.getSVGElement("RUTEXTINRS2").addEventListener("mouseenter", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "rs2Mouseenter",
    });
  });
  cpuData.getSVGElement("RUTEXTINRS2").addEventListener("mouseleave", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "rs2Mouseleave",
    });
  });
  cpuData.getSVGElement("RUTEXTINRD").addEventListener("mouseenter", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "rdMouseenter",
    });
  });
  cpuData.getSVGElement("RUTEXTINRD").addEventListener("mouseleave", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "rdMouseleave",
    });
  });

  cpuData.getSVGElement("RUTEXTOUTRD1").addEventListener("mouseenter", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "val1Mouseenter",
    });
  });
  cpuData.getSVGElement("RUTEXTOUTRD1").addEventListener("mouseleave", () => {
    sendMessageToExtension({
      command: "event",
      from: "simulator",
      message: "val1Mouseleave",
    });
  });
}

function exportToSVG() {
  log("info", "downloading svg");
  const svgDOM = document.getElementById("main-svg") as HTMLElement;
  const svgDocument = elementToSVG(svgDOM);
  inlineResources(svgDocument.documentElement);
  const svgString = new XMLSerializer().serializeToString(svgDocument);
  const blob = new Blob([svgString], { type: "text/obj" });
  const a = document.createElement("a");

  a.download = "cpu.svg";
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/obj", a.download, a.href].join(":");
  a.click();
}
