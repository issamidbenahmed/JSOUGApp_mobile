const twilio = require('twilio');
require('dotenv').config();
//console.log('Twilio SID:', process.env.TWILIO_ACCOUNT_SID);
//console.log('Twilio Token:', process.env.TWILIO_AUTH_TOKEN);
//console.log('Twilio Phone:', process.env.TWILIO_PHONE);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSms(to, body) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to
  });
}

module.exports = { sendSms }; 