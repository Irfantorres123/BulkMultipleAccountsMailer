const { Tooltip, IconButton } = require("@mui/material");

export function IconWithTooltip(props) {
  const { title, icon, onClick, size, selected, innerRef } = props;
  return (
    <Tooltip title={title}>
      <IconButton
        size={size || "small"}
        sx={{
          borderRadius: "0.5rem",
          backgroundColor: selected ? "#ddd" : "#fff",
          marginRight: "0.5rem",
        }}
        onClick={() => {
          if (onClick) onClick();
        }}
        ref={innerRef}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}
