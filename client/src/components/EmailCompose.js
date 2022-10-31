import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Header } from "./Header";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { StylizedDiv } from "./StylizedDiv";
import { useState } from "react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import { ImageSelector } from "./ImageSelector";
import { IconWithTooltip } from "./IconWithTooltip";

export function EmailCompose(props) {
  const { subjectRef, bodyRef, fileList, setFileList, onAddImage, images } =
    props;
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  const onBoldChange = (set = false) => {
    if (set) document.execCommand("bold");
    setBold(!bold);
  };
  const onItalicChange = (set = false) => {
    if (set) {
      document.execCommand("italic", false, !italic);
    }
    setItalic(!italic);
  };
  const onUnderlineChange = (set = false) => {
    if (set) {
      document.execCommand("underline", false, !underline);
    }
    setUnderline(!underline);
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      boxShadow="0px 0px 4px 2px #eee"
      borderRadius="0.3rem"
      width="800px"
      sx={{
        ...props.sx,
        borderTopLeftRadius: "0.3rem",
        borderTopRightRadius: "0.3rem",
      }}
      overflow="hidden"
      backgroundColor="#fff"
      height="100%"
    >
      <Header content="Compose Email" />
      <Box padding="0.5rem">
        <input
          ref={subjectRef}
          placeholder="Subject"
          style={{
            width: "100%",
            margin: "none",
            border: "none",
            outline: "none",
            fontFamily: "Roboto",
            fontSize: "0.9rem",
            padding: "0.5rem 0",
          }}
        />
        <Divider />
        <StylizedDiv
          bodyRef={bodyRef}
          onBoldChange={onBoldChange}
          onItalicChange={onItalicChange}
          onUnderlineChange={onUnderlineChange}
        />
        <Box display="flex" flexDirection="column" flex="0">
          {fileList.map((file, index) => (
            <Box key={index} display="flex" alignItems="center">
              <Typography
                sx={{
                  margin: "0.5rem 0",
                  fontFamily: "Roboto",
                  fontSize: "0.9rem",
                }}
              >
                {file.name}
              </Typography>
              <Box margin="0 0.5rem">
                <button
                  onClick={() => {
                    const newFileList = fileList.filter(
                      (file, i) => i !== index
                    );
                    setFileList(newFileList);
                  }}
                >
                  Remove
                </button>
              </Box>
            </Box>
          ))}
          <Box>
            {images
              .filter((image) => image.selected)
              .map((image, index) => (
                <img
                  style={{
                    maxWidth: "100px",
                    width: "auto",
                    margin: "0.2rem",
                    borderRadius: "0.3rem",
                  }}
                  src={image.url}
                  alt=""
                  key={image.url}
                />
              ))}
          </Box>
        </Box>
        <Divider />
        <input
          type="file"
          id="email-attachment"
          multiple
          onChange={(e) => {
            const newFileList = [...fileList, ...e.target.files];
            setFileList(newFileList);
          }}
          style={{ display: "none" }}
        />
        <Box padding="0.5rem 0" flex="0" display="flex">
          <IconWithTooltip
            onClick={() => {
              document.querySelector("#email-attachment").click();
            }}
            icon={<AttachFileIcon />}
            title="Attach File"
          />
          <IconWithTooltip
            icon={<FormatBoldIcon />}
            title="Bold"
            selected={bold}
          />
          <IconWithTooltip
            icon={<FormatItalicIcon />}
            title="Italic"
            selected={italic}
          />
          <IconWithTooltip
            icon={<FormatUnderlinedIcon />}
            title="Underline"
            selected={underline}
          />
          <ImageSelector
            onAddImage={onAddImage}
            images={images.map((i) => i.url)}
          />
        </Box>
      </Box>
    </Box>
  );
}
