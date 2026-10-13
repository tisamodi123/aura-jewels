// Single source of truth for the brand's public contact details.
// Referenced by the Header, Footer, WhatsApp order links, and the
// Get-in-touch page so these values are changed in ONE place only.

const WHATSAPP_NUMBER = '919876543210'; // digits only, for wa.me links

export const CONTACT = {
    email: 'support@aurajewels.com',
    emailHref: 'mailto:support@aurajewels.com',

    phone: '+91 98765 43210',
    phoneHref: 'tel:+919876543210',

    whatsappNumber: WHATSAPP_NUMBER,
    whatsappHref: `https://wa.me/${WHATSAPP_NUMBER}`,

    hours: 'Mon to Sat, 9:30 AM – 5:30 PM (IST)',
};

// Builds a pre-filled WhatsApp chat link (used by product "order via WhatsApp").
export const whatsappLink = (text?: string) =>
    text ? `${CONTACT.whatsappHref}?text=${encodeURIComponent(text)}` : CONTACT.whatsappHref;

export default CONTACT;
