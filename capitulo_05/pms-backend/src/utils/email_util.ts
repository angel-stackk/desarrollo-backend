// src/utils/email_util.ts
import nodemailer from 'nodemailer';

export const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER || 'test@ethereal.email',
                pass: process.env.SMTP_PASS || 'password'
            }
        });

        await transporter.sendMail({
            from: '"Sistema PMS" <no-reply@pms.com>',
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Error enviando correo:', error);
        return false;
    }
};