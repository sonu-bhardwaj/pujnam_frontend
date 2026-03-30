import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  city: string;
  state: string;
  pincode: string;
  logo: string;
  tagline: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingCost: number;
  lowStockThreshold: number;
  enableReviews: boolean;
  enableNewsletter: boolean;
  maintenanceMode: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  legalCompanyName: string;
  legalBusinessName: string;
  legalEntityType: string;
  legalWebsiteUrl: string;
  legalEffectiveDate: string;
  legalRegisteredAddress: string;
  legalOperatingAddress: string;
  legalSupportEmail: string;
  legalSupportPhone: string;
  legalGrievanceOfficerName: string;
  legalGrievanceOfficerEmail: string;
  legalGrievanceOfficerPhone: string;
  legalGstin: string;
  legalCin: string;
  termsCustomIntro: string;
  termsCustomOrders: string;
  termsCustomUsage: string;
  termsCustomLiability: string;
  refundCustomOverview: string;
  refundCustomEligibility: string;
  refundCustomProcess: string;
  refundCustomExceptions: string;
  privacyCustomOverview: string;
  privacyCustomCollection: string;
  privacyCustomUsage: string;
  privacyCustomSharing: string;
  privacyCustomRights: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  storeName: 'Pujnam Store',
  storeEmail: 'info@pujnamstore.com',
  storePhone: '+91 98765 43210',
  storeAddress: '',
  city: '',
  state: '',
  pincode: '',
  logo: 'https://res.cloudinary.com/dstp0kfk9/image/upload/v1770635258/pujnam-store/h8mgsycgfxjjkpy5qrwb.png',
  tagline: 'AAPKI AASTHA KA SAARTHI',
  currency: 'INR',
  taxRate: 18,
  freeShippingThreshold: 499,
  shippingCost: 50,
  lowStockThreshold: 10,
  enableReviews: true,
  enableNewsletter: true,
  maintenanceMode: false,
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  legalCompanyName: '',
  legalBusinessName: '',
  legalEntityType: '',
  legalWebsiteUrl: '',
  legalEffectiveDate: '',
  legalRegisteredAddress: '',
  legalOperatingAddress: '',
  legalSupportEmail: '',
  legalSupportPhone: '',
  legalGrievanceOfficerName: '',
  legalGrievanceOfficerEmail: '',
  legalGrievanceOfficerPhone: '',
  legalGstin: '',
  legalCin: '',
  termsCustomIntro: '',
  termsCustomOrders: '',
  termsCustomUsage: '',
  termsCustomLiability: '',
  refundCustomOverview: '',
  refundCustomEligibility: '',
  refundCustomProcess: '',
  refundCustomExceptions: '',
  privacyCustomOverview: '',
  privacyCustomCollection: '',
  privacyCustomUsage: '',
  privacyCustomSharing: '',
  privacyCustomRights: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      
      if (data.settings) {
        setSettings(data.settings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings: settings || defaultSettings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    return { settings: defaultSettings, loading: false, refreshSettings: async () => {} };
  }
  return context;
};
