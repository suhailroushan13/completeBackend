import twilio from "twilio";
import config from "config";

const accountSid = config.get("TWILIO_SID");
const authToken = config.get("TWILIO_TOKEN");
const phone = config.get("TWILIO_NUMBER");
const client = new twilio(accountSid, authToken);

async function sendSMS(smsData) {
  try {
    await client.messages.create({
      body: smsData.body,
      to: smsData.to,
      from: phone,
    });
    console.log("SMS Sent");
  } catch (error) {
    console.error(error);
  }
}

// sendSMS({ body: "hello", to: "+919618211626" });
export default sendSMS;
