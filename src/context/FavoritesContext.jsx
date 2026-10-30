import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { favoriteService } from '@/services/favoriteService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const FavoritesContext = createContext(null);

const toggleIn = (list, entity) =>
  list.some((item) => item.id === entity.id)
    ? list.filter((item) => item.id !== entity.id)
    : [entity, ...list];

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id;
  const [pets, setPets] = useState([]);
  const [sellers, setSellers] = useState([]);

  const reload = useCallback(() => {
    favoriteService
      .get()
      .then((data) => {
        setPets(data.pets);
        setSellers(data.sellers);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPets([]);
    setSellers([]);
    if (userId) reload();
  }, [userId, reload]);

  // Hearts flip instantly; if the request fails we flip back and say so.
  const optimisticToggle = useCallback(
    (setList, entity, request) => {
      setList((list) => toggleIn(list, entity));
      request(entity.id).catch((error) => {
        setList((list) => toggleIn(list, entity));
        toast({ title: 'Couldn’t update favorites', description: error.message, variant: 'error' });
      });
    },
    [toast],
  );

  const togglePet = useCallback(
    (pet) => optimisticToggle(setPets, pet, favoriteService.togglePet),
    [optimisticToggle],
  );

  const toggleSeller = useCallback(
    (seller) => optimisticToggle(setSellers, seller, favoriteService.toggleSeller),
    [optimisticToggle],
  );

  const clear = useCallback(
    (type) => {
      (type === 'sellers' ? setSellers : setPets)([]);
      favoriteService.clear(type).catch(reload);
    },
    [reload],
  );

  const value = useMemo(() => {
    const petIds = new Set(pets.map((p) => p.id));
    const sellerIds = new Set(sellers.map((s) => s.id));
    return {
      pets,
      sellers,
      togglePet,
      toggleSeller,
      clear,
      isFavorite: (id) => petIds.has(id),
      isSellerFavorite: (id) => sellerIds.has(id),
    };
  }, [pets, sellers, togglePet, toggleSeller, clear]);

  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}

export function useFavorites() {
  const context = use(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return context;
}
