import Swal from "sweetalert2";

/**
 * Base confirmation alert helper.
 */
export const confirmAlert = async ({
  title = "Are you sure?",
  text = "",
  icon = "warning",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
  confirmButtonColor = "#000000",
  cancelButtonColor = "#6B7280",
}) => {
  return await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
  });
};

/**
 * Shorthand helper for delete confirmations.
 */
export const confirmDelete = async (
  title = "Delete Item",
  text = "Are you sure you want to delete this? This action cannot be undone."
) => {
  return await confirmAlert({
    title,
    text,
    icon: "warning",
    confirmButtonColor: "#EF4444",
    confirmButtonText: "Yes, delete it",
  });
};

/**
 * Shorthand helper for status change confirmations.
 */
export const confirmStatusChange = async (
  title = "Change Status",
  text = "Do you want to change the status?"
) => {
  return await confirmAlert({
    title,
    text,
    icon: "question",
    confirmButtonColor: "#000000",
    confirmButtonText: "Yes, change status",
  });
};
