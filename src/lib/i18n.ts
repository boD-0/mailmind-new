import { cache } from 'react';

export type Locale = 'ro' | 'en' | 'fr' | 'de';
export const locales: Locale[] = ['ro', 'en', 'fr', 'de'];
export const defaultLocale: Locale = 'ro';

export const getMessages = cache(async (locale: string) => {
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    if (!messages || typeof messages !== 'object') {
      throw new Error(`Invalid messages for locale: ${locale}`);
    }
    return messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}, falling back to ${defaultLocale}`, error);
    try {
      return (await import(`../messages/${defaultLocale}.json`)).default;
    } catch (fallbackError) {
      console.error(`Failed to load fallback messages for ${defaultLocale}`, fallbackError);
      return {}; // Return empty object to prevent JSON.parse or similar errors downstream
    }
  }
});

export function createT(messages: Record<string, unknown>) {
  return (key: string, variables?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') return key;
    
    if (variables) {
      return Object.entries(variables).reduce((acc, [name, val]) => {
        return acc.replace(new RegExp(`{{${name}}}`, 'g'), String(val));
      }, value);
    }
    return value;
  };
}
