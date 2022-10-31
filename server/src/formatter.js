function format(text, context) {
  return text.replace(/\{([a-zA-z\.0-9]+)\}/g, function (_, key) {
    const l = key.split(".");
    let v = context;
    for (let i = 0; i < l.length; i++) {
      if (v === undefined) return "";
      v = v[l[i]];
    }
    return v;
  });
}

function addAttachments(body, attachments, images) {
  let i = 0;
  attachments.map((attachment) => {
    let name = attachment.name;
    let ext = name.split(".").pop();
    attachment.cid = i;
    if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif") {
      body += `<br/><img width="600px" src="cid:${i}" />`;
    } else {
      body += `<br/><a href="cid:${i}">${name}</a>`;
    }
    i++;
    return attachment;
  });
  images.forEach((imageUrl) => {
    body += `<br/><img width="80%" src="${imageUrl}" />`;
  });

  return [body, attachments];
}

module.exports = { format, addAttachments };
