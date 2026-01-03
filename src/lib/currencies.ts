
export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', taxName: 'Tax', taxIdLabel: 'Tax ID' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', taxName: 'GST', taxIdLabel: 'GSTIN' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', taxName: 'VAT', taxIdLabel: 'TRN' },
    { code: 'AUD', symbol: '$', name: 'Australian Dollar', locale: 'en-AU', taxName: 'GST', taxIdLabel: 'ABN' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar', locale: 'en-CA', taxName: 'GST/HST', taxIdLabel: 'GST/HST No.' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', taxName: 'VAT', taxIdLabel: 'Tax ID' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', taxName: 'Tax', taxIdLabel: 'Tax ID' },
    { code: 'SGD', symbol: '$', name: 'Singapore Dollar', locale: 'en-SG', taxName: 'GST', taxIdLabel: 'GST No.' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', locale: 'ar-QA', taxName: 'VAT', taxIdLabel: 'Tax ID' },
    { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar', locale: 'zh-HK', taxName: 'Tax', taxIdLabel: 'Tax ID' },
    { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', locale: 'en-NZ', taxName: 'GST', taxIdLabel: 'GST No.' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', taxName: 'Tax', taxIdLabel: 'CNPJ' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU', taxName: 'VAT', taxIdLabel: 'INN' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', taxName: 'VAT', taxIdLabel: 'Business Reg.' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', taxName: 'MOMS', taxIdLabel: 'VAT No.' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'no-NO', taxName: 'MVA', taxIdLabel: 'Org. No.' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX', taxName: 'IVA', taxIdLabel: 'RFC' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', taxName: 'VAT', taxIdLabel: 'Tax ID' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', taxName: 'PPN', taxIdLabel: 'NPWP' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', taxName: 'SST', taxIdLabel: 'SST No.' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', taxName: 'VAT', taxIdLabel: 'MST' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', taxName: 'VAT', taxIdLabel: 'TIN' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR', taxName: 'KDV', taxIdLabel: 'VKN' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL', taxName: 'VAT', taxIdLabel: 'NIP' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD', taxName: 'VAT', taxIdLabel: 'BIN' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'ur-PK', taxName: 'Sales Tax', taxIdLabel: 'NTN' },
    { code: 'EGP', symbol: '£', name: 'Egyptian Pound', locale: 'ar-EG', taxName: 'VAT', taxIdLabel: 'Tax ID' },
    { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', locale: 'he-IL', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW', taxName: 'Tax', taxIdLabel: 'Tax ID' },
    { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', locale: 'ar-OM', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', locale: 'ar-JO', taxName: 'Sales Tax', taxIdLabel: 'Tax ID' },
    { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', locale: 'ar-BH', taxName: 'VAT', taxIdLabel: 'VAT No.' },
    { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', locale: 'zh-TW', taxName: 'VAT', taxIdLabel: 'Tax ID' },
];

export function getCurrencySymbol(code: string): string {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.symbol : code;
}

export function getCurrencyTaxName(code: string): string {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency?.taxName || 'Tax';
}

export function getCurrencyTaxIdLabel(code: string): string {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency?.taxIdLabel || 'Tax ID';
}
