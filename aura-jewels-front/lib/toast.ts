//** Third party imports */
import { toast } from "sonner";

export const successMsg = (message: string) => {
    toast.success(message)
};

export const errorMsg = (message: string) => {
    toast.error(message)
}

export const warningMsg = (message: string) => {
    toast.warning(message)
}