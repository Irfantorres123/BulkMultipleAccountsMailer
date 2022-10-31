import { Backdrop, Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";

export function AddSender(props) {
  const { open, onSubmit, onClose } = props;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const inputProps = {
    style: {
      fontSize: "1.2rem",
      fontFamily: "Glory",
      fontWeight: "400",
    },
  };
  useEffect(() => {
    setPassword("");
  }, [open]);
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "#F5F6F799",
      }}
    >
      <Box
        minWidth="350px"
        maxWidth="350px"
        backgroundColor="white"
        display="flex"
        flexDirection="column"
        borderRadius="0.5rem"
        overflow="hidden"
        boxShadow="0px 0px 20px 0px #e7e7e7"
      >
        <Box>
          <Box display="flex" flexDirection="column" marginBottom="2rem">
            <Typography
              variant="h6"
              fontSize="1.25rem"
              fontWeight="500"
              padding="0.5rem 1rem"
            >
              Add new sender email
            </Typography>
            <Box
              display="block"
              height="1px"
              borderRadius="2px"
              marginLeft="1rem"
              sx={{ backgroundColor: "#dadce0" }}
            />
            <Box padding="0.5rem 1rem">
              <TextField
                variant="standard"
                label="Email address"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required={false}
                fullWidth
                InputProps={inputProps}
                InputLabelProps={inputProps}
                sx={{
                  marginBottom: "1rem",
                }}
              />
              <TextField
                variant="standard"
                label="Password"
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required={false}
                fullWidth
                InputProps={inputProps}
                InputLabelProps={inputProps}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await onSubmit({ email, pass: password });
              }}
              sx={{
                margin: "0.5rem 1rem",
              }}
            >
              <Typography
                variant="h7"
                sx={{
                  fontFamily: "Glory",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                Add Sender
              </Typography>
            </Button>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
          }}
          sx={{
            margin: "10px",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Close
          </Typography>
        </Button>
      </Box>
    </Backdrop>
  );
}
