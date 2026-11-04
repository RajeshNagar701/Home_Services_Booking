const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development transporter fallback
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`[Email Notice] To: ${mailOptions.to} | Subject: "${mailOptions.subject}"`);
        return { messageId: `mock_${Date.now()}` };
      }
    };
  }
};

initTransporter();

const sendBookingConfirmation = async (customerEmail, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'HomeServe Technologies <notifications@homeserve.tech>',
      to: customerEmail,
      subject: `Booking Confirmed: ${bookingDetails.bookingReference} - HomeServe Technologies`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0d6efd;">HomeServe Technologies</h2>
          <h3>Your Booking is Confirmed!</h3>
          <p>Hi there,</p>
          <p>Thank you for booking with HomeServe. Here are your service details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking Ref:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingDetails.bookingReference}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingDetails.serviceTitle}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date & Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingDetails.bookingDate} (${bookingDetails.timeSlot})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${bookingDetails.totalAmount}</td></tr>
          </table>
          <p>You can track the live progress of your service technician from your dashboard.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('[EmailService] Error sending booking confirmation:', err.message);
  }
};

module.exports = {
  sendBookingConfirmation
};
