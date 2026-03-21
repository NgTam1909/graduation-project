import nodemailer from 'nodemailer';

export async function sendResetEmail(email: string, link: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS ?? process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Đặt lại mật khẩu',
        html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
      <p>
        <a href="${link}" style="color:#4f46e5;font-weight:bold">
          Nhấn vào đây để đặt lại mật khẩu
        </a>
      </p>
      <p>Link sẽ hết hạn sau 15 phút.</p>
    `,
    });
}

export async function sendProjectInviteEmail(
    email: string,
    link: string,
    projectTitle: string,
    inviterName?: string
) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS ?? process.env.EMAIL_PASS,
        },
    });

    const safeInviter = inviterName?.trim() ? inviterName.trim() : "Someone";

    await transporter.sendMail({
        from: `"Support" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Project invitation',
        html: `
      <p>You have been invited to join the project <strong>${projectTitle}</strong>.</p>
      <p>Invited by: ${safeInviter}</p>
      <p>
        <a href="${link}" style="color:#4f46e5;font-weight:bold">
          Accept the invitation
        </a>
      </p>
      <p>This link will expire in 7 days.</p>
    `,
    });
}
