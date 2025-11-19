import { Location } from '@/types/database';

/**
 * Calculate the midpoint between two geographic locations
 * Uses the geographic midpoint formula for latitude/longitude
 */
export function calculateMidpoint(location1: Location, location2: Location): Location {
  const lat1 = toRadians(location1.latitude);
  const lon1 = toRadians(location1.longitude);
  const lat2 = toRadians(location2.latitude);
  const lon2 = toRadians(location2.longitude);

  const dLon = lon2 - lon1;

  const bx = Math.cos(lat2) * Math.cos(dLon);
  const by = Math.cos(lat2) * Math.sin(dLon);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by)
  );

  const lon3 = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  return {
    latitude: toDegrees(lat3),
    longitude: toDegrees(lon3),
  };
}

/**
 * Calculate the distance between two points using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(location1: Location, location2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(location2.latitude - location1.latitude);
  const dLon = toRadians(location2.longitude - location1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(location1.latitude)) *
      Math.cos(toRadians(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Calculate fair meeting point between ride poster's start location and requester's location
 * Returns the midpoint between the two locations
 */
export function calculateMeetingPoint(
  posterStartLocation: Location,
  requesterLocation: Location
): Location {
  return calculateMidpoint(posterStartLocation, requesterLocation);
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

