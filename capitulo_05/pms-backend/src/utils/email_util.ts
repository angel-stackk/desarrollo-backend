// src/utils/email_util.ts
import nodemailer from 'nodemailer';

export const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
    try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || testAccount.user,
                pass: process.env.SMTP_PASS || testAccount.pass
            }
        });

        const info = await transporter.sendMail({
            from: '"Sistema PMS" <no-reply@pms.com>',
            to,
            subject,
            html
        });

        console.log('Correo enviado. Vista previa URL:', nodemailer.getTestMessageUrl(info));
        return true;
    } catch (error) {
        console.error('Error enviando correo:', error);
        return false;
    }
};