import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Header } from "./Header";
import UploadIcon from "@mui/icons-material/Upload";
import { useEffect, useState } from "react";
import { excelToObject } from "../utils";
import { AddSender } from "./AddSender";

export function Senders(props) {
  const { showSnackbar, lastAccount, senderList, setSenderList } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const uploadNewAccounts = async (newSenders) => {
    const res = await fetch("/sender-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accounts: newSenders }),
    });
    const data = await res.json();
    return data;
  };
  useEffect(() => {
    fetch("/sender-list")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setSenderList(data.accounts);
      });
  }, []);
  return (
    <Box
      display="flex"
      flexDirection="column"
      boxShadow="0px 0px 4px 2px #eee"
      borderRadius="0.3rem"
      width="500px"
      sx={props.sx}
      overflow="hidden"
      backgroundColor="#fff"
    >
      <AddSender
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        onSubmit={async (sender) => {
          if (senderList.find((s) => s.email === sender.email)) {
            showSnackbar("Sender already exists", "error");
            return;
          }
          setSenderList([...senderList, sender]);
          const data = await uploadNewAccounts([sender]);
          if (!data.accounts.find((a) => a.email === sender.email)) {
            showSnackbar(
              "Failed to add sender.\nCheck your credentials",
              "error"
            );
          } else {
            showSnackbar("Sender added successfully", "success");
            setDialogOpen(false);
          }
          setSenderList(data.accounts);
        }}
        showSnackbar={showSnackbar}
      />
      <Header content="Senders" backgroundColor="#d39227" color="#003f6c" />
      <Box
        padding="0.5rem"
        flex="1"
        maxHeight="350px"
        sx={{
          overflowY: "scroll",
        }}
      >
        {senderList.length === 0 && (
          <Typography variant="body2" color="textSecondary" align="center">
            No sending emails added
          </Typography>
        )}
        {senderList.map((sender, index) => (
          <Box
            key={index}
            sx={{
              margin: "0.5rem 0",

              backgroundColor:
                lastAccount === sender.email ? "#279fd3" : "#fff",
              padding: "0.5rem",
              borderRadius: "0.3rem",
              borderBottom: "1px solid #eee",
            }}
            display="flex"
          >
            <Box flexGrow="0" width="1.5rem" textAlign="right">
              <Typography fontSize="0.9rem" marginRight="0.2rem">
                {index + 1}.
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" flexGrow="1">
              <Typography
                sx={{
                  fontFamily: "Roboto",
                  fontSize: "0.9rem",
                }}
              >
                {sender.email}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Roboto",
                  fontSize: "0.9rem",
                }}
              >
                {sender.sent || 0}
              </Typography>
            </Box>
            {senderList.length - 1 !== index && <Divider />}
          </Box>
        ))}
      </Box>
      <Divider />
      <input
        type="file"
        id="sender-upload"
        onChange={async (e) => {
          try {
            const file = e.target.files[0];
            if (!file) return;
            const rows = await excelToObject(file);
            let newSenders = [];
            rows.forEach((row) => {
              if (row.email && row.pass) {
                newSenders.push({ email: row.email, pass: row.pass });
              }
            });
            setSenderList([...senderList, ...newSenders]);
            const data = await uploadNewAccounts(newSenders);
            setSenderList(data.accounts);
          } catch (err) {
            console.log(err);
          }
        }}
        style={{ display: "none" }}
      />
      <Box
        padding="0.5rem"
        flex="0"
        display="flex"
        justifyContent="space-between"
      >
        <Tooltip title="Upload accounts as an excel file with email and pass as the columns">
          <IconButton
            size="small"
            sx={{
              borderRadius: "0.5rem",
            }}
            onClick={() => {
              document.querySelector("#sender-upload").click();
            }}
          >
            <UploadIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          <Typography variant="h6" fontSize={"0.8rem"} fontWeight="bold">
            Add sender
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}
