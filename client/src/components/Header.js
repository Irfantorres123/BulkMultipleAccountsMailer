import { Typography } from "@mui/material";
import { Box } from "@mui/system";

export function Header(props) {
  return (
    <Box borderBottom="1px solid #eee">
      <Typography
        variant="h6"
        sx={{
          color: props.color || "#333",
          fontWeight: "500",
          fontFamily: "Roboto",
          fontSize: "0.9rem",
          padding: "0.5rem",
          backgroundColor: props.backgroundColor || "#51bcf5",
        }}
      >
        {props.content}
      </Typography>
    </Box>
  );
}
