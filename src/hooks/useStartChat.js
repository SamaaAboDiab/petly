import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/context/ToastContext';

/** Opens (or reuses) a chat with a seller and navigates to it. */
export function useStartChat() {
  const { startChat } = useChat();
  const toast = useToast();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const openChat = useCallback(
    async ({ sellerId, petId }) => {
      setStarting(true);
      try {
        const conversationId = await startChat({ sellerId, petId });
        navigate(`/app/messages/${conversationId}`);
      } catch (error) {
        toast({ title: 'Couldn’t open chat', description: error.message, variant: 'error' });
      } finally {
        setStarting(false);
      }
    },
    [startChat, navigate, toast],
  );

  return { openChat, starting };
}
