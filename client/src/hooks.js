import { fileToRaw } from "./utils";
let ws;
let _onMessageAcceptedCallback,
  _onMessageRejectedCallback,
  _onAllEmailsSentCallback;
export const useWebSockets = function () {
  const send = (data) => {
    if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
      initialize();
    }
    if (ws.readyState !== ws.OPEN) {
      setTimeout(() => {
        send(data);
      }, 1000);
    } else {
      try {
        ws.send(JSON.stringify(data));
      } catch (err) {
        console.log(err);
      }
    }
  };
  const initialize = () => {
    ws = new WebSocket("ws://localhost:5000/sendMail");

    ws.onopen = () => {
      console.log("connected");
    };
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      if (data.type === "email_status") {
        if (data.err) {
          console.log("Error sending email", data.err);
        }
        data.info.accepted.forEach((recipient) => {
          _onMessageAcceptedCallback(
            recipient,
            data.info.envelope.from,
            data.info.messageTime
          );
        });
        data.info.rejected.forEach((recipient) => {
          _onMessageRejectedCallback(recipient, data.info.envelope?.from);
        });
      } else if (data.type === "all_emails_sent") {
        _onAllEmailsSentCallback();
      }
    };
  };

  const onMessageAccepted = (onMessageAcceptedCallback) => {
    _onMessageAcceptedCallback = onMessageAcceptedCallback;
  };
  const onMessageRejected = (onMessageRejectedCallback) => {
    _onMessageRejectedCallback = onMessageRejectedCallback;
  };

  const onAllEmailsSent = (onAllEmailsSentCallback) => {
    _onAllEmailsSentCallback = onAllEmailsSentCallback;
  };

  const sendMail = async (
    subject,
    body,
    attachments,
    recipients,
    id,
    images
  ) => {
    let hexAttachments = [];
    for (let i = 0; i < attachments.length; i++) {
      let attachment = attachments[i];
      let raw = await fileToRaw(attachment);
      hexAttachments.push({
        name: attachment.name,
        content: raw.toString("hex"),
      });
    }
    const data = {
      type: "send_mail",
      subject,
      body,
      attachments: hexAttachments,
      recipients,
      id,
      images,
    };
    send(data);
  };
  const uploadFile = async (file) => {
    const rawFile = await fileToRaw(file);
    ws.send(rawFile);
  };
  const status = () => {
    return ws.readyState;
  };
  const stopCampaign = () => {
    send({ type: "stop_campaign" });
  };
  return {
    stopCampaign,
    initialize,
    onMessageAccepted,
    onMessageRejected,
    sendMail,
    onAllEmailsSent,
    uploadFile,
    status,
  };
};
