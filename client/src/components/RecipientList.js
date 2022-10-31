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
import { excelToObject } from "../utils";

export function RecipientList(props) {
  const { recipientList = [], setRecipientList, showSnackbar } = props;

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
      <Header content="Recipients" backgroundColor="#e36f6f" color="#003f6c" />
      <Box
        padding="0.5rem"
        flex="1"
        maxHeight="350px"
        sx={{
          overflowY: "scroll",
        }}
      >
        <Box display="flex">
          <Typography
            variant="h6"
            width="49%"
            fontWeight="bold"
            textAlign="center"
          >
            Name
          </Typography>
          <Box width="2%" />
          <Typography
            variant="h6"
            width="49%"
            fontWeight="bold"
            textAlign="center"
          >
            Email
          </Typography>
        </Box>
        <Divider />
        {recipientList.length === 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            marginTop="1rem"
          >
            No recipients added
          </Typography>
        )}
        {recipientList.map((recipient, index) => (
          <Box key={index} display="flex">
            <Typography
              sx={{
                padding: "0.5rem 0",
                fontFamily: "Roboto",
                fontSize: "0.9rem",
                wordWrap: "break-word",
              }}
              width="49%"
            >
              {recipient.name}
            </Typography>
            <Box width="2%" />

            <Typography
              sx={{
                padding: "0.5rem 0",
                fontFamily: "Roboto",
                fontSize: "0.9rem",
                wordWrap: "break-word",
              }}
              width="49%"
            >
              {recipient.email}
            </Typography>
            {recipientList.length - 1 !== index && <Divider />}
          </Box>
        ))}
      </Box>
      <Divider />
      <input
        type="file"
        id="recipients-upload"
        onClick={(event) => {
          event.target.value = null;
        }}
        onChange={async (e) => {
          try {
            const file = e.target.files[0];
            const rows = await excelToObject(file);
            const existingRecipientEmailSet = new Set(
              recipientList.map((recipient) => recipient.email)
            );
            let recipientsToAdd = [];
            rows.forEach((row) => {
              if (row.name && row.email) {
                if (!existingRecipientEmailSet.has(row.email))
                  recipientsToAdd.push({ email: row.email, name: row.name });
                else
                  showSnackbar(
                    "Duplicate email found in recipients list.Skipping duplicates"
                  );
              }
            });
            setRecipientList([...recipientList, ...recipientsToAdd]);
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
        <Tooltip title="Upload contacts as an excel file with name and email as the columns">
          <IconButton
            size="small"
            sx={{
              borderRadius: "0.5rem",
            }}
            onClick={() => {
              document.querySelector("#recipients-upload").click();
            }}
          >
            <UploadIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          onClick={() => {
            setRecipientList([]);
          }}
        >
          <Typography variant="h6" fontSize={"0.8rem"} fontWeight="bold">
            Clear
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}
