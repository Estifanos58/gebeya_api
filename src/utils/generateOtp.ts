//write a function to generate a random OTP (One Time Password) of 6 digits

export const generateOtp = (): number => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}