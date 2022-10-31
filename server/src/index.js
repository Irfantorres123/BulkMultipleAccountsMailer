const {
  getAccounts,
  addAccounts,
  getLogs,
  sendAllMails,
  stopCampaign,
} = require("./mailer.js");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const expressWs = require("express-ws");
const { images } = require("./images.js");
const app = express();
expressWs(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get("/sender-list", async (req, res, next) => {
  res.send({ accounts: getAccounts() });
});

app.post("/sender-list", async (req, res, next) => {
  try {
    const { accounts } = req.body;
    await addAccounts(accounts);
    res.send({ accounts: getAccounts() });
  } catch (err) {
    res.status(500).send({ err });
  }
});

app.get("/get-logs", (req, res) => {
  res.send(getLogs());
});
app.get("/images", (req, res, next) => {
  res.send({ images: images });
});

app.ws("/sendMail", (ws, req) => {
  ws.on("message", async (msg) => {
    let type = JSON.parse(msg).type;
    if (type === "send_mail") {
      let { subject, body, attachments, recipients, id, images } =
        JSON.parse(msg);
      let { result, err } = await sendAllMails(
        ws,
        subject,
        body,
        attachments,
        recipients,
        id,
        images
      );
      if (err) {
        ws.send(JSON.stringify({ type: "all_emails_sent", err }));
      } else {
        ws.send(JSON.stringify({ type: "all_emails_sent", result }));
      }
    } else if (type === "stop_campaign") {
      stopCampaign();
    }
  });
});
app.ws("stop", (ws, req) => {
  ws.on("message", (msg) => {});
});
app.use(express.static("public"));
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
});
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
