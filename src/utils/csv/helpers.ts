
import { FarmerData } from "../../types";

// Helper function to determine registration stage
export const determineRegistrationStage = (farmer: FarmerData): string => {
  const status = farmer["Current Status"]?.toLowerCase() || "";
  
  // First check the Current Status field for more accurate stage determination
  if (status.includes("install") && status.includes("inspect")) {
    return "installAndInspection";
  } else if (status.includes("install")) {
    return "install";
  } else if (status.includes("work order")) {
    return "workOrder";
  } else if (status.includes("joint inspection")) {
    return "jointInspection";
  } else if (status.includes("new registration") || status.includes("registration")) {
    return "newRegistration";
  }
  
  // If Current Status doesn't give clear indication, fall back to date fields
  if (farmer["Installation Date"] && farmer["Inspection Date"]) {
    return "installAndInspection";
  } else if (farmer["Installation Date"]) {
    return "install";
  } else if (farmer["Work Order Date"]) {
    return "workOrder";
  } else if (farmer["Joint Insp. Date"]) {
    return "jointInspection";
  } else {
    return "newRegistration";
  }
};
