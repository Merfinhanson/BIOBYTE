/**
 * Access control for the registration flow.
 *
 * Configured to allow a specific whitelist of emails and domains.
 */

const ALLOWED_EMAILS = [
  "240071601217@crescent.education",
  "yourcollegeemail@gmail.com", // replace with the exact approved college ID
  "anotherapprovedid@gmail.com"
];

const ALLOWED_DOMAINS = [
  "crescent.education",
  "crescenttechnocrats.club"
];

export function isAllowedEmail(email) {
  if (!email) return false;
  
  const lowerEmail = String(email).toLowerCase().trim();
  const domain = lowerEmail.split("@")[1];
  
  if (ALLOWED_EMAILS.includes(lowerEmail)) {
    return true;
  }
  
  if (domain && ALLOWED_DOMAINS.includes(domain)) {
    return true;
  }
  
  return false;
}
