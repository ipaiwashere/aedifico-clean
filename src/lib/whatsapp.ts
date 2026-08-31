// Single source of truth for the WhatsApp contact link.
// Update the number or default message here — every "Hubungi Kami" button uses this.

const WHATSAPP_NUMBER = '6281211170117'; // +62 812-1117-0117, no leading 0, no symbols
const DEFAULT_MESSAGE = 'Halo Aedifico, saya tertarik dengan layanan konstruksi Anda.';

export const whatsappUrl = (message: string = DEFAULT_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
