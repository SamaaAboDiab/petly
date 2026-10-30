import PageTransition from '@/components/layout/PageTransition';
import PasswordSettings from '@/components/settings/PasswordSettings';
import { AppearanceSettings, NotificationSettings } from '@/components/settings/PreferenceSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Password' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
];

export default function SettingsPage() {
  return (
    <PageTransition>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Settings</h1>
      <p className="mt-1 text-muted">Manage your profile, security and preferences.</p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Settings sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:px-0">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="focus-ring shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="max-w-3xl space-y-6">
          <ProfileSettings />
          <PasswordSettings />
          <NotificationSettings />
          <AppearanceSettings />
        </div>
      </div>
    </PageTransition>
  );
}
