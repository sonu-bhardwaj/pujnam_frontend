import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PanchangData } from '../types';
import { panchangApi } from '../lib/api';

// Helper function to format time from API response (e.g., "6:21:37" to "06:21 AM")
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

// Helper function to get timezone from coordinates
const getTimezone = (longitude: number): number => {
  // Approximate timezone calculation (longitude / 15)
  return Math.round((longitude / 15) * 2) / 2;
};

// Helper function to get current weekday name
const getCurrentWeekday = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Helper function to reverse geocode location name
const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return data.locality || data.city || data.principalSubdivision || 'Unknown Location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return 'Unknown Location';
  }
};

export const PanchangBar: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const currentWeekday = getCurrentWeekday();
  const defaultPanchang: PanchangData = {
    id: 'local',
    date: today,
    tithi: 'Panchami',
    nakshatra: 'Rohini',
    yoga: 'Sukarma',
    karana: 'Kintughna',
    paksha: 'Shukla',
    vaar: currentWeekday,
    sunrise: '06:10 AM',
    sunset: '05:45 PM',
    moonrise: '07:39:56 AM',
    moonset: '06:18:40 PM',
    created_at: today,
  };

  const [panchang, setPanchang] = useState<PanchangData>(defaultPanchang);
  const [location, setLocation] = useState('Dadri');
  const [loading, setLoading] = useState(false);
  const [, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    const fetchPanchangFromLocation = async () => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        // Fallback to default panchang
        return;
      }

      setLoading(true);

      try {
        // Request location permission
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setLocationPermission('granted');
            const { latitude, longitude } = position.coords;

            // Get location name
            const locationName = await getLocationName(latitude, longitude);
            setLocation(locationName);

            // Calculate timezone
            const timezone = getTimezone(longitude);

            // Fetch panchang data from API
            try {
              const { data, error } = await panchangApi.fetchFromAPI(latitude, longitude, timezone);

              // If API key not configured, silently use default values
              if (error) {
                const errorMsg = typeof error === 'string' ? error : 'Unknown error';
                if (errorMsg.includes('API key not configured') || errorMsg.includes('not available')) {
                  // Silently use default - don't log
                  setLoading(false);
                  return;
                }
                // Log other errors but don't show to user
                console.warn('Panchang API error:', errorMsg);
                setLoading(false);
                return;
              }

              if (data?.panchang) {
                const p = data.panchang;

                // Get current weekday as fallback
                const currentWeekdayName = getCurrentWeekday();
                
                // Map API response to our PanchangData format
                setPanchang({
                  id: 'api',
                  date: today,
                  tithi: p.tithi?.name || defaultPanchang.tithi,
                  nakshatra: p.nakshatra?.name || defaultPanchang.nakshatra,
                  yoga: p.yoga?.['1']?.name || p.yoga?.['2']?.name || defaultPanchang.yoga,
                  karana: p.karana?.['1']?.name || p.karana?.['2']?.name || defaultPanchang.karana,
                  paksha: p.tithi?.paksha || defaultPanchang.paksha,
                  vaar: p.weekday?.weekday_name || p.weekday?.vedic_weekday_name || currentWeekdayName,
                  location: locationName,
                  sunrise: formatTime(p.sun_rise) || defaultPanchang.sunrise,
                  sunset: formatTime(p.sun_set) || defaultPanchang.sunset,
                  moonrise: p.moon_rise ? formatTime(p.moon_rise) : defaultPanchang.moonrise,
                  moonset: p.moon_set ? formatTime(p.moon_set) : defaultPanchang.moonset,
                  created_at: today,
                });
              }
            } catch (err) {
              // Catch any unexpected errors silently
              // Keep default panchang - don't show error to user
            }
            setLoading(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationPermission('denied');
            setLoading(false);
            // Fallback to default panchang
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } catch (error) {
        console.error('Error in fetchPanchangFromLocation:', error);
        setLoading(false);
      }
    };

    fetchPanchangFromLocation();
  }, []);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        {loading && (
          <div className="text-center text-xs text-gray-500 mb-2">
            Fetching panchang data...
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
          <div className="lg:col-span-3 flex items-center gap-3">
            <span className="font-serif italic text-[#1A1A1A]">Today's Panchang :</span>
            <span className="text-[#1A1A1A]">{formattedDate}</span>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Tithi :</span>
            <span className="text-[#1A1A1A]">{panchang.tithi}</span>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Nakshatra :</span>
            <span className="text-[#1A1A1A]">{panchang.nakshatra}</span>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Karana :</span>
            <span className="text-[#1A1A1A]">{panchang.karana || 'Kintughna'}</span>
          </div>

          <div className="lg:col-span-3 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Sunrise</span>
            <span className="text-[#1A1A1A]">-</span>
            <span className="text-[#1A1A1A]">{panchang.sunrise}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs mt-2">
          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 pr-8 text-[#1A1A1A] focus:outline-none focus:border-[#FF8C00]"
                placeholder="Enter location"
                readOnly
              />
              {location && (
                <button
                  onClick={() => setLocation('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Paksha :</span>
            <span className="text-[#1A1A1A]">{panchang.paksha || 'Shukla'}</span>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Yoga :</span>
            <span className="text-[#1A1A1A]">{panchang.yoga}</span>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Vaar :</span>
            <span className="text-[#1A1A1A]">{panchang.vaar || getCurrentWeekday()}</span>
          </div>

          <div className="lg:col-span-3 flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A]">Sunset</span>
            <span className="text-[#1A1A1A]">-</span>
            <span className="text-[#1A1A1A]">{panchang.sunset}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs mt-2">
          <div className="lg:col-span-3"></div>
          <div className="lg:col-span-6">
            <a href="/festivals" className="text-[#1A1A1A] underline hover:text-[#FF8C00]">
              Festival List
            </a>
          </div>
          <div className="lg:col-span-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1A1A1A]">Moonrise</span>
              <span className="text-[#1A1A1A]">-</span>
              <span className="text-[#1A1A1A]">{panchang.moonrise || '07:39:56 AM'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs mt-2">
          <div className="lg:col-span-9"></div>
          <div className="lg:col-span-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1A1A1A]">Moonset</span>
              <span className="text-[#1A1A1A]">-</span>
              <span className="text-[#1A1A1A]">{panchang.moonset || '06:18:40 PM'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
