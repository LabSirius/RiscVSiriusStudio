import { useOperation } from "@/context/OperationContext"
import ConvertSection from "./ConvertSection"
import Tables from "./Tables/Tables"
import SettingsSection from "./SettingsSection"
import FilterSection from "./FilterSection"

const MainSection = () => {
    const { operation } = useOperation()
  return (
    <>
    {operation === '' && <ConvertSection />}
    {(operation === 'uploadMemory' || operation === 'firstStep' || operation === 'step' ) && ( 
    <>
        <Tables />
        {operation === 'uploadMemory' && < SettingsSection/>}
        {operation === 'firstStep' && <FilterSection/>}
    </>)

    }
    </>
  )
}

export default MainSection