import { toast } from "sonner";

/**
 * Standard success toast helper.
 */
export const showSuccess = (message) => {
  toast.success(message || "Operation successful");
};

/**
 * Standard error toast helper.
 */
export const showError = (message) => {
  toast.error(message || "An error occurred");
};
