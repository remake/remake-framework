const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);


export function sendEmail({ email, subject, body }, callback) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !domain || !fromEmail) {
    console.log("------------------------------------------------");
    console.log(`               === EMAIL ===`);
    console.log(``);
    console.log(`   FROM: ${fromEmail}`);
    console.log(`     TO: ${email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`   BODY:`);
    console.log(body);
    console.log(``);
    console.log("------------------------------------------------");

    callback(null);

    return;
  }

  // const mailgun = new Mailgun({ apiKey, domain });

  const mailgunClient = mailgun.client({
    username: 'api', 
    key: apiKey
  });

  mailgunClient.messages.create(domain, {
      from: fromEmail,
      to: email,
      subject: subject,
      html: body
    })
    .then(msg => callback(null, msg))
    .catch(err => callback(err));

}
