import { Box, IconButton, Menu } from "@mui/material";
import { useRef, useState } from "react";
import PhotoIcon from "@mui/icons-material/Photo";
import { IconWithTooltip } from "./IconWithTooltip";

export function ImageSelector(props) {
  const { onAddImage, images = [] } = props;
  const [openImagePicker, setOpenImagePicker] = useState(false);
  const imagePickerButtonRef = useRef(null);
  return (
    <Box>
      <IconWithTooltip
        title="Add image attachment"
        icon={<PhotoIcon />}
        onClick={() => {
          setOpenImagePicker(true);
        }}
        innerRef={imagePickerButtonRef}
      />

      <Menu
        open={openImagePicker}
        onClose={() => setOpenImagePicker(false)}
        anchorEl={imagePickerButtonRef.current}
        keepMounted
      >
        <Box width="min-content">
          {images.map((url) => (
            <IconButton
              onClick={() => {
                setOpenImagePicker(false);
                onAddImage(url);
              }}
              sx={{
                borderRadius: "0.5rem",
              }}
              key={url}
            >
              <img
                src={url}
                style={{
                  maxWidth: "250px",
                  width: "auto",
                  margin: "0.1rem",
                  borderRadius: "0.2rem",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
                alt=""
              />
            </IconButton>
          ))}
        </Box>
      </Menu>
    </Box>
  );
}
