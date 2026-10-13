"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import "@/styles/quilleditorcustom.css";

const QuillEditor = ({
  value,
  onChange,
  placeholder = "Write description here...",
  readOnly = false,
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const Quill = require("quill");

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        readOnly: readOnly,
        modules: {
          toolbar: readOnly ? false : [
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }],
            [{ align: [] }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      // Set initial value immediately after Quill initialization
      if (value) {
        isUpdatingRef.current = true;
        //quillRef.current.clipboard.dangerouslyPasteHTML(value);
        const delta = quillRef.current.clipboard.convert(value);
        quillRef.current.setContents(delta, "silent");
        isUpdatingRef.current = false;
      }

      quillRef.current.on("text-change", () => {
        if (!isUpdatingRef.current && quillRef.current) {
          const html = quillRef.current.root.innerHTML;
          onChange?.(html);
        }
      });
    }
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (quillRef.current && value !== undefined && value !== null) {
      const currentContent = quillRef.current.root.innerHTML;

      // Normalize content for comparison
      const normalizedCurrent = currentContent === '<p><br></p>' ? '' : currentContent;
      const normalizedValue = value === '<p><br></p>' ? '' : value;

      // Only update if content is meaningfully different
      if (normalizedCurrent !== normalizedValue) {
        isUpdatingRef.current = true;

        if (normalizedValue) {
          // quillRef.current.clipboard.dangerouslyPasteHTML(normalizedValue);
          const delta = quillRef.current.clipboard.convert(normalizedValue);
          quillRef.current.setContents(delta, "silent");
        } else {
          quillRef.current.setText('', 'silent');
        }

        isUpdatingRef.current = false;
      }
    }
  }, [value]); // Only run when value prop changes

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
  }, []);

  return (
    <div className="quill-editor-container">
      <div ref={editorRef} />
    </div>
  );
};

export default QuillEditor;