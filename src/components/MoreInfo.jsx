import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

const MoreInfo = ({ showMoreInfo, setShowMoreInfo }) => {
  return (
    <Collapsible open={showMoreInfo} onOpenChange={setShowMoreInfo} className="w-full mt-4">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-300 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-colors duration-200"
        >
          <span>{showMoreInfo ? "Show Less" : "More Info"}</span>
          {showMoreInfo ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="p-4 rounded-md bg-gray-100 border border-gray-300 text-gray-700 shadow-sm">
          <p className="text-sm">
            If you already updated the info.yml, wait 5 minutes and try again. This is due to GitHub cache.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default MoreInfo
