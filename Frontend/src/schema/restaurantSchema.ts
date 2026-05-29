import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const statusOptions = ["Open", "Closed", "Busy"] as const;
export const foodTypeOptions = ["Pure_Veg", "Non_Veg", "Both"] as const;
export const applicationStatusOptions = [
  "Pending",
  "Rejected",
  "Approved",
] as const;

export const restaurantSchema = z
  .object({
    restaurantName: z
      .string()
      .nonempty("Restaurant name is required. ")
      .min(3, "Name must be at least 3 characters. ")
      .max(80, "Name must be under 80 characters. "),

    address: z.string().nonempty("Address is required"),

    latitude: z
      .number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a number",
      })
      .min(-90, "Latitude must be ≥ -90")
      .max(90, "Latitude must be ≤ 90"),

    longitude: z
      .number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a number",
      })
      .min(-180, "Longitude must be ≥ -180")
      .max(180, "Longitude must be ≤ 180"),

    cuisines: z
      .string()
      .nonempty("Cuisines is required"),

    imageUrl: z.any().optional(), // handled in backend (Cloudinary/S3)

    openingTime: z
      .string()
      .regex(timeRegex, "Opening time must be in HH:mm format"),

    closingTime: z
      .string()
      .regex(timeRegex, "Closing time must be in HH:mm format"),

    status: z.enum(statusOptions).optional(),

    foodType: z
      .string()
      .refine(
        (val) => foodTypeOptions.includes(val as any),
        "Invalid food type"
      ),

    contact: z
      .string()
      .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  })

export type RestaurantInputState = z.infer<typeof restaurantSchema>;

export type RestaurantFormErrors = Partial<
  Record<keyof RestaurantInputState, string>
>;
