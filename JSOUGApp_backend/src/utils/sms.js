const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSms(to, body) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to
  });
}

module.exports = { sendSms }; 