// Cities offered in the location picker. Stored on the user as "City, Egypt",
// the same format pet listings use, so search by city matches both.
export const CITIES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'New Cairo',
  '6th of October',
  'Mansoura',
  'Tanta',
  'Zagazig',
  'Ismailia',
  'Port Said',
  'Suez',
  'Damietta',
  'Fayoum',
  'Beni Suef',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
  'Hurghada',
  'Sharm El Sheikh',
  'Kafr El Sheikh',
].map((city) => ({ city, label: `${city}, Egypt` }));

/** "Cairo, Egypt" -> "Cairo" */
export const cityOf = (location = '') => location.split(',')[0].trim();
