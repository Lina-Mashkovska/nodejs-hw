import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs/promises";
import createHttpError from "http-errors";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export const sendEmail = async (options) => {
  try {
    const source = await fs.readFile(options.templatePath, "utf8");
    const compiledTemplate = handlebars.compile(source);
    const html = compiledTemplate(options.variables);

    return await transporter.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html,
    });
  } catch {
    throw createHttpError(500, "Failed to send the email, please try again later.");
  }
};



