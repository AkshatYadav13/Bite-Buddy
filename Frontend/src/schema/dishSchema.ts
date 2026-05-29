import {z} from 'zod'

export const dishSchema = z.object({
    name:z.string()
    .nonempty({message:'name is required'})
    .min(3,"Name must be of atleast 3 characters")
    .max(30,'Name is too long — please keep it under 30 characters'),
    description:z.string().nonempty({message:'description is required'})
    .min(30,"Kindly include a brief description of the menu item (at least one sentence).")
    .max(500,'Description is too long. Try summarizing it in 2–3 sentences.'),
    costPrice:z.number().min(0,{message:"Price can't be negative"}),
    image:z.instanceof(File).optional(),
    category:z.string().nonempty({message:"Category is required"}),
    isVeg: z.boolean(),
    tags: z.string().nonempty({message:"tags is required"})
})

export type DishInputState = z.infer<typeof dishSchema>

export type DishErrorsType = Partial<Record<keyof DishInputState, string>>;
