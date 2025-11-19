import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Location as LocationType } from '@/types/database';

export function useLocation() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setLocation({
        latitude,
        longitude,
        address: `${address.street || ''}, ${address.city || ''}, ${address.country || ''}`,
        city: address.city || undefined,
      });
    } catch (err) {
      setError('Failed to get location');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, refetch: getLocation };
}

