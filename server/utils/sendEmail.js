import nodelmailer from "nodemailer";
import config from "config";
import fs from "fs/promises";

const userEmail = config.get("EMAIL");
const userAppPassword = config.get("PASSWORD");

async function sendMail(emailData) {
  try {
    let transporter = nodelmailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: userEmail,
        pass: userAppPassword,
      },
    });

    let info = await transporter.sendMail({
      from: `"Suhail Roushan" <${userEmail}>`,
      subject: emailData.subject, // Subject line
      to: emailData.to,
      html: emailData.html,
      text: emailData.text,
    });
    console.log("EMAIL SENT", info.messageId);
    
    await fs.appendFile(
      "logs/emaillogs.txt",
      `Email Sent to ${emailData.to}, subject:${emailData.subject} and ID: ${info.messageId}\n`
    );
  } catch (error) {
    console.log(error);
  }
}

// sendMail({ subject: "hello", to: "suhail@code.in", text: "<h1>Hello</h1>" });

export default sendMail;
