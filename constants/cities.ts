// Tel Aviv Metropolitan Area Cities and Popular Destinations

export interface City {
  id: string;
  name: string;
  nameHe: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'neighborhood' | 'venue';
}

export const TEL_AVIV_CITIES: City[] = [
  // Tel Aviv Neighborhoods
  { id: 'tel-aviv-center', name: 'Tel Aviv Center', nameHe: 'מרכז תל אביב', latitude: 32.0853, longitude: 34.7818, type: 'neighborhood' },
  { id: 'ramat-aviv', name: 'Ramat Aviv', nameHe: 'רמת אביב', latitude: 32.1133, longitude: 34.8008, type: 'neighborhood' },
  { id: 'neve-tzedek', name: 'Neve Tzedek', nameHe: 'נווה צדק', latitude: 32.0578, longitude: 34.7619, type: 'neighborhood' },
  { id: 'florentin', name: 'Florentin', nameHe: 'פלורנטין', latitude: 32.0547, longitude: 34.7675, type: 'neighborhood' },
  { id: 'jaffa', name: 'Jaffa', nameHe: 'יפו', latitude: 32.0543, longitude: 34.7516, type: 'neighborhood' },
  { id: 'rothschild', name: 'Rothschild', nameHe: 'רוטשילד', latitude: 32.0644, longitude: 34.7719, type: 'neighborhood' },
  { id: 'dizengoff', name: 'Dizengoff', nameHe: 'דיזנגוף', latitude: 32.0808, longitude: 34.7742, type: 'neighborhood' },
  { id: 'hatikva', name: 'Hatikva', nameHe: 'התקווה', latitude: 32.0478, longitude: 34.7875, type: 'neighborhood' },
  
  // Surrounding Cities
  { id: 'ramat-gan', name: 'Ramat Gan', nameHe: 'רמת גן', latitude: 32.0719, longitude: 34.8242, type: 'city' },
  { id: 'givatayim', name: 'Givatayim', nameHe: 'גבעתיים', latitude: 32.0708, longitude: 34.8111, type: 'city' },
  { id: 'bnei-brak', name: 'Bnei Brak', nameHe: 'בני ברק', latitude: 32.0811, longitude: 34.8339, type: 'city' },
  { id: 'holon', name: 'Holon', nameHe: 'חולון', latitude: 32.0114, longitude: 34.7744, type: 'city' },
  { id: 'bat-yam', name: 'Bat Yam', nameHe: 'בת ים', latitude: 32.0192, longitude: 34.7503, type: 'city' },
  { id: 'herzliya', name: 'Herzliya', nameHe: 'הרצליה', latitude: 32.1656, longitude: 34.8433, type: 'city' },
  { id: 'raanana', name: 'Raanana', nameHe: 'רעננה', latitude: 32.1847, longitude: 34.8708, type: 'city' },
  { id: 'kfar-saba', name: 'Kfar Saba', nameHe: 'כפר סבא', latitude: 32.1758, longitude: 34.9072, type: 'city' },
  { id: 'petah-tikva', name: 'Petah Tikva', nameHe: 'פתח תקווה', latitude: 32.0878, longitude: 34.8878, type: 'city' },
  { id: 'rishon-lezion', name: 'Rishon LeZion', nameHe: 'ראשון לציון', latitude: 31.9642, longitude: 34.8053, type: 'city' },
  { id: 'rehovot', name: 'Rehovot', nameHe: 'רחובות', latitude: 31.8947, longitude: 34.8081, type: 'city' },
  { id: 'netanya', name: 'Netanya', nameHe: 'נתניה', latitude: 32.3333, longitude: 34.8597, type: 'city' },
  
  // Popular Venues & Events
  { id: 'bloomfield-stadium', name: 'Bloomfield Stadium', nameHe: 'אצטדיון בלומפילד', latitude: 32.0628, longitude: 34.7558, type: 'venue' },
  { id: 'menorah-arena', name: 'Menorah Arena', nameHe: 'היכל מנורה', latitude: 32.0564, longitude: 34.7936, type: 'venue' },
  { id: 'yarkon-park', name: 'Yarkon Park', nameHe: 'פארק הירקון', latitude: 32.1047, longitude: 34.8028, type: 'venue' },
  { id: 'ben-gurion-airport', name: 'Ben Gurion Airport', nameHe: 'נמל התעופה בן גוריון', latitude: 32.0114, longitude: 34.8867, type: 'venue' },
  { id: 'tel-aviv-port', name: 'Tel Aviv Port', nameHe: 'נמל תל אביב', latitude: 32.1097, longitude: 34.7997, type: 'venue' },
  { id: 'sarona-market', name: 'Sarona Market', nameHe: 'שרונה מרקט', latitude: 32.0722, longitude: 34.7864, type: 'venue' },
];

export const TAXI_OPTIONS = [
  'Gett',
  'Have a driver',
  'Decide together',
];

export const PAYMENT_OPTIONS = [
  'Bit',
  'PayBox',
  'Cash',
  'Split evenly',
];

export const EVENT_TYPES = [
  { id: 'concert', label: 'Concert', emoji: '🎵' },
  { id: 'soccer', label: 'Soccer Game', emoji: '⚽' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'festival', label: 'Festival', emoji: '🎪' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'bar', label: 'Bar/Club', emoji: '🍺' },
  { id: 'work', label: 'Work/Office', emoji: '💼' },
  { id: 'airport', label: 'Airport', emoji: '✈️' },
  { id: 'other', label: 'Other', emoji: '📍' },
];

export function getCityById(id: string): City | undefined {
  return TEL_AVIV_CITIES.find(city => city.id === id);
}

export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return TEL_AVIV_CITIES.filter(
    city =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.nameHe.includes(query)
  );
}

