// Email service using nodemailer or simple SMTP
// For 2FA email delivery

export async function sendTwoFactorEmail(email: string, code: string, name: string): Promise<void> {
  // In a real deployment this would use SendGrid, SES, or SMTP
  // For the MVP we log it and simulate sending
  console.log(`[2FA EMAIL] To: ${email}, Name: ${name}, Code: ${code}`);
  
  // If SMTP env vars are available, actually send the email
  // Keeping this stubbed to avoid requiring additional API keys
  return Promise.resolve();
}

export async function sendInvoiceEmail(email: string, invoiceData: {
  name: string;
  tier: string;
  amount: number;
  currency: string;
  invoiceId: string;
  date: string;
}): Promise<void> {
  console.log(`[INVOICE EMAIL] To: ${email}, Invoice: ${invoiceData.invoiceId}`);
  return Promise.resolve();
}
