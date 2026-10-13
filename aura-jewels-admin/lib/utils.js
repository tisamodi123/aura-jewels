import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_URL } from "./APIUrl";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isValidData = (val) =>
  val !== null && val !== undefined && val !== "";

export const formatedPrice = (price) => {
  const formattedPrice = price % 1 === 0 ? price : price?.toFixed(2);
  return formattedPrice;
};


export const DefaultCurrency = 'S$'

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? "#000000" : "#E4E8EE",
        boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
        borderRadius: "0.375rem",
        minHeight: "38px",
        fontSize: "0.8rem",
        backgroundColor: "#FFFFFF",
        color: "#656B7B",
        cursor: "pointer",
        "&:hover": {
            borderColor: "#cbd5e1"
        }
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? "#000000"
            : state.isFocused
                ? "#f1f5f9"
                : "#FFFFFF",
        color: state.isSelected ? "#FFFFFF" : "#656B7B",
        cursor: "pointer",
        fontSize: "0.8rem",
        "&:active": {
            backgroundColor: "#cbd5e1"
        }
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: "#f1f5f9",
        borderRadius: "9999px",
        padding: "1px 8px"
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        fontSize: "0.75rem",
        color: "#374151"
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: "#9ca3af",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "#e5e7eb",
            color: "#1f2937",
            borderRadius: "9999px"
        }
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999
    })
};