import { useEffect } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useSimulator } from "../context/shared/SimulatorContext";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";

const addSidebarHidingLogic = (step: DriveStep): DriveStep => {
  const originalOnHighlightStarted = step.onHighlightStarted;
  const originalOnDeselected = step.onDeselected;

  return {
    ...step,
    onHighlightStarted: (...args) => {
      document.querySelector("#sidebar")?.classList.add("hidden");
      originalOnHighlightStarted?.(...args);
    },
    onDeselected: (...args) => {
      document.querySelector("#sidebar")?.classList.remove("hidden");
      originalOnDeselected?.(...args);
    },
  };
};

export const useTutorial = () => {
  const { showTuto, setShowTuto, modeSimulator, operation, section, setSection } = useSimulator();

  const { setShowProgramTable } = useMemoryTable();

  const registerTableSteps = [
    {
      element: "#registerTable",
      popover: {
        title: "Register Table",
        description: "Here you can see how the values of the registers change in the simulation.",
      },
    },
    {
      element: "#registerTable .tabulator-row:nth-child(1)",
      popover: {
        title: "Watched Section",
        description: `Every time a register changes it will automatically go up to the watched section. <span style="color: #009688; font-style: italic;">(You can change this in settings.)</span>`,
      },
    },

    {
      element: '#registerTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field="name"]',
      popover: {
        title: "Toggle Section",
        description:
          "If you want to pin or unpin a register you can do so by clicking on the register name.",
      },
    },
    {
      element:
        '#registerTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field="viewType"]',
      popover: {
        title: "Modify Type",
        description: "You can change the data type in which you want to view the register.",
      },
    },
    {
      element:
        '#registerTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field="value"]',
      popover: {
        title: "Modify Type (Shortcut)",
        description: `You can change the type by hovering over the cell and clicking the corresponding type key.
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li><b>b:</b> binary</li>
          <li><b>h:</b> hexadecimal</li>
          <li><b>u/s:</b> signed/unsigned</li>
          <li><b>a:</b> ascii</li>
        </ul>`,
      },
    },
    {
      element:
        '#registerTable .tabulator-row:nth-child(5) .tabulator-cell[tabulator-field="value"]',
      popover: {
        title: "Modify Value",
        description: `Only in configuration mode you can modify the value of the registers <span style="color: #f44336;">(Not valid for x0)</span>.`,
      },
    },
    {
      element:
        '#registerTable .tabulator-row:nth-child(5) .tabulator-cell[tabulator-field="value"]',
      popover: {
        title: "Show diferent Type (Shortcut)",
        description: `You can view the display in other types <span style="color: #009688;">(while holding the key down) </span> with the same shortcuts with which you change the cell value type.`,
      },
    },
    {
      element: "#closeRT",
      popover: {
        title: "Hide Table",
        description: `You can hide the table and show it again.`,
      },
    },
  ];

  const memoryTablesSteps = [
    {
      element: "#memoryTables",
      popover: {
        title: "Memory tables",
        description:
          "We have two memory tables, one <span style='color: #009688; font-style: italic;'>(available memory and one program memory)</span>",
      },
    },
    {
      element: "#availableMemoryTable",
      popover: {
        title: "Available Memory Table",
        description:
          "This is the memory that changes during execution, the stack pointer is managed with the x2 register.",
      },
    },
    {
      element:
        "#availableMemoryTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field='value0']",
      popover: {
        title: "Edit value",
        description: "You can edit the binary value of any memory cell",
      },
    },
    {
      element:
        "#availableMemoryTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field='value0']",
      popover: {
        title: "Show diferent Type (Shortcut)",
        description: `You can change (while holding the key down) the type by hovering over the cell and clicking the corresponding type key.
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li><b>b:</b> binary</li>
          <li><b>h:</b> hexadecimal</li>
          <li><b>u/s:</b> signed/unsigned</li>
          <li><b>a:</b> ascii</li>
        </ul>`,
      },
    },
    {
      element: "#optionsAvailableMemoryTable",
      popover: {
        title: "Hide in available memory",
        description: "You can hide the binary section, or hide the entire table.",
      },
    },

    {
      element: "#programTable",
      popover: {
        title: "Program table",
        description: "This is the memory table of the program that is running",
      },
      onHighlightStarted: () => {
        setShowProgramTable(true);
      },
      onDeselected: () => {
        setShowProgramTable(false);
      },
    },

    {
      element: '#programTable .tabulator-row:last-child .tabulator-cell[tabulator-field="address"]',
      popover: {
        title: "Pc value",
        description:
          "While you are executing the instructions you will be able to monitor the PC <span style='color: #009688; font-style: italic;'>(icon)</span>",
      },
      onHighlightStarted: () => {
        setShowProgramTable(true);
      },
      onDeselected: () => {
        setShowProgramTable(false);
      },
    },
    {
      element: '#programTable .tabulator-row:last-child .tabulator-cell[tabulator-field="address"]',
      popover: {
        title: "See what instruction it is",
        description:
          "If you click on the cell, the corresponding instruction will be highlighted.<span style='color: #009688; font-style: italic;'>(in the code editor)</span>",
      },
      onHighlightStarted: () => {
        setShowProgramTable(true);
      },
      onDeselected: () => {
        setShowProgramTable(false);
      },
    },
    {
      element: '#programTable .tabulator-row:last-child .tabulator-cell[tabulator-field="address"]',
      popover: {
        title: "Click on jump instruction",
        description:
          "If you click on a cell corresponding to a jump instruction, you will see in this same table where it jumps to.",
      },
      onHighlightStarted: () => {
        setShowProgramTable(true);
      },
      onDeselected: () => {
        setShowProgramTable(false);
      },
    },
    {
      element: '#programTable .tabulator-row:last-child .tabulator-cell[tabulator-field="value3"]',
      popover: {
        title: "Show diferent Type (Shortcut)",
        description: `You can change (while holding the key down) the type by hovering over the cell and clicking the corresponding type key.
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li><b>b:</b> binary</li>
          <li><b>h:</b> hexadecimal</li>
          <li><b>u/s:</b> signed/unsigned</li>
          <li><b>a:</b> ascii</li>
        </ul>`,
      },
      onHighlightStarted: () => {
        setShowProgramTable(true);
      },
      onDeselected: () => {
        setShowProgramTable(false);
      },
    },
  ];

  const programInMonaco = [
    {
      element: "#monaco-editor",
      popover: {
        title: "Program ",
        description: "Here you can see the program you are running.",
      },
    },
    {
      element: ".driver-first-valid-line",
      popover: {
        title: "Instruction",
        description:
          'The instruction that was executed will be highlighted, and if you click on an instruction, it will be reflected in the program memory table.  <span style="color: #009688;">program memory table. </span>"',
      },
    },
  ];

  const settingsSection = [
    {
      element: "#settings-section",
      popover: {
        title: "Settings ",
        description: "In this section you can modify simulator settings.",
      },
    },

    {
      element: "#import-data",
      popover: {
        title: "Import data in tables",
        description: "Import data into log tables and available memory",
      },
    },

    {
      element: "#change-memory-size",
      popover: {
        title: "Change memory size",
        description: "You can change the size of the available memory table",
      },
    },

    {
      element: "#export-data",
      popover: {
        title: "Export data",
        description: "You can export data from tables",
      },
    },
    {
      element: "#custom-options",
      popover: {
        title: "Custom options",
        description: "During execution you can modify these options",
      },
    },
  ];

  const optionsSimulate = [
    {
      element: "#button-sidebar",
      popover: {
        title: "Sections",
        description:
          'If you hover over the icon, sections that you can visit will be displayed. <span style="color: #009688;">They change depending on whether you have already started the simulation or are still in the configuration stage. </span>',
      },
    },
    {
      element: "#simulate-auto",
      popover: {
        title: "Simulate automatically",
        description:
          'By clicking you can activate/deactivate the automatic simulation, and you can regulate the speed if you hold the hover."',
      },
    },
    {
      element: "#gemini-chat",
      popover: {
        title: "AI Chat",
        description:
          'You can ask the AI ​​questions about RISCV instructions and the simulator in general."',
      },
    },
  ];


  useEffect(() => {
    // Si el tour está activo y estamos en la sección incorrecta, la cambiamos.
    if (showTuto && operation === "uploadMemory" && section === "help") {
      console.log("Cambiando sección de 'help' a 'settings'...");
      setSection("settings");
    }
  }, [showTuto, operation, section, setSection]); // Vigila estos estados

  useEffect(() => {
    if (!showTuto) return;

    const programInMonacowsidebar = programInMonaco.map(addSidebarHidingLogic);
    const settingsSectionwsidebar = settingsSection.map(addSidebarHidingLogic);

    const allSteps = [
      ...registerTableSteps,
      ...memoryTablesSteps,
      ...(modeSimulator === "graphic" ? programInMonacowsidebar : []),
      ...settingsSectionwsidebar,
      ...optionsSimulate,
    ];

    const visibleSteps = allSteps.filter((step) => document.querySelector(step.element as string));

    if (visibleSteps.length === 0) {
      setShowTuto(false);
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.querySelector(".driver-overlay")) {
        setShowTuto(false);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true });

    const driverObj = driver({
      smoothScroll: true,
      showProgress: true,

      steps: visibleSteps,
    });

    driverObj.drive();
  }, [showTuto, setShowTuto, operation, section, modeSimulator, setShowProgramTable]);
};
