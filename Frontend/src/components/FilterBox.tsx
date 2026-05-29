import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { categoryOptions } from "@/types/dishType";


const FilterBox = () => {

  const {updateSelectedFilters,selectedFilters,resetSelectedFilters} = useRestaurantStore()

  function updateFiltersHandler(option: string) {
    updateSelectedFilters(option)
  }

  return (
    <div className="md:max-h-full">
      <div className="flex justify-between items-center">
        <span className="font-medium  sm:text-lg ">Filter By cuisines</span>
        <Button variant="link" onClick={resetSelectedFilters} >Rest</Button>
      </div>

      <div className="mt-3 grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] lg:block max-h-[30vh]  overflow-y-scroll md:max-h-[80vh] my-scrollbar">
          {categoryOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2 my-1 md:my-2 lg:my-4">
              <Checkbox
                id={option}
                checked={selectedFilters.includes(option)}
                onCheckedChange={() => updateFiltersHandler(option)}
              ></Checkbox>
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FilterBox;
