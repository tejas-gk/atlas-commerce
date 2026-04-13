import React, { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
// @ts-ignore
import ReactQuill from "react-quill-new";

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value || ""); // Single state
  const quillRef = useRef(false); 

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true; // Mark as mounted
  
      // 🔥 Fix: Ensure only one toolbar is present
      setTimeout(() => {
        document
          .querySelectorAll(".ql-toolbar")
          .forEach((toolbar, index) => {
            if (index > 0) {
              toolbar.remove(); // Remove extra toolbars
            }
          });
      }, 100); // Short delay ensures Quill is fully initialized
    }
  }, []);
  
  return (
    <div className="relative">
      {/* ✅ No duplicate Quill instance */}
      {/* @ts-ignore */}
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }], // Font picker
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers
            [{ size: ["small", false, "large", "huge"] }], // Font sizes
            ["bold", "italic", "underline", "strike"], // Basic text styling
            [{ color: [] }, { background: [] }], // Font & Background colors
            [{ script: "sub" }, { script: "super" }], // Subscript / Superscript
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            [{ indent: "-1" }, { indent: "+1" }], // Indentation
            [{ align: [] }], // Text alignment
            ["blockquote", "code-block"], // Blockquote & Code Block
            ["link", "image", "video"], // Insert Link, Image, Video
            ["clean"], // Remove formatting
          ],
        }}
        placeholder="Write a detailed product description here..."
        className="bg-white border border-[#dde1bc] text-[#17320f] rounded-md"
        style={{
          minHeight: "250px",
        }}
      />

      <style>
        {`
          .ql-toolbar {
            background: #f7f8ea;
            border-color: #dde1bc;
          }
          .ql-container {
            background: white !important;
            border-color: #dde1bc;
            color: #17320f;
          }
          .ql-picker {
            color: #17320f!important;
          }
          .ql-editor {
            min-height: 200px;
          }
          .ql-snow {
            border-color: #dde1bc!important;
          }
          .ql-editor.ql-blank::before {
            color: #8b916a !important;
          }
          .ql-picker-options {
            background: white !important;
            color: #17320f !important;
          }
          .ql-picker-item {
            color: #17320f !important;
          }
          .ql-stroke {
            stroke: #17320f!important;
          }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;
