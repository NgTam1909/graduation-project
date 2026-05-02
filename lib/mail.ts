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
      <p>Bạn có một lờ mời tham gia dự án <strong>${projectTitle}</strong>.</p>
      <p>Được mời bởi: ${safeInviter}</p>
      <p>
        <a href="${link}" style="color:#4f46e5;font-weight:bold">
          Chấp nhận lời mời
        </a>
      </p>
      <p>Lời mời này sẽ có hiệu lực trong 3 ngày</p>
    `,
    });
}
