import {
  Card,

} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import ExampleImport from "./ExampleImport"
import ExampleShortcuts from "./ExampleShortcuts"

export function SettingsHelp() {
  return (

    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-md">Import data (.txt)</p>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Register Table</TabsTrigger>
          <TabsTrigger value="password">Memory table</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <ExampleImport caseValue="register"/>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <ExampleImport caseValue="memory"/>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold text-md">Shortcouts in tables</p>
        <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Register Table</TabsTrigger>
          <TabsTrigger value="password">Memory table</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <ExampleShortcuts caseValue="register"/>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <ExampleShortcuts caseValue="memory"/>
          </Card>
        </TabsContent>
      </Tabs>
      </div>


    </div>
  )
}

export default SettingsHelp
