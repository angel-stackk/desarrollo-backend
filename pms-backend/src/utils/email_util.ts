import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@pms.local',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.log('Error al enviar el correo:', error);
    return false;
  }
};
