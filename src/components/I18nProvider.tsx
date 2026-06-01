'use client';

import React, { createContext, useContext } from 'react';

const I18nContext = createContext<Record<string, unknown> | null>(null);

export function I18nProvider({ 
  messages, 
  children 
}: { 
  messages: Record<string, unknown>; 
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={messages}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const messages = useContext(I18nContext);
  
  return {
    t: (key: string, variables?: Record<string, string | number>) => {
      const keys = key.split('.');
      let value: unknown = messages;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[k];
        } else {
          value = undefined;
        }
      }
      if (typeof value !== 'string') return key;
      
      if (variables) {
        return Object.entries(variables).reduce((acc, [name, val]) => {
          return acc.replace(new RegExp(`{{${name}}}`, 'g'), String(val));
        }, value);
      }
      return value;
    }
  };
}
