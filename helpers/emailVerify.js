export const createEmailTemplate = (email, otp) => ({
    Source: 'manishtomar.uk@gmail.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Your OTP for StudyNav UK' },
      Body: {
        Text: { Data: `Your OTP is: ${otp}` },
        // Optionally, you can use HTML body
      },
    },
  });
  
  