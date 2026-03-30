import React, { useState, useEffect } from 'react';
import { Save, Settings, Globe, Info } from 'lucide-react';
import { settingsApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import { ImageUpload } from './ImageUpload';

export const AdminSettings: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [settings, setSettings] = useState({
    storeName: 'Pujnam Store',
    storeEmail: 'info@pujnamstore.com',
    storePhone: '+91 98765 43210',
    storeAddress: '',
    city: '',
    state: '',
    pincode: '',
    logo: 'https://images.pexels.com/photos/8989571/pexels-photo-8989571.jpeg',
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await settingsApi.get();
      if (error) {
        console.error('Failed to load settings:', error);
        return;
      }
      if (data?.settings) {
        setSettings({
          storeName: data.settings.storeName || 'Pujnam Store',
          storeEmail: data.settings.storeEmail || 'info@pujnamstore.com',
          storePhone: data.settings.storePhone || '+91 98765 43210',
          storeAddress: data.settings.storeAddress || '',
          city: data.settings.city || '',
          state: data.settings.state || '',
          pincode: data.settings.pincode || '',
          logo: data.settings.logo || 'https://images.pexels.com/photos/8989571/pexels-photo-8989571.jpeg',
          tagline: data.settings.tagline || 'AAPKI AASTHA KA SAARTHI',
          facebookUrl: data.settings.facebookUrl || '',
          instagramUrl: data.settings.instagramUrl || '',
          twitterUrl: data.settings.twitterUrl || '',
          currency: data.settings.currency || 'INR',
          taxRate: data.settings.taxRate || 18,
          freeShippingThreshold: data.settings.freeShippingThreshold || 499,
          shippingCost: data.settings.shippingCost || 50,
          lowStockThreshold: data.settings.lowStockThreshold || 10,
          enableReviews: data.settings.enableReviews !== undefined ? data.settings.enableReviews : true,
          enableNewsletter: data.settings.enableNewsletter !== undefined ? data.settings.enableNewsletter : true,
          maintenanceMode: data.settings.maintenanceMode || false,
          legalCompanyName: data.settings.legalCompanyName || '',
          legalBusinessName: data.settings.legalBusinessName || '',
          legalEntityType: data.settings.legalEntityType || '',
          legalWebsiteUrl: data.settings.legalWebsiteUrl || '',
          legalEffectiveDate: data.settings.legalEffectiveDate || '',
          legalRegisteredAddress: data.settings.legalRegisteredAddress || '',
          legalOperatingAddress: data.settings.legalOperatingAddress || '',
          legalSupportEmail: data.settings.legalSupportEmail || '',
          legalSupportPhone: data.settings.legalSupportPhone || '',
          legalGrievanceOfficerName: data.settings.legalGrievanceOfficerName || '',
          legalGrievanceOfficerEmail: data.settings.legalGrievanceOfficerEmail || '',
          legalGrievanceOfficerPhone: data.settings.legalGrievanceOfficerPhone || '',
          legalGstin: data.settings.legalGstin || '',
          legalCin: data.settings.legalCin || '',
          termsCustomIntro: data.settings.termsCustomIntro || '',
          termsCustomOrders: data.settings.termsCustomOrders || '',
          termsCustomUsage: data.settings.termsCustomUsage || '',
          termsCustomLiability: data.settings.termsCustomLiability || '',
          refundCustomOverview: data.settings.refundCustomOverview || '',
          refundCustomEligibility: data.settings.refundCustomEligibility || '',
          refundCustomProcess: data.settings.refundCustomProcess || '',
          refundCustomExceptions: data.settings.refundCustomExceptions || '',
          privacyCustomOverview: data.settings.privacyCustomOverview || '',
          privacyCustomCollection: data.settings.privacyCustomCollection || '',
          privacyCustomUsage: data.settings.privacyCustomUsage || '',
          privacyCustomSharing: data.settings.privacyCustomSharing || '',
          privacyCustomRights: data.settings.privacyCustomRights || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await settingsApi.update(settings);
      if (error) {
        showError('Failed to save settings: ' + error);
        return;
      }
      showSuccess('Settings saved successfully! Website will update automatically.');
      // Refresh the page to show updated settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      showError('Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Settings</h1>
          <p className="text-gray-600">Manage your store settings and configuration</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="text-[#FF8C00]" size={24} />
            <h2 className="text-xl font-bold text-[#1A1A1A]">Store Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Store Logo</label>
              <div className="mb-3 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <Info size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  Use a <strong>square image</strong>. Recommended size: <strong>200×200 px</strong> or 256×256 px. Displayed in the header; large files may slow loading.
                </span>
              </div>
              <ImageUpload
                value={settings.logo || ''}
                onChange={(url) => setSettings({ ...settings, logo: typeof url === 'string' ? url : url[0] || '' })}
                multiple={false}
                label=""
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="AAPKI AASTHA KA SAARTHI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Address
              </label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={settings.pincode}
                  onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="text-[#FF8C00]" size={24} />
            <h2 className="text-xl font-bold text-[#1A1A1A]">Store Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Free Shipping Above (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shippingCost}
                  onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableReviews}
                  onChange={(e) => setSettings({ ...settings, enableReviews: e.target.checked })}
                  className="w-5 h-5 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                />
                <span className="text-sm font-semibold text-[#1A1A1A]">Enable Product Reviews</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableNewsletter}
                  onChange={(e) => setSettings({ ...settings, enableNewsletter: e.target.checked })}
                  className="w-5 h-5 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                />
                <span className="text-sm font-semibold text-[#1A1A1A]">Enable Newsletter</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-semibold text-red-600">Maintenance Mode</span>
              </label>
            </div>

            <div className="pt-4 border-t mt-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Social Media Links</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.facebookUrl}
                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourpage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={settings.twitterUrl}
                    onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/yourpage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="text-[#FF8C00]" size={24} />
          <h2 className="text-xl font-bold text-[#1A1A1A]">Legal Pages & Company Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Company Details</h3>
            <input type="text" value={settings.legalCompanyName} onChange={(e) => setSettings({ ...settings, legalCompanyName: e.target.value })} placeholder="Legal company name" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
            <input type="text" value={settings.legalBusinessName} onChange={(e) => setSettings({ ...settings, legalBusinessName: e.target.value })} placeholder="Brand / business name" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
            <input type="text" value={settings.legalEntityType} onChange={(e) => setSettings({ ...settings, legalEntityType: e.target.value })} placeholder="Entity type e.g. Proprietorship / Pvt Ltd" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
            <input type="text" value={settings.legalWebsiteUrl} onChange={(e) => setSettings({ ...settings, legalWebsiteUrl: e.target.value })} placeholder="Website URL" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
            <input type="text" value={settings.legalEffectiveDate} onChange={(e) => setSettings({ ...settings, legalEffectiveDate: e.target.value })} placeholder="Effective date" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
            <textarea value={settings.legalRegisteredAddress} onChange={(e) => setSettings({ ...settings, legalRegisteredAddress: e.target.value })} rows={3} placeholder="Registered address" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
            <textarea value={settings.legalOperatingAddress} onChange={(e) => setSettings({ ...settings, legalOperatingAddress: e.target.value })} rows={3} placeholder="Operating address" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={settings.legalSupportEmail} onChange={(e) => setSettings({ ...settings, legalSupportEmail: e.target.value })} placeholder="Support email" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
              <input type="text" value={settings.legalSupportPhone} onChange={(e) => setSettings({ ...settings, legalSupportPhone: e.target.value })} placeholder="Support phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
              <input type="text" value={settings.legalGrievanceOfficerName} onChange={(e) => setSettings({ ...settings, legalGrievanceOfficerName: e.target.value })} placeholder="Grievance officer name" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
              <input type="text" value={settings.legalGrievanceOfficerEmail} onChange={(e) => setSettings({ ...settings, legalGrievanceOfficerEmail: e.target.value })} placeholder="Grievance officer email" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
              <input type="text" value={settings.legalGrievanceOfficerPhone} onChange={(e) => setSettings({ ...settings, legalGrievanceOfficerPhone: e.target.value })} placeholder="Grievance officer phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
              <input type="text" value={settings.legalGstin} onChange={(e) => setSettings({ ...settings, legalGstin: e.target.value })} placeholder="GSTIN" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
            </div>
            <input type="text" value={settings.legalCin} onChange={(e) => setSettings({ ...settings, legalCin: e.target.value })} placeholder="CIN / registration number" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]" />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Terms & Conditions Content</h3>
              <textarea value={settings.termsCustomIntro} onChange={(e) => setSettings({ ...settings, termsCustomIntro: e.target.value })} rows={4} placeholder="Terms introduction" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.termsCustomOrders} onChange={(e) => setSettings({ ...settings, termsCustomOrders: e.target.value })} rows={4} placeholder="Orders, pricing and availability section" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.termsCustomUsage} onChange={(e) => setSettings({ ...settings, termsCustomUsage: e.target.value })} rows={4} placeholder="Website use and customer responsibilities" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.termsCustomLiability} onChange={(e) => setSettings({ ...settings, termsCustomLiability: e.target.value })} rows={4} placeholder="Payments, liability and governing law" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Refund & Cancellation Content</h3>
              <textarea value={settings.refundCustomOverview} onChange={(e) => setSettings({ ...settings, refundCustomOverview: e.target.value })} rows={4} placeholder="Policy overview" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.refundCustomEligibility} onChange={(e) => setSettings({ ...settings, refundCustomEligibility: e.target.value })} rows={4} placeholder="Cancellation and eligibility rules" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.refundCustomProcess} onChange={(e) => setSettings({ ...settings, refundCustomProcess: e.target.value })} rows={4} placeholder="Refund process and timelines" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.refundCustomExceptions} onChange={(e) => setSettings({ ...settings, refundCustomExceptions: e.target.value })} rows={4} placeholder="Exceptions and important notes" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Privacy Policy Content</h3>
              <textarea value={settings.privacyCustomOverview} onChange={(e) => setSettings({ ...settings, privacyCustomOverview: e.target.value })} rows={4} placeholder="Information we collect" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.privacyCustomCollection} onChange={(e) => setSettings({ ...settings, privacyCustomCollection: e.target.value })} rows={4} placeholder="Why we collect and use data" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.privacyCustomUsage} onChange={(e) => setSettings({ ...settings, privacyCustomUsage: e.target.value })} rows={4} placeholder="Security, retention and protection" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.privacyCustomSharing} onChange={(e) => setSettings({ ...settings, privacyCustomSharing: e.target.value })} rows={4} placeholder="Cookies, sharing and grievance contact" className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
              <textarea value={settings.privacyCustomRights} onChange={(e) => setSettings({ ...settings, privacyCustomRights: e.target.value })} rows={4} placeholder="User rights and choices" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
