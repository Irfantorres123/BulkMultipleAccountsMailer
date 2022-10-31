import "./App.css";
import {
  Alert,
  Box,
  Button,
  createTheme,
  LinearProgress,
  Snackbar,
  ThemeProvider,
} from "@mui/material";
import { EmailCompose } from "./components/EmailCompose";
import { RecipientList } from "./components/RecipientList";
import { useEffect, useRef, useState } from "react";
import { EmailLog } from "./components/EmailLog";
import { useWebSockets } from "./hooks";
import { Senders } from "./components/Senders";
import { blue } from "@mui/material/colors";
import uuid from "react-uuid";
const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#56AAFF",
    },
    secondary: {
      main: blue[600],
    },
    error: {
      main: "#bb0000",
    },
  },
  typography: {
    h1: {
      fontSize: "3rem",
      fontWeight: "bold",
      textAlign: "center",
    },
    h5: {
      fontFamily: "Roboto",
      fontSize: "1rem",
      fontWeight: "500",
    },
    h6: {
      fontSize: "1rem",
      fontFamily: "Glory",
      fontWeight: "400",
    },
    h7: {
      fontFamily: "Glory",
      fontSize: "1rem",
      fontWeight: "400",
    },
    h8: {
      fontFamily: ["Glory"],
      fontSize: "0.8rem",
      fontWeight: "500",
    },
  },
});
const useImages = async (setImages) => {
  useEffect(() => {
    (async () => {
      const res = await fetch("/images");
      const data = await res.json();
      setImages((prev) =>
        data.images.map((image) => {
          return { url: image, selected: false };
        })
      );
      return data;
    })();
  }, []);
};
function App() {
  const [senderList, setSenderList] = useState([]);
  const [recipientList, setRecipientList] = useState(Array());
  const [images, setImages] = useState([]);
  useImages(setImages);
  const subjectRef = useRef();
  const bodyRef = useRef();
  const [fileList, setFileList] = useState(Array());
  let [logs, setLogs] = useState(Array());
  let [snackBarOpen, setSnackBarOpen] = useState(false);
  let [snackBarMessage, setSnackBarMessage] = useState("");
  let [severity, setSeverity] = useState("success");
  const ws = useRef(useWebSockets());
  const counter = useRef(0);
  const [campaignRunning, setCampaignRunning] = useState(false);
  const showSnackbar = (message, severity) => {
    setSeverity(severity);
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };
  const handleClose = () => {
    setSnackBarOpen(false);
  };
  useEffect(() => {
    fetch("/get-logs")
      .then((res) => res.json())
      .then(({ _logs }) => {
        setLogs(_logs || []);
      });
    ws.current.initialize();
    ws.current.onMessageAccepted((recipient, sender, messageTime) => {
      counter.current++;
      setLogs((prev) => [
        ...prev,
        {
          type: "email_status",
          recipient: recipient,
          status: "delivered",
          sender: sender,
          messageTime,
        },
      ]);
      setSenderList((prev) => {
        return prev.map((s) => {
          if (s.email === sender) {
            return { ...s, sent: (s.sent || 0) + 1 };
          }
          return s;
        });
      });
    });
    ws.current.onMessageRejected((recipient, sender) => {
      counter.current++;
      setLogs((prev) => [
        ...prev,
        {
          type: "email_status",
          recipient: recipient,
          status: "failed",
          sender: sender,
        },
      ]);
    });
    ws.current.onAllEmailsSent(() => {
      showSnackbar("Campaign Completed", "success");
      setCampaignRunning(false);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        margin="2rem 0"
      >
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={3000}
          onClose={handleClose}
          message={snackBarMessage}
          ContentProps={{ style: { fontWeight: "bold" } }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            sx={{ fontWeight: "400" }}
          >
            {snackBarMessage}
          </Alert>
        </Snackbar>
        <Box display="flex" margin="0 auto" flexDirection="column">
          <Box display="flex">
            <EmailCompose
              subjectRef={subjectRef}
              bodyRef={bodyRef}
              fileList={fileList}
              setFileList={setFileList}
              ws={ws.current}
              onAddImage={(link) => {
                setImages(
                  images.map((image) => {
                    if (image.url === link) {
                      return { ...image, selected: true };
                    }
                    return image;
                  })
                );
              }}
              onRemoveImage={(link) => {
                setImages(
                  images.map((image) => {
                    if (image.url === link) {
                      return { ...image, selected: false };
                    }
                    return image;
                  })
                );
              }}
              images={images}
            />
            <Box width="1rem" />
            <RecipientList
              showSnackbar={showSnackbar}
              recipientList={recipientList}
              setRecipientList={setRecipientList}
            />
            <Box width="1rem" />

            <Senders
              showSnackbar={showSnackbar}
              lastAccount={logs[logs.length - 1]?.sender}
              senderList={senderList}
              setSenderList={setSenderList}
            />
          </Box>
          <Box display="flex" marginTop="1rem">
            <EmailLog logs={logs} />
          </Box>
        </Box>
        <Box
          marginTop="2rem"
          height="2rem"
          padding="0 50px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <LinearProgress
            variant="determinate"
            value={(counter.current / recipientList.length) * 100}
            sx={{ flex: 1, height: "1rem", margin: "0 1rem" }}
          />
          <Box>
            <Button
              variant="contained"
              disabled={
                recipientList.length === 0 ||
                subjectRef.current.value.length === 0 ||
                campaignRunning
              }
              onClick={async () => {
                let id = uuid();
                counter.current = 0;
                setSenderList((prev) => {
                  return prev.map((s) => {
                    return { ...s, sent: 0 };
                  });
                });
                if (ws.current.status() !== WebSocket.OPEN) {
                  ws.current.initialize();
                }
                ws.current.sendMail(
                  subjectRef.current.value,
                  bodyRef.current.innerHTML,
                  fileList,
                  recipientList,
                  id,
                  images
                    .filter((image) => image.selected)
                    .map((image) => image.url)
                );
                showSnackbar("Sending emails", "success");
                setLogs([...logs, { type: "new_campaign", id: id }]);
              }}
            >
              Start campaign
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                ws.current.stopCampaign();
              }}
              sx={{
                marginLeft: "1rem",
              }}
            >
              Stop Campaign
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
