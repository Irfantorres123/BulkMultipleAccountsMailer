import { Box } from "@mui/material";

export function StylizedDiv(props) {
  const { bodyRef, sx, onBoldChange, onItalicChange, onUnderlineChange } =
    props;

  return (
    <Box
      sx={{
        width: "100%",
        margin: "none",
        border: "none",
        outline: "none",
        fontFamily: "Roboto",
        fontSize: "0.9rem",
        resize: "none",
        padding: "0.5rem 0",
        flex: 1,
        height: "300px",
        overflowY: "scroll",
        ...sx,
      }}
      contentEditable
      suppressContentEditableWarning
      ref={bodyRef}
      onKeyDown={(e) => {
        if ((e.key === "b" || e.key === "B") && e.ctrlKey) {
          onBoldChange();
        }
        if ((e.key === "i" || e.key === "I") && e.ctrlKey) {
          onItalicChange();
        }
        if ((e.key === "u" || e.key === "U") && e.ctrlKey) {
          onUnderlineChange();
        }
      }}
    />
  );
}
