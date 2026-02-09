import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard for now, can be configured
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendBookingNotification = async (toEmail, bookingDetails) => {
    const {
        gymName,
        userName,
        userPhone,
        serviceName,
        bookingDate,
        startTime,
        duration,
        amount
    } = bookingDetails;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: `New Booking at ${gymName}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #13ec5b;">New Booking Confirmed ✅</h2>
                <p>Hello,</p>
                <p>You have received a new booking for <strong>${gymName}</strong>.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Booking Details</h3>
                    <p><strong>Customer:</strong> ${userName}</p>
                    <p><strong>Phone:</strong> ${userPhone || 'N/A'}</p>
                    <p><strong>Service:</strong> ${serviceName}</p>
                    <p><strong>Date:</strong> ${new Date(bookingDate).toDateString()}</p>
                    <p><strong>Time:</strong> ${startTime} (${duration} Hours)</p>
                    <p><strong>Amount Paid:</strong> ₹${amount}</p>
                </div>

                <p>Please ensure the facility is ready for the customer.</p>
                <br>
                <p style="font-size: 12px; color: #888;">Gymato Automated Notification</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Booking notification sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't block the request if email fails
    }
};
