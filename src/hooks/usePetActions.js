import { useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';

/** Pet actions with user feedback baked in, so components stay declarative. */
export function usePetActions() {
  const { addItem } = useCart();
  const { togglePet, isFavorite } = useFavorites();
  const toast = useToast();

  const addToCart = useCallback(
    async (pet) => {
      // CartContext already reports failures, so only confirm successes here.
      if (await addItem(pet)) {
        toast({ title: 'Added to cart', description: `${pet.name} is waiting for you` });
      }
    },
    [addItem, toast],
  );

  const toggleFavorite = useCallback(
    (pet) => {
      const wasFavorite = isFavorite(pet.id);
      togglePet(pet);
      toast({
        title: wasFavorite ? 'Removed from favorites' : 'Saved to favorites',
        description: pet.name,
        variant: wasFavorite ? 'info' : 'love',
      });
    },
    [isFavorite, togglePet, toast],
  );

  return { addToCart, toggleFavorite, isFavorite };
}
