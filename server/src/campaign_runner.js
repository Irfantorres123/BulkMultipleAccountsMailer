const formatter = require("./formatter.js");
const nodemailer = require("nodemailer");
const { logCampaign } = require("./logger.js");
class CampaignRunner {
  constructor() {
    this.runningCampaign = null;
  }
  async runCampaign(
    id,
    accounts,
    subject,
    body,
    attachments,
    images,
    recipients,
    onSuccess,
    onError
  ) {
    if (this.campaignRunning) {
      onError("Campaign is already running");
    }
    try {
      this.campaignRunning = true;
      const singleCampaignRunner = new SingleCampaignRunner(
        id,
        accounts,
        recipients,
        subject,
        body,
        attachments,
        images
      );
      this.runningCampaign = singleCampaignRunner;
      const { accepted, rejected, err } =
        await singleCampaignRunner.runCampaign(onSuccess, onError);
      this.campaignRunning = false;
      singleCampaignRunner.transporter = null;
      logCampaign(
        {
          id,
          subject,
          body,
          attachments: attachments.map((attachment) => attachment.name),
          status: "Completed",
          recipients,
          accepted,
          rejected,
          err,
        },
        singleCampaignRunner.id
      );
    } catch (err) {
      this.campaignRunning = false;
      onError(err);
    }
  }
  stopCampaign() {
    this.runningCampaign.stopCampaign();
  }
}

class SingleCampaignRunner {
  constructor(
    _id,
    _accounts,
    _recipients,
    _subject,
    _body,
    _attachments,
    _images
  ) {
    this.id = _id;
    this.accounts = _accounts;
    this.recipients = _recipients;
    this.subject = _subject;
    this.body = _body;
    this.attachments = _attachments;
    this.images = _images;
    this.accounts = this.accounts.map((account) => {
      return { ...account, emailCount: 0 };
    });
    this.accountIndex = 0;
    this.transporter = null;
    this.quota = 50;
  }

  createTransporter(email, pass) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: pass,
      },
      pool: true,
    });
  }
  getTransporter() {
    if (this.forceStop) {
      return null;
    }
    if (!this.transporter) {
      this.transporter = this.createTransporter(
        this.accounts[this.accountIndex].email,
        this.accounts[this.accountIndex].pass
      );
      this.accounts[0].emailCount = 1;
      return this.transporter;
    } else {
      if (this.accounts[this.accountIndex].emailCount < this.quota) {
        this.accounts[this.accountIndex].emailCount++;
        return this.transporter;
      } else {
        this.accountIndex++;
        const currentAccountIndex = this.accountIndex;
        this.transporter = this.createTransporter(
          this.accounts[currentAccountIndex].email,
          this.accounts[currentAccountIndex].pass
        );
        this.accounts[currentAccountIndex].emailCount = 1;
        return this.transporter;
      }
    }
  }
  async runCampaign(onSuccess, onError) {
    let accepted = [];
    let rejected = [];
    let err = null;
    if (this.accounts.length * this.quota < this.recipients.length) {
      throw new Error("Not enough accounts to run this campaign");
    }
    for (let recipient of this.recipients) {
      const _transporter = this.getTransporter();
      const formattedSubject = formatter.format(this.subject, {
        user: recipient,
      });
      const formattedBody = formatter.format(this.body, { user: recipient });
      const [bodyWithEmbeddings, attachmentsWithCids] =
        formatter.addAttachments(formattedBody, this.attachments, this.images);
      const attachmentsToMail = attachmentsWithCids.map((attachment) => {
        return {
          filename: attachment.name,
          content: Buffer.from(attachment.content, "hex"),
          cid: attachment.cid,
        };
      });
      const mailOptions = {
        from: this.accounts[this.accountIndex].email,
        to: recipient.email,
        subject: formattedSubject,
        html: bodyWithEmbeddings,
        attachments: attachmentsToMail,
      };
      const info = await this.sendSingleMail(
        _transporter,
        mailOptions,
        onSuccess,
        onError
      );
      if (info)
        info.accepted.length > 0
          ? accepted.push(...info.accepted)
          : rejected.push(...info.rejected);
      if (this.forceStop) {
        err = "Campaign Stopped";
        break;
      }
    }
    return { accepted, rejected, err };
  }
  async sendSingleMail(transporter, mailOptions, onSuccess, onError) {
    try {
      const info = await transporter.sendMail(mailOptions);
      onSuccess(mailOptions.to, mailOptions.from, info);
      return info;
    } catch (err) {
      onError(mailOptions.to, mailOptions.from, err);
    }
  }
  async stopCampaign() {
    this.forceStop = true;
  }
}

module.exports = { CampaignRunner };
