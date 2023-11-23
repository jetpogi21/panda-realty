import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.YAHOO_EMAIL,
    pass: process.env.YAHOO_PASSWORD,
  },
});
