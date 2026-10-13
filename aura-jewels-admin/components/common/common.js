// styles/reactSelectStyles.js

export const reactSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "34px",
        height: "34px",
        borderRadius: "6px",
        borderColor: state.isFocused ? "#818cf8" : "#e5e7eb",
        backgroundColor: state.isFocused ? "#fff" : "#f9fafb",
        boxShadow: state.isFocused
            ? "0 0 0 2px rgba(99,102,241,0.15)"
            : "none",
        fontSize: "0.875rem",
        "&:hover": {
            borderColor: "#818cf8",
        },
    }),

    valueContainer: (base) => ({
        ...base,
        padding: "0 10px",
        height: "34px",
    }),

    input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
    }),

    indicatorSeparator: () => ({
        display: "none",
    }),

    dropdownIndicator: (base) => ({
        ...base,
        padding: "0 6px",
        color: "#9ca3af",
    }),

    clearIndicator: (base) => ({
        ...base,
        padding: "0 4px",
        color: "#9ca3af",
    }),

    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),

    menu: (base) => ({
        ...base,
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
    }),

    option: (base, state) => ({
        ...base,
        fontSize: "0.875rem",
        backgroundColor: state.isSelected
            ? "#6366f1"
            : state.isFocused
                ? "#eef2ff"
                : "#fff",
        color: state.isSelected ? "#fff" : "#1f2937",
        cursor: "pointer",
    }),

    singleValue: (base) => ({
        ...base,
        color: "#1f2937",
        fontSize: "0.875rem",
    }),

    placeholder: (base) => ({
        ...base,
        color: "#9ca3af",
        fontSize: "0.875rem",
    }),
};