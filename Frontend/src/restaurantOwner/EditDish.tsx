import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDishStore } from "@/store/useDishStore";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DishErrorsType,
  DishInputState,
  dishSchema,
} from "@/schema/dishSchema";
import { Loader2 } from "lucide-react";
import { categoryOptions, DishType } from "@/types/dishType";
import { ImagePreviewBox } from "@/components/shared/utilityComponents";
import { hasDataChanged } from "@/lib/utils";

type Props = {
  selectedDish: DishType;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

const EditDish = ({ selectedDish, open, onOpenChange }: Props) => {
  const { loading, editDish } = useDishStore();
  const [customCategory, setCustomCategory] = useState<string>("");

  const [input, setInput] = useState<DishInputState>({
    name: "",
    description: "",
    image: undefined,
    costPrice: 0,
    category: "",
    isVeg: true,
    tags: "",
  });

  const [errors, setErrors] = useState<DishErrorsType>({});

  const imageRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    selectedDish?.imageUrl || null
  );

  const [isChanged, setIsChanged] = useState<boolean>(false);

  function changeInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function fileChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function clearInput() {
    setInput({
      name: "",
      description: "",
      costPrice: 0,
      category: "",
      isVeg: true,
      tags: "",
      image: undefined,
    });
    setCustomCategory("");
    setErrors({});
  }

  async function submitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = dishSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error?.formErrors?.fieldErrors;
      setErrors(fieldErrors as DishErrorsType);
      return;
    }
    if (!previewImage) {
      setErrors((prev) => ({ ...prev, image: "Image is Required" }));
      return;
    }

    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("costPrice", input.costPrice.toString());
    formData.append(
      "category",
      input.category === "Other" ? customCategory : input.category
    );
    formData.append("isVeg", input.isVeg.toString());
    formData.append(
      "tags",
      input.tags
        .split(",")
        .map((t) => t.trim())
        .join(",")
    );
    formData.append("image", input.image as File);

    await editDish(selectedDish._id!, formData);
    clearInput();
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open) {
      clearInput();
      return;
    }
    const isCustomCategory = !categoryOptions.includes(selectedDish?.category);
    setInput({
      name: selectedDish?.name || "",
      description: selectedDish?.description || "",
      image: undefined,
      costPrice: selectedDish?.costPrice || 0,
      isVeg: selectedDish?.isVeg!,
      tags: (selectedDish?.tags && selectedDish?.tags.join(",")) || "",
      category: isCustomCategory ? "Other" : selectedDish?.category,
    });
    setCustomCategory(isCustomCategory ? selectedDish?.category : "");
    setPreviewImage(selectedDish?.imageUrl || null);
    
  }, [selectedDish?._id, open]);

  useEffect(() => {
    const result = hasDataChanged(input, selectedDish, "image");
    setIsChanged(result);
  }, [input]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto my-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Dish</DialogTitle>
          <DialogDescription>
            Create a dish that will make your restaurant standout
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler} className="mt-5 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Enter dish name"
                value={input?.name}
                onChange={changeInputHandler}
                required
              />
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                placeholder="Enter dish description"
                value={input.description}
                onChange={changeInputHandler}
                required
              />
              {errors.description && (
                <span className="text-xs text-red-500">
                  {errors.description}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Price in (&#8377; Rupees)</Label>
              <Input
                type="number"
                name="costPrice"
                value={input.costPrice}
                onChange={changeInputHandler}
                min={0}
                placeholder="0"
                required
              />
              {errors.costPrice && (
                <span className="text-xs text-red-500">{errors.costPrice}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={input?.category}
                onValueChange={(newVal) =>
                  setInput((prev) => ({ ...prev, category: newVal }))
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {[...categoryOptions, "Other"].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "MainCourse" ? "Main Course" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <span className="text-xs text-red-500">{errors.category}</span>
              )}

              {input.category === "Other" && (
                <Input
                  placeholder="Please specify "
                  id="custom-category"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  name="tags"
                  placeholder="Add tags (e.g., Spicy, North Indian)"
                  value={input.tags}
                  onChange={changeInputHandler}
                  className="flex-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="flex items-center space-x-4">
                <Label htmlFor="isVeg">Vegetarian Dish</Label>
                <Switch
                  id="isVeg"
                  checked={input.isVeg}
                  onCheckedChange={(checked) =>
                    setInput((prev) => ({ ...prev, isVeg: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="my-8">
            <Label className="mb-3">Upload dish image</Label>
            <ImagePreviewBox
              imageRef={imageRef}
              previewImage={previewImage}
              fallbackImage={selectedDish?.imageUrl}
              className="sm:w-[70%] h-60!"
            ></ImagePreviewBox>
            <Input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              ref={imageRef}
              onChange={fileChangeHandler}
            />
            {errors.image && (
              <span className="text-xs text-red-500">{errors.image}</span>
            )}
          </div>

          <div className="mt-4">
            {loading.editDishBtn ? (
              <Button className="my-gradient-btn w-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Please wait</span>
              </Button>
            ) : (
              <Button
                disabled={!isChanged}
                type="submit"
                className="my-gradient-btn w-full"
              >
                {isChanged ? "Save Changes" : "No Changes Detected"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDish;
