import { useSimulator } from "./context/shared/SimulatorContext";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";
import MainSection from "@/components/panel/Sections/MainSection/MainSection";

import MonocycleCanva from "@/components/graphic/Canva/monocycle/MonoCycleCanva";
import PipelineCanva from "./components/graphic/Canva/pipeline/PipelineCanva";
import Providers from "./providers";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const App = () => {
  const { modeSimulator, typeSimulator, showTuto } = useSimulator();

  useEffect(() => {
    if (!showTuto) return;

    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#registerTable",
          popover: {
            title: "Register table",
            description:
              "Here you can see how the values of the registers change in the simulation.",
          },
        },

        {
          element: "#registerTable .tabulator-row:nth-child(1)",
          popover: {
            title: "Watched section",
            description: `Every time a register changes it will automatically go up to the watched section. <span style="color: #009688; font-style: italic;">(You can change this in settings.)</span>`,
          },
        },

        {
          element:
            '#registerTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field="name"]',
          popover: {
            title: "Toggle section",
            description:
              "If you want to pin or unpin a register you can do so by clicking on the register name.",
          },
        },
        {
          element:
            '#registerTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field="viewType"]',
          popover: {
            title: "Modify type",
            description: "You can change the data type in which you want to view the register.",
          },
        },

        {
          element:
            '#registerTable .tabulator-row:nth-child(2) .tabulator-cell[tabulator-field="value"]',
          popover: {
            title: "Modify type (Shortcut)",
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
            title: "Modify value",
            description: `Only in configuration mode you can modify the value of the registers <span style="color: #f44336;">(Not valid for x0)</span>.`,
          },
        },

        {
          element:
            '#registerTable .tabulator-row:nth-child(5) .tabulator-cell[tabulator-field="value"]',
          popover: {
            title: "Modify type (Shortcut)",
            description: `You can view the display in other types <span style="color: #009688;">(while holding the key down) </span> with the same shortcuts with which you change the cell value type.
           `,
          },
        },
         {
          element:
            '#closeRT',
          popover: {
            title: "Hide table",
            description: `You can hide the table and show it again.
           `,
          },
        },
      ],
    });

    driverObj.drive();
  }, [showTuto]);

  
  return (
    <Providers>
      <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
        {modeSimulator === "graphic" ? (
          <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh">
            {typeSimulator === "monocycle" ? <MonocycleCanva /> : <PipelineCanva />}
            <div className="relative">
              <MainSectionContainer />
            </div>
          </div>
        ) : (
          <div className="relative flex w-full h-screen overflow-hidden ">
            <MainSection />
          </div>
        )}
      </div>
    </Providers>
  );
};

export default App;
