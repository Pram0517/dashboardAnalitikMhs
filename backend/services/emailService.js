// BACKEND/services/emailService.js
const nodemailer = require('nodemailer');
const environment = require('../config/environment');
const dns = require('dns');

// =============================================
// FORCE IPv4 - Atasi ENETUNREACH error
// =============================================
dns.setDefaultResultOrder('ipv4first');

// =============================================
// CREATE TRANSPORTER
// =============================================
const transporter = nodemailer.createTransport({
    host: environment.email.host || 'smtp.gmail.com',
    port: environment.email.port || 587,
    secure: environment.email.port === 465,
    auth: {
        user: environment.email.user,
        pass: environment.email.password,
    },
    // ✅ Force IPv4
    family: 4,
    // ✅ Timeout
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // ✅ TLS
    tls: {
        rejectUnauthorized: false
    }
});

// =============================================
// SEND EMAIL
// =============================================
const sendEmail = async (to, subject, html, text = '') => {
    try {
        const mailOptions = {
            from: environment.email.from || 'noreply@dashboard.com',
            to,
            subject,
            text: text || html.replace(/<[^>]*>/g, ''),
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

// =============================================
// SEND RESET PASSWORD EMAIL
// =============================================
const sendResetPasswordEmail = async (email, resetToken, name) => {
    const frontendUrl = environment.frontendUrl || process.env.FRONTEND_URL || 'https://dashboardanalitikmhs-production.up.railway.app';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #06446B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
                .button { 
                    display: inline-block; padding: 12px 24px; background: #06446B; 
                    color: white !important; text-decoration: none; border-radius: 6px;
                    margin: 20px 0; font-weight: bold;
                }
                .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
                .warning { color: #dc2626; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Password</h1>
                </div>
                <div class="content">
                    <p>Halo <strong>${name}</strong>,</p>
                    <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
                    <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
                    <p style="text-align: center;">
                        <a href="${resetLink}" class="button">Reset Password</a>
                    </p>
                    <p>Atau copy link berikut ke browser Anda:</p>
                    <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px; font-size: 12px;">
                        ${resetLink}
                    </p>
                    <p class="warning">⚠️ Link ini hanya berlaku selama 1 jam.</p>
                    <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Dashboard Analitik Mahasiswa. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail(email, 'Reset Password Akun Dashboard', html);
};

// =============================================
// SEND WELCOME EMAIL
// =============================================
const sendWelcomeEmail = async (email, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #06446B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
                .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👋 Selamat Datang!</h1>
                </div>
                <div class="content">
                    <p>Halo <strong>${name}</strong>,</p>
                    <p>Selamat! Akun Anda telah berhasil dibuat di Dashboard Analitik Mahasiswa.</p>
                    <p>Anda sekarang dapat login dan mengakses fitur-fitur yang tersedia.</p>
                    <p>Jika Anda memiliki pertanyaan, silakan hubungi administrator.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Dashboard Analitik Mahasiswa. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail(email, 'Selamat Datang di Dashboard Analitik Mahasiswa', html);
};

// =============================================
// TEST EMAIL CONFIG
// =============================================
const testEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendEmail,
    sendResetPasswordEmail,
    sendWelcomeEmail,
    testEmailConfig,
};