// import speakeasy from "speakeasy";

// export const generateOTP = (mobile_number: string) => {
//     return speakeasy.totp({
//         secret: mobile_number,
//         encoding: "ascii",
//         step: 300,
//     });
// };

// export const verifyOTP = (mobile_number: string, token: string) => {
//     return speakeasy.totp.verify({
//         secret: mobile_number,
//         encoding: "ascii",
//         token,
//         step: 300,
//         window: 1,
//     });
// };

// src/utils/otp.ts

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = () => {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 min
};