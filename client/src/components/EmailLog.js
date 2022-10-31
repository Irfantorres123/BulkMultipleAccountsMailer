import { Box, Typography } from "@mui/material";
import { Header } from "./Header";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import { useEffect, useRef } from "react";
export function EmailLog(props) {
  const { logs } = props;
  const logDiv = useRef(null);
  useEffect(() => {
    logDiv.current.scrollTop = logDiv.current?.scrollHeight || 0;
  }, [logs]);
  return (
    <Box
      width="100%"
      overflow="hidden"
      borderRadius="0.3rem"
      boxShadow="0px 0px 4px 2px #eee"
      backgroundColor="#fff"
    >
      <Header content="Email Log" backgroundColor="#cef28b" color="#003f6c" />
      <Box
        height="300px"
        sx={{ overflowY: "scroll", overflowX: "hidden" }}
        ref={logDiv}
      >
        {logs.map((log, index) => (
          <Box key={index} padding="0.2rem 0.5rem">
            <Log
              {...log}
              sx={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#eee",
                padding: "0.2rem 0.5rem",
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function Log({ type, recipient, status, sender, messageTime, id, sx }) {
  let component;
  switch (type) {
    case "email_status":
      component = (
        <EmailStatus
          recipient={recipient}
          status={status}
          sender={sender}
          messageTime={messageTime}
          sx={sx}
        />
      );
      break;
    case "new_campaign":
      component = <NewCampaignLog id={id} sx={sx} />;
      break;
    default:
      component = <></>;
  }
  return component;
}

function EmailStatus({ recipient, status, sender, messageTime, sx }) {
  let status_component;
  switch (status) {
    case "delivered":
      status_component = <CheckIcon fontSize="small" htmlColor="green" />;
      break;
    case "failed":
      status_component = <CloseIcon fontSize="small" htmlColor="red" />;
      break;

    default:
      status_component = (
        <HourglassFullIcon fontSize="small" htmlColor="blue" />
      );
  }
  return (
    <Box display="flex" sx={sx}>
      <Typography flex="1" fontFamily="Roboto" fontSize="0.9rem">
        {recipient}
      </Typography>
      <Typography flex="1" fontFamily="Roboto" fontSize="0.9rem">
        {sender}
      </Typography>
      <Typography flex="1" fontFamily="Roboto" fontSize="0.9rem">
        {messageTime ? `${messageTime / 1000} seconds` : "Not delivered"}
      </Typography>
      {status_component}
    </Box>
  );
}

function NewCampaignLog({ id, sx }) {
  return (
    <Box display="flex" width="100%" sx={sx}>
      <Typography flex="1" fontFamily="Roboto" fontSize="0.9rem">
        New Campaign started with id {id}
      </Typography>
    </Box>
  );
}
