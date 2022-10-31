const fs = require("fs");
if (!fs.existsSync("./log.txt")) {
  fs.writeFileSync("./log.txt", "");
}
const logFile = fs.openSync("./log.txt", "a");
function log(object) {
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === "string") {
      object[key] = object[key].replace(/(\r\n|\n|\r)/gm, "");
    }
  });
  object.date = new Date().toLocaleString();
  const jsonObj = JSON.stringify(object);
  fs.writeSync(logFile, jsonObj + "\n");
}
const folder = "./logs";
function logCampaign(object, campaignId) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  const file = fs.openSync(folder + "/" + campaignId + ".json", "w");
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === "string") {
      object[key] = object[key].replace(/(\r\n|\n|\r)/gm, "");
    }
  });
  object.date = new Date().toLocaleString();
  fs.writeSync(file, JSON.stringify(object, null, 2));
}

module.exports = {
  log,
  logCampaign,
};
