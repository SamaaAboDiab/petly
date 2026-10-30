import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Headphones, LifeBuoy, MessageSquareReply, Send } from 'lucide-react';
import { useState } from 'react';
import { FormAlert } from '@/components/auth/AuthParts';
import PageTransition from '@/components/layout/PageTransition';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { useForm } from '@/hooks/useForm';
import { cn } from '@/lib/cn';
import { formatShortDate } from '@/lib/format';
import { rules } from '@/lib/validators';
import { supportService } from '@/services/accountService';

const FAQ = [
  {
    q: 'How do I know a pet is healthy?',
    a: 'Every listing shows its health record: vaccinated, dewormed, vet health check and pedigree. Look for the “Health Checked” badge, and ask the seller for the vet certificate in chat.',
  },
  {
    q: 'What does “Verified seller” mean?',
    a: 'Our team has checked the seller’s identity. Verified sellers show a yellow badge next to their name on listings and in chat.',
  },
  {
    q: 'How do I list my pet?',
    a: 'Tap the “+” button (or “List a Pet” on desktop), add photos, details and health info, then publish. Your listing is live for everyone immediately and you can delete it anytime.',
  },
  {
    q: 'How does delivery work?',
    a: 'After you order, the seller is notified and will message you to arrange a pet-friendly delivery or a visit. A flat EGP 100 delivery fee is added to each order.',
  },
  {
    q: 'Can I use a promo code?',
    a: 'Yes — open “Have a promo code?” in your cart before checking out. The discount is shown in your order summary.',
  },
  {
    q: 'How do I change my password or notifications?',
    a: 'Go to Profile → Settings. You can update your photo, name, password and choose which notifications you receive.',
  },
];

const TOPICS = [
  { value: 'order', label: 'An order' },
  { value: 'listing', label: 'A listing' },
  { value: 'account', label: 'My account' },
  { value: 'payment', label: 'Payment' },
  { value: 'other', label: 'Something else' },
];

const INITIAL = { category: '', subject: '', message: '' };
const SCHEMA = {
  category: [rules.required('Topic')],
  subject: [rules.required('Subject'), rules.minLength(3, 'Subject')],
  message: [rules.minLength(10, 'Message')],
};

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between gap-4 rounded-xl py-4 text-left font-semibold text-ink"
      >
        {q}
        <ChevronDown className={cn('size-5 shrink-0 text-muted transition-transform duration-300', open && 'rotate-180 text-brand-500')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-4 text-sm leading-relaxed text-muted"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketRow({ ticket }) {
  return (
    <li className="rounded-2xl border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{ticket.subject}</p>
          <p className="text-xs text-muted">
            {TOPICS.find((t) => t.value === ticket.category)?.label} • {formatShortDate(ticket.createdAt)}
          </p>
        </div>
        <Badge variant={ticket.status === 'resolved' ? 'success' : 'brand'}>{ticket.status === 'resolved' ? 'Resolved' : 'Open'}</Badge>
      </div>
      {ticket.reply && (
        <p className="mt-3 flex gap-2 rounded-xl bg-surface-2 p-3 text-sm text-ink">
          <MessageSquareReply className="mt-0.5 size-4 shrink-0 text-brand-500" />
          {ticket.reply}
        </p>
      )}
    </li>
  );
}

export default function HelpPage() {
  const toast = useToast();
  const [openFaq, setOpenFaq] = useState(0);
  const [serverError, setServerError] = useState('');
  const { values, field, setField, errors, submitting, handleSubmit, reset } = useForm(INITIAL, SCHEMA);
  const tickets = useAsync(() => supportService.mine(), []);

  const submit = async (payload) => {
    setServerError('');
    try {
      await supportService.create(payload);
      reset();
      tickets.reload();
      toast({ title: 'Message sent to support', description: 'We usually reply within 24 hours' });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <PageTransition>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Help & Support</h1>
      <p className="mt-1 text-muted">Answers to common questions, or send us a message.</p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-ink">
            <LifeBuoy className="size-5 text-brand-500" /> Frequently asked
          </h2>
          {FAQ.map((item, index) => (
            <FaqItem key={item.q} {...item} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? -1 : index)} />
          ))}
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-ink">
              <Headphones className="size-5 text-brand-500" /> Contact support
            </h2>
            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
              <FormAlert message={serverError} />
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-ink">What’s it about?</legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.value}
                      type="button"
                      aria-pressed={values.category === topic.value}
                      onClick={() => setField('category', topic.value)}
                      className={cn(
                        'focus-ring rounded-xl border px-3.5 py-2 text-sm font-semibold transition',
                        values.category === topic.value
                          ? 'border-brand-400 bg-brand-400 text-on-brand'
                          : 'border-line text-muted hover:border-brand-300 hover:text-ink',
                      )}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="mt-1.5 text-xs font-medium text-red-500">Please choose a topic</p>}
              </fieldset>
              <Input label="Subject" placeholder="Short summary" {...field('subject')} />
              <Input as="textarea" label="Message" placeholder="Tell us what happened…" {...field('message')} />
              <div className="flex justify-end">
                <Button type="submit" leftIcon={Send} loading={submitting}>
                  Send message
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7">
            <h2 className="mb-4 text-lg font-bold text-ink">Your requests</h2>
            {tickets.loading && !tickets.data ? (
              <div className="space-y-3">
                <Skeleton className="h-16" rounded="rounded-2xl" />
                <Skeleton className="h-16" rounded="rounded-2xl" />
              </div>
            ) : tickets.data?.length ? (
              <ul className="space-y-3">
                {tickets.data.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">You haven’t contacted support yet.</p>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
