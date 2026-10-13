"use client";

import { showError } from "@/lib/toast";
import { useEffect } from "react";

export default function FormikErrorFocus({ errors, submitCount }) {
    useEffect(() => {
        if (submitCount > 0 && Object.keys(errors).length > 0) {
            console.log("Formik Validation Errors:", errors);
            const firstError = Object.values(errors)[0];
            const errorMsg = typeof firstError === "string" ? firstError : "Please fill all required fields correctly.";
            showError(errorMsg);
        }
    }, [submitCount, errors]);

    return null;
}
