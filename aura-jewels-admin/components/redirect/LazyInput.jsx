"use client";

import { useEffect, useRef, useState } from "react";

// Input/textarea that keeps its value in LOCAL state while typing and only
// commits up to the (heavy) parent tree on blur / Enter — keeps typing instant.
export default function LazyInput({ value = "", onCommit, as = "input", ...rest }) {
    const [local, setLocal] = useState(value ?? "");
    const last = useRef(value ?? "");

    useEffect(() => {
        if ((value ?? "") !== last.current) {
            last.current = value ?? "";
            setLocal(value ?? "");
        }
    }, [value]);

    const commit = () => {
        if (local !== last.current) {
            last.current = local;
            onCommit?.(local);
        }
    };

    const Comp = as;
    return (
        <Comp
            {...rest}
            value={local ?? ""}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === "Enter" && as !== "textarea") e.currentTarget.blur();
                rest.onKeyDown?.(e);
            }}
        />
    );
}
