import config from "../../../config.json";
const twilioClient = require("twilio")(
  config.twilio.sid,
  config.twilio.authToken
);

export const sendTwilio = (message, phone) => {
  twilioClient.messages
    .create({
      from: "+17865743473",
      body: message,
      to: phone,
    })
    .then((message) => console.log(message.sid));
};

export const sanitizePhones = async (phones) => {
  let results = []; // TODO add errors to response
  for (let p of phones) {
    try {
      let r = await twilioClient.lookups
        .phoneNumbers(p)
        .fetch({ countryCode: "US" });
      if (r.phoneNumber) {
        results.push(r.phoneNumber);
      }
    } catch (err) {
      console.log(`${p} does not exist`);
    }
  }

  return results;
};

export const sanitizePhoneNotRequired = async (req, res, next) => {
  let { phone } = req.body;
  if (!phone) return next();
  if (phone === "1234567") return next();
  try {
    let phoneLookup = await twilioClient.lookups
      .phoneNumbers(phone)
      .fetch({ countryCode: "US" });
    req.body.phone = phoneLookup.phoneNumber;
    next();
  } catch (err) {
    return res.status(500).send("Invalid phone #");
  }
};
