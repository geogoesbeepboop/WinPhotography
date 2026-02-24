import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

type AdminNotificationType =
  | 'new_inquiry'
  | 'payment_received'
  | 'booking_status_change';

interface AdminNotificationData {
  clientName?: string;
  clientEmail?: string;
  name?: string;
  email?: string;
  eventType?: string;
  eventDate?: string | Date;
  amount?: number;
  currency?: string;
  paymentType?: string;
  bookingId?: string;
  paymentId?: string;
  message?: string;
  previousStatus?: string;
  newStatus?: string;
}

interface SendOptions {
  throwOnError?: boolean;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromAddress: string;
  private readonly adminEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.resendApiKey');
    this.fromAddress =
      this.configService.get<string>('email.from') ||
      process.env.RESEND_FROM ||
      'onboarding@resend.dev';
    this.adminEmail =
      this.configService.get<string>('email.adminEmail') ||
      'admin@maewinphoto.com';
    this.frontendUrl =
      this.configService.get<string>('frontendUrl') ||
      'http://localhost:3000';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email client initialized');
    } else {
      this.resend = null;
      this.logger.warn(
        'RESEND_API_KEY is not set — emails will not be sent. Set the key to enable email delivery.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Shared layout
  // ---------------------------------------------------------------------------

  private wrapInLayout(bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mae Win Photography</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f5f3;font-family:'Georgia','Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:2px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:400;letter-spacing:4px;color:#ffffff;text-transform:uppercase;">Mae Win Photography</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#faf9f8;padding:28px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                Mae Win Photography &mdash; Capturing your most beautiful moments
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#bbb;">
                &copy; ${new Date().getFullYear()} Mae Win Photography. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private heading(text: string): string {
    return `<h2 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#1a1a1a;line-height:1.3;">${text}</h2>`;
  }

  private paragraph(text: string): string {
    return `<p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">${text}</p>`;
  }

  private button(label: string, url: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr>
    <td style="background-color:#1a1a1a;border-radius:2px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-family:'Georgia','Times New Roman',serif;color:#ffffff;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
  }

  private divider(): string {
    return `<hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />`;
  }

  private detailRow(label: string, value: string): string {
    return `<tr>
  <td style="padding:8px 0;font-size:14px;color:#999;width:140px;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;font-size:14px;color:#1a1a1a;">${value}</td>
</tr>`;
  }

  // ---------------------------------------------------------------------------
  // Send helper
  // ---------------------------------------------------------------------------

  private async send(
    to: string,
    subject: string,
    html: string,
    options: SendOptions = {},
  ): Promise<void> {
    if (!this.resend) {
      const reason = `Email not sent (no API key): to=${to}, subject="${subject}"`;
      this.logger.warn(reason);
      if (options.throwOnError) {
        throw new Error(
          'Email service is not configured. Set RESEND_API_KEY to send email replies.',
        );
      }
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        if (options.throwOnError) {
          throw new Error(error.message);
        }
      } else {
        this.logger.log(
          `Email sent to ${to}: "${subject}" (id=${data?.id ?? 'n/a'})`,
        );
      }
    } catch (err) {
      const message = (err as Error).message;
      this.logger.error(`Unexpected error sending email to ${to}: ${message}`);
      if (options.throwOnError) {
        throw err;
      }
    }
  }

  private formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ---------------------------------------------------------------------------
  // 1. Inquiry confirmation (to client)
  // ---------------------------------------------------------------------------

  async sendInquiryConfirmation(
    to: string,
    data: {
      name: string;
      eventType?: string;
      eventDate?: string;
      message?: string;
    },
  ): Promise<void> {
    const body = `
${this.heading(`Thank you, ${data.name}`)}
${this.paragraph(
  'We are so excited that you reached out! Your inquiry has been received and Mae Win Photography will be in touch within 24 hours.',
)}
${
  data.eventType || data.eventDate
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  ${data.eventType ? this.detailRow('Event', data.eventType) : ''}
  ${data.eventDate ? this.detailRow('Date', data.eventDate) : ''}
</table>`
    : ''
}
${this.paragraph(
  'In the meantime, feel free to explore our portfolio for inspiration. We look forward to capturing your beautiful moments.',
)}
${this.button('View Portfolio', `${this.frontendUrl}/portfolio`)}
${this.paragraph(
  'With warmth,<br /><span style="color:#1a1a1a;font-style:italic;">Mae Win Photography</span>',
)}`;

    await this.send(
      to,
      'Thank You for Your Inquiry — Mae Win Photography',
      this.wrapInLayout(body),
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Booking confirmed (to client)
  // ---------------------------------------------------------------------------

  async sendBookingConfirmed(
    to: string,
    data: {
      clientName: string;
      eventType: string;
      eventDate: string | Date;
      eventLocation?: string;
      packageName?: string;
    },
  ): Promise<void> {
    const displayDate = this.formatDate(data.eventDate);

    const body = `
${this.heading('Your Session is Confirmed')}
${this.paragraph(
  `Dear ${data.clientName}, we are thrilled to confirm your <strong>${data.eventType}</strong> photography session.`,
)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  ${this.detailRow('Event', data.eventType)}
  ${this.detailRow('Date', displayDate)}
  ${data.eventLocation ? this.detailRow('Location', data.eventLocation) : ''}
  ${data.packageName ? this.detailRow('Package', data.packageName) : ''}
</table>
${this.paragraph(
  'You can view and manage your booking details anytime through the client portal.',
)}
${this.button('Client Portal', `${this.frontendUrl}/portal/bookings`)}
${this.divider()}
${this.paragraph(
  'If you have any questions or need to make changes, please don\'t hesitate to reach out. We can\'t wait to work with you!',
)}
${this.paragraph(
  'With warmth,<br /><span style="color:#1a1a1a;font-style:italic;">Mae Win Photography</span>',
)}`;

    await this.send(
      to,
      `Booking Confirmed — ${data.eventType} on ${displayDate}`,
      this.wrapInLayout(body),
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Gallery ready (to client)
  // ---------------------------------------------------------------------------

  async sendGalleryReady(
    to: string,
    data: {
      name: string;
      galleryName: string;
      galleryId: string;
      imageCount?: number;
    },
  ): Promise<void> {
    const body = `
${this.heading('Your Photos Are Ready')}
${this.paragraph(
  `Dear ${data.name}, your gallery <strong>${data.galleryName}</strong> is now available to view. We poured our hearts into every image and we hope you love them as much as we do.`,
)}
${
  data.imageCount
    ? this.paragraph(
        `<span style="font-size:28px;color:#1a1a1a;font-weight:400;">${data.imageCount}</span> <span style="color:#999;font-size:14px;text-transform:uppercase;letter-spacing:1px;">beautifully edited photos</span>`,
      )
    : ''
}
${this.button('View Your Gallery', `${this.frontendUrl}/portal/galleries/${data.galleryId}`)}
${this.divider()}
${this.paragraph(
  'Your gallery is accessible through the client portal. You can favourite images, download high-resolution files, and share them with loved ones.',
)}
${this.paragraph(
  'With warmth,<br /><span style="color:#1a1a1a;font-style:italic;">Mae Win Photography</span>',
)}`;

    await this.send(
      to,
      `Your Gallery Is Ready — ${data.galleryName}`,
      this.wrapInLayout(body),
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Payment receipt (to client)
  // ---------------------------------------------------------------------------

  async sendPaymentReceipt(
    to: string,
    data: {
      clientName: string;
      amount: number;
      currency?: string;
      paymentType?: string;
      paidAt?: Date | string;
      description?: string;
    },
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
    }).format(data.amount);

    const eventLabel = data.paymentType || data.description || 'photography';

    const body = `
${this.heading('Payment Received')}
${this.paragraph(
  `Dear ${data.clientName}, thank you for your payment. Here is your receipt.`,
)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
  ${this.detailRow('Amount', `<strong>${formattedAmount}</strong>`)}
  ${this.detailRow('For', `${eventLabel} session`)}
  ${data.paidAt ? this.detailRow('Date', this.formatDate(data.paidAt)) : ''}
  ${data.description ? this.detailRow('Description', data.description) : ''}
</table>
${this.paragraph(
  'You can view all your payments and booking details in the client portal.',
)}
${this.button('Client Portal', `${this.frontendUrl}/portal/bookings`)}
${this.divider()}
${this.paragraph(
  'If you have any questions about this payment, please reply to this email.',
)}
${this.paragraph(
  'With warmth,<br /><span style="color:#1a1a1a;font-style:italic;">Mae Win Photography</span>',
)}`;

    await this.send(
      to,
      `Payment Receipt — ${formattedAmount} for ${eventLabel}`,
      this.wrapInLayout(body),
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Client invite (to new client)
  // ---------------------------------------------------------------------------

  async sendClientInvite(
    to: string,
    data: {
      name: string;
      inviteToken: string;
    },
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${data.inviteToken}`;

    const body = `
${this.heading('Welcome to Mae Win Photography')}
${this.paragraph(
  `Dear ${data.name}, you've been invited to the Mae Win Photography client portal. Your portal gives you access to your bookings, galleries, invoices, and more.`,
)}
${this.paragraph(
  'Click the button below to set your password and get started.',
)}
${this.button('Set Your Password', resetUrl)}
${this.divider()}
${this.paragraph(
  'If you did not expect this invitation, you can safely ignore this email.',
)}
${this.paragraph(
  'With warmth,<br /><span style="color:#1a1a1a;font-style:italic;">Mae Win Photography</span>',
)}`;

    await this.send(
      to,
      "You're Invited — Mae Win Photography Client Portal",
      this.wrapInLayout(body),
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Inquiry reply (admin → client)
  // ---------------------------------------------------------------------------

  async sendInquiryReply(
    to: string,
    data: {
      clientName: string;
      replyMessage: string;
    },
  ): Promise<void> {
    const escapedMessage = data.replyMessage
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br />');

    const body = `
${this.heading(`Hi ${data.clientName}`)}
${this.paragraph(escapedMessage)}
${this.divider()}
${this.paragraph(
  'If you have any further questions, simply reply to this email or visit our website.',
)}
${this.button('Visit Our Website', this.frontendUrl)}
${this.paragraph(
  'With warmth,<br /><span style="color:#1a1a1a;font-style:italic;">Mae Win Photography</span>',
)}`;

    await this.send(
      to,
      `Message from Mae Win Photography`,
      this.wrapInLayout(body),
      { throwOnError: true },
    );
  }

  // ---------------------------------------------------------------------------
  // 7. Admin notification
  // ---------------------------------------------------------------------------

  async sendAdminNotification(
    type: AdminNotificationType,
    data: AdminNotificationData,
  ): Promise<void> {
    const resolvedName =
      data.clientName || data.name || 'Unknown';
    const resolvedEmail =
      data.clientEmail || data.email || undefined;

    const subjectMap: Record<AdminNotificationType, string> = {
      new_inquiry: `New Inquiry from ${resolvedName}`,
      payment_received: `Payment Received from ${resolvedName}`,
      booking_status_change: `Booking Updated — ${resolvedName}`,
    };

    const subject = subjectMap[type] || 'Admin Notification';
    let details = '';

    switch (type) {
      case 'new_inquiry': {
        details = `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
  ${this.detailRow('Client', resolvedName)}
  ${resolvedEmail ? this.detailRow('Email', resolvedEmail) : ''}
  ${data.eventType ? this.detailRow('Event Type', data.eventType) : ''}
  ${data.eventDate ? this.detailRow('Event Date', this.formatDate(data.eventDate)) : ''}
</table>
${data.message ? this.paragraph(`<strong>Message:</strong><br /><span style="color:#666;font-style:italic;">"${data.message}"</span>`) : ''}`;
        break;
      }
      case 'payment_received': {
        const formattedAmount = data.amount
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: data.currency || 'USD',
            }).format(data.amount)
          : 'N/A';
        details = `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
  ${this.detailRow('Client', resolvedName)}
  ${resolvedEmail ? this.detailRow('Email', resolvedEmail) : ''}
  ${this.detailRow('Amount', `<strong>${formattedAmount}</strong>`)}
  ${data.paymentType ? this.detailRow('Type', data.paymentType) : ''}
  ${data.bookingId ? this.detailRow('Booking', data.bookingId) : ''}
</table>`;
        break;
      }
      case 'booking_status_change': {
        details = `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
  ${this.detailRow('Client', resolvedName)}
  ${resolvedEmail ? this.detailRow('Email', resolvedEmail) : ''}
  ${data.eventType ? this.detailRow('Event Type', data.eventType) : ''}
  ${data.eventDate ? this.detailRow('Event Date', this.formatDate(data.eventDate)) : ''}
  ${data.previousStatus ? this.detailRow('Previous Status', data.previousStatus) : ''}
  ${data.newStatus ? this.detailRow('New Status', `<strong>${data.newStatus}</strong>`) : ''}
</table>`;
        break;
      }
    }

    const headingMap: Record<AdminNotificationType, string> = {
      new_inquiry: 'New Inquiry Received',
      payment_received: 'Payment Received',
      booking_status_change: 'Booking Status Updated',
    };

    const body = `
${this.heading(headingMap[type] || 'Notification')}
${details}
${this.button('Open Admin Dashboard', `${this.frontendUrl}/admin`)}`;

    await this.send(this.adminEmail, subject, this.wrapInLayout(body));
  }
}
