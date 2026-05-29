import {  Minus, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"

type PaginationProps = {
    currentPage:number,
    totalPages:number,
    totalCount:number,
    limit?:number
    onClickFn:(page:number,limit:number)=>void
}

const Pagination = ({currentPage,totalPages,totalCount,limit=10,onClickFn}:PaginationProps) => {
  const [pageSize,setPageSize] = useState<number>(limit)

  function pageSizeHandler(value:number){
    setPageSize(Math.max(1,value)) 
  }

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalCount)

  useEffect(()=>{
    setPageSize(limit)
  },[limit])

return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
        <div className="flex items-center gap-1 border rounded">
          <Button 
            disabled={pageSize===1} 
            onClick={()=> pageSizeHandler(pageSize-1)} 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm min-w-[2ch] text-center">{pageSize}</span>
          <Button 
            disabled={pageSize>=totalCount} 
            onClick={()=> pageSizeHandler(pageSize+1)} 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {pageSize !== limit && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={()=> setPageSize(limit)}>Cancel</Button>
            <Button size="sm" onClick={()=> onClickFn(1,pageSize)}>Apply</Button>
          </div>
        )}
      </div>
      
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {start}–{end} of {totalCount}
      </span>
      
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          disabled={currentPage === 1}
          onClick={()=> onClickFn(currentPage-1, pageSize)}
        >
          Previous
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={()=> onClickFn(currentPage+1, pageSize)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Pagination