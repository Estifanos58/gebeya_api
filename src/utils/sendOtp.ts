export const sendOtp = async (otp: number, otpExpires_at: Date , email: string): Promise<void> => {
    // Logic to send OTP via email or SMS
    // This is a placeholder function, you can implement the actual sending logic here
    console.log(`Sending OTP: ${otp} to email: ${email}`);
    
    // Example of how you might use a mail service
    // await mailService.sendOtp(email, otp, otpExpires_at);
    
    // Log the OTP and expiration for debugging purposes
    console.log(`OTP sent to ${email}. It will expire at ${otpExpires_at}`);
}
