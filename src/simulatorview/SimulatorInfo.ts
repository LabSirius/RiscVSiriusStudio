import {
  computePosition,
  flip,
  shift,
  offset,
  inline,
  autoPlacement,
  Placement,
} from "@floating-ui/dom";
import * as bootstrap from "bootstrap";
import { InstructionView } from "./InstructionView";

export class SimulatorInfo {
  /**
   * Event dispatched to update the state of the graphical elements.
   */
  private updateEvent: Event;
  /**
   * All the elements in the SVG that are relevant to the simulator.
   */
  private cpuElements: Map<string, Element>;
  /**
   * Track which elements are enabled or disabled
   */
  private cpuEnabled: Map<string, boolean>;
  /**
   * Values for the registers of the cpu.
   */
  private registers: string[];
  /**
   * Current instruction under simulation.
   */
  private instruction: any | undefined;
  /**
   * Result of the execution of the current instruction.
   */
  private result: any | undefined;

  private tooltip: HTMLElement;
  private logger: Function;
  private instView: InstructionView;

  public constructor(log: Function, instView: InstructionView) {
    this.logger = log;
    this.log("info", { simulatorInfo: "SimulatorInfo constructor" });

    this.updateEvent = new Event("SimulatorUpdate");
    this.cpuElements = new Map<string, Element>();
    this.cpuEnabled = new Map<string, boolean>();
    this.registers = new Array(32).fill(0);
    this.instView = instView;

    /**
     * These will be initialized as soon as the simulator starts its execution.
     */
    this.instruction = undefined;
    this.result = undefined;

    this.tooltip = document.getElementById("tooltip") as HTMLElement;

    this.log("info", "SimulatorInfo constructor finished");
  }

  public installTooltip(
    element: Element,
    place: Placement,
    text: string | Function,
    dependsOn?: string
  ) {
    const tooltip = this.tooltip;
    const logger = this.logger;
    const cpuData = this;

    function update({ clientX: x, clientY: y }) {
      // logger('info', { m: 'Update function called', x: x, y: y });
      /**
       * If the element has a g tag then it is probably an svg element from
       * draw.io. In that case we go deep in the hierarchy to position the tooltip
       * properly.
       */

      if (element.tagName === "g") {
        // could be an svg element from draw.io

        const elements = element.getElementsByTagName("rect");
        if (elements.length > 0) {
          element = elements[0];
        } else {
          // logger('info', { m: 'inside a group without rect' });
          const elements = element.querySelectorAll(
            "#main-svg div:not(:has(div))"
          );
          if (elements.length > 0) {
            element = elements[0];
          }
          element = {
            getBoundingClientRect() {
              return {
                width: 0,
                height: 0,
                x: x,
                y: y,
                top: y,
                left: x,
                right: x,
                bottom: y,
              };
            },
          };
        }
      }

      computePosition(
        {
          getBoundingClientRect() {
            return {
              width: 0,
              height: 0,
              x: x,
              y: y,
              top: y,
              left: x,
              right: x,
              bottom: y,
            };
          },
        }, tooltip, {
        placement: place,
        // middleware: [arrow({ element: arrowElement })]
        middleware: [offset(8), flip(), shift({ padding: 5 })],
      }).then(({ x, y, placement, middlewareData }) => {
        Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
      });

      tooltip.innerHTML = typeof text === "string" ? text : text();
      // if (typeof dependsOn !== "undefined") {
      //   if (cpuData.enabled(dependsOn)) {
      //   } else {

      //   }
      // } else {
      //   tooltip.innerHTML = "element disabled";
      // }
    }

    function showTooltip(evt: Event) {
      if (evt instanceof MouseEvent && (evt as MouseEvent).altKey) {
        return;
      }
      if (typeof dependsOn !== "undefined" && !cpuData.enabled(dependsOn)) {
        logger("info", { m: "tooltip depends on", k: dependsOn });
        return;
      }
      tooltip.style.display = "block";
      update(evt as MouseEvent);
    }

    function hideTooltip() {
      tooltip.style.display = "none";
    }

    const events: [keyof HTMLElementEventMap, (e: Event) => void][] = [
      ["mouseenter", showTooltip],
      ["mouseleave", hideTooltip],
      ["focus", showTooltip],
      ["blur", hideTooltip],
    ];
    events.forEach(([event, listener]) => {
      element.addEventListener(event, listener);
    });
  }
  public setInstruction(instruction: any, result: any) {
    this.instruction = instruction;
    this.result = result;
  }
  public update() {
    document.dispatchEvent(this.updateEvent);
  }
  /**
   * Registers a new element in the simulator.
   * @param name of the element to register
   * @param element the actual element
   */
  public registerSVGElement(name: string, element: Element) {
    this.cpuElements.set(name, element);
  }

  public getSVGElement(name: string) {
    const element = this.cpuElements.get(name);
    if (element !== undefined) {
      return element;
    } else {
      throw Error("Missing element " + name);
    }
  }

  public enable(element: string) {
    this.cpuEnabled.set(element, true);
  }

  public disable(element: string) {
    this.cpuEnabled.set(element, false);
  }

  public enabled(element: string): boolean {
    const state = this.cpuEnabled.get(element);
    if (state !== undefined) {
      return state;
    } else {
      throw Error("Missing element: " + element);
    }
  }

  private initializeSVGElement(name: string, initializer: Function) {
    const element = this.cpuElements.get(name);
    if (element !== undefined) {
      initializer(element, this);
    } else {
      throw Error("Initialization of a missing element: " + name);
    }
  }

  public initializeSVGElements(handlers: any) {
    this.log("info", {
      simulatorInfo: "initialization of SVG elements started",
    });

    const elements = document.querySelectorAll(
      // '#svg-simulator [data-cpuname]:not(:has([data-cpuname]))'
      "#main-svg [data-cpuname]:not(:has([data-cpuname]))"
    );

    elements.forEach((e) => {
      const name = e.getAttributeNS(null, "data-cpuname") as string;
      this.registerSVGElement(name, e);
      this.disable(name);
    });

    this.log("info", {
      simulatorInfo: "Read document for data-cpuname tags",
      found: elements.length,
    });

    this.cpuElements.forEach((element, name) => {
      if (name in handlers) {
        this.initializeSVGElement(name, handlers[name]);
      } else {
        //this.log('error', { message: 'Handler not found for ' + name });
      }
    });
    this.log("info", {
      simulatorInfo: "initialization of SVG elements finished",
    });
  }
  /**
   * Register a new value for a register in the simulator.
   * @param name of the register (using x-notation)
   * @param value to be assigned to the register
   */
  public updateRegister(name: string, value: string) {
    const index = parseInt(name.substring(1));
    this.log("info", {
      m: "Updating value",
      name: name,
      idx: index,
      val: value,
    });
    this.registers[index] = value;
  }

  public getRegisterValue(register: number) {
    return this.registers[register];
  }

  public getInfo() {
    return {
      cpuElements: Object.fromEntries(this.cpuElements),
      cpuElemStates: Object.fromEntries(this.cpuEnabled),
    };
  }

  public getInstruction() {
    return this.instruction;
  }

  public instructionType() {
    return this.instruction.type;
  }

  public instructionOpcode() {
    return this.instruction.opcode;
  }

  public instructionResult() {
    return this.result;
  }

  public setBinaryInstruction(fields?: string[]) {
    this.instView.setBin(fields);
  }

  public setAssemblerInstruction(html: string) {
    const instBin = document.getElementById("instruction-asm") as HTMLElement;
    instBin.innerHTML = html;
  }

  public log(kind: string, data: any) {
    this.logger(kind, data);
  }
}
