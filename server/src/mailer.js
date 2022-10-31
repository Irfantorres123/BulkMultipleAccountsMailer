const nodemailer = require("nodemailer");
const dblastSavedState = require("./db.json");
const { writeFileSync } = require("fs");
const path = require("path");
const { log } = require("./logger");
const dbDir = path.join(__dirname, "./db.json");
const { CampaignRunner } = require("./campaign_runner");

const db = {
  accounts: dblastSavedState.accounts,
  internalAccountIndex: dblastSavedState.internalAccountIndex,
  set accountIndex(index) {
    this.internalAccountIndex = index;
    writeToDb(this);
  },
  get accountIndex() {
    return this.internalAccountIndex;
  },
};

const runner = new CampaignRunner();

function writeToDb(db) {
  writeFileSync(dbDir, JSON.stringify(db));
}

async function sendAllMails(
  ws,
  subject,
  body,
  attachments,
  recipients,
  id,
  images
) {
  try {
    await _sendAllMails(ws, subject, body, attachments, recipients, id, images);
  } catch (err) {
    return { err };
  }
}
async function _sendAllMails(
  ws,
  subject,
  body,
  attachments,
  recipients,
  id,
  images
) {
  const onSuccess = (recipient, account, info) => {
    log({
      id,
      to: recipient.email,
      subject,
      attachments: attachments.map((attachment) => attachment.name),
      status: "Success",
    });
    info.envelope.from = account;
    ws.send(JSON.stringify({ type: "email_status", info, campaignId: id }));
  };
  const onError = (recipient, account, err) => {
    log({
      id,
      to: recipient,
      subject,
      attachments: attachments.map((attachment) => attachment.name),
      status: "Failed",
    });
    ws.send(
      JSON.stringify({
        type: "email_status",
        info: {
          rejected: [recipient],
          accepted: [],
          err,
          envelope: { from: account },
        },
        campaignId: id,
      })
    );
  };
  await runner.runCampaign(
    id,
    db.accounts,
    subject,
    body,
    attachments,
    images,
    recipients,
    onSuccess,
    onError
  );
  ws.send({ type: "all_emails_sent" });
}

function stopCampaign() {
  runner.stopCampaign();
}

function getAccounts() {
  return db.accounts;
}

async function addAccounts(accounts) {
  return new Promise((resolve, reject) => {
    let verifiedCount = 0;
    accounts.forEach((account) => {
      let testTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: account.email,
          pass: account.pass,
        },
      });
      testTransporter.verify((err, success) => {
        verifiedCount++;

        if (err) {
          console.log(err);
        } else {
          db.accounts.push(account);
          writeToDb(db);
        }
        if (verifiedCount === accounts.length) {
          resolve();
          return;
        }
      });
    });
  });
}

function getLogs() {
  return [];
}

module.exports = {
  getAccounts,
  addAccounts,
  getLogs,
  stopCampaign,
  sendAllMails,
};
