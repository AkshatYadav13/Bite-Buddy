import { vehicleTypeOptions } from "@/types/deliveryAgentType";
import { z } from "zod";

const licenseNumberPattern = /^[A-Z]{2}\d{2}\s?\d{4}\d{8}$/;
const vehicleNumberPattern = /^[A-Z]{2}\d{2}\s[A-Z]{0,2}\s\d{4}$/;

export const agentSchema = z
  .object({
    licenseNumber: z
      .string()
      .nonempty("License number is required")
      .regex(licenseNumberPattern, "Invalid license number format"),

    vehicleNumber: z
      .string()
      .nonempty("Vehicle number is required")
      .regex(vehicleNumberPattern, "Invalid vehicle number format"),

    vehicleType: z.enum(vehicleTypeOptions, {
      errorMap: () => ({
        message: "Invalid vehicle type",
      }),
    }),
    preferredRestaurants: z.any().optional(),
  })


export type AgentInputState = z.infer<typeof agentSchema>;

export type AgentFormErrors = Partial<Record<keyof AgentInputState, string>>;
