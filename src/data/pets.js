// Static, editorial content only. Inventory (pets, sellers, orders) comes from
// the API — see src/services.

const img = (id, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'PawPrint' },
  { id: 'dogs', label: 'Dogs', singular: 'Dog', icon: 'Dog', cover: img('photo-1633722715463-d30f4f325e24', 600) },
  { id: 'cats', label: 'Cats', singular: 'Cat', icon: 'Cat', cover: img('photo-1574158622682-e40e69881006', 600) },
  { id: 'birds', label: 'Birds', singular: 'Bird', icon: 'Bird', cover: img('photo-1552728089-57bdde30beb3', 600) },
];

/** `id` is the pet's slug on the API, so breed cards link straight to a listing. */
export const BREEDS = [
  { id: 'golden-retriever', name: 'Golden Retriever', category: 'Dogs', image: img('photo-1760615302756-1841ba82573e', 400) },
  { id: 'persian-cat', name: 'Persian', category: 'Cats', image: img('photo-1660983947244-021f303fdd6b', 400) },
  { id: 'budgie', name: 'Budgie', category: 'Birds', image: img('photo-1522858547137-f1dcec554f55', 400) },
  { id: 'german-shepherd', name: 'German Shepherd', category: 'Dogs', image: img('photo-1589941013453-ec89f33b5e95', 400) },
  { id: 'siberian-husky', name: 'Husky', category: 'Dogs', image: img('photo-1605568427561-40dd23c2acea', 400) },
  { id: 'maine-coon', name: 'Maine Coon', category: 'Cats', image: img('photo-1615796153287-98eacf0abb13', 400) },
  { id: 'african-grey-parrot', name: 'African Grey', category: 'Birds', image: img('photo-1762849283622-a0d2beeaa4f6', 400) },
  { id: 'umbrella-cockatoo', name: 'Cockatoo', category: 'Birds', image: img('photo-1782729849393-21a2d5c0d51b', 400) },
  { id: 'sun-conure', name: 'Sun Conure', category: 'Birds', image: img('photo-1709025219993-37d2a0a70031', 400) },
  { id: 'cockatiel', name: 'Cockatiel', category: 'Birds', image: img('photo-1759384278288-14f680d9cae7', 400) },
];

/** Marketing visuals for the splash and auth screens (shown before login). */
export const SHOWCASE_PETS = [
  { id: 'golden-retriever', name: 'Golden Retriever', price: 8500, image: img('photo-1760615302756-1841ba82573e', 500) },
  { id: 'british-shorthair', name: 'British Shorthair', price: 6200, image: img('photo-1629624467541-f73ef8f12df2', 500) },
  { id: 'scarlet-macaw', name: 'Scarlet Macaw', price: 3500, image: img('photo-1544923408-75c5cef46f14', 500) },
];

/** Mirrors DELIVERY_FEE on the server; used only for the cart preview. */
export const DELIVERY_FEE = 100;

export const HEALTH_FEATURES = [
  { key: 'vaccinated', label: 'Vaccinated' },
  { key: 'dewormed', label: 'Dewormed' },
  { key: 'healthCheck', label: 'Health Check' },
  { key: 'pedigree', label: 'Pedigree' },
];
