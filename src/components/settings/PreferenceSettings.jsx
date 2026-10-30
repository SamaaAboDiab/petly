import { Bell, Moon, Palette } from 'lucide-react';
import { useState } from 'react';
import Switch from '@/components/ui/Switch';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { accountService } from '@/services/accountService';
import SettingsCard from './SettingsCard';

const GROUPS = [
  { key: 'orders', title: 'Orders & sales', text: 'Order confirmations and when someone buys your pet' },
  { key: 'activity', title: 'Saves & follows', text: 'When people save your listings or follow you' },
  { key: 'account', title: 'Account', text: 'Verification and important account updates' },
];

function Row({ title, text, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-muted">{text}</p>
      </div>
      {children}
    </div>
  );
}

export function NotificationSettings() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(null);
  const prefs = user.preferences?.notifications ?? {};

  // Saves each switch immediately; the UI flips first, then confirms.
  const toggle = async (key, value) => {
    setSaving(key);
    updateUser({ ...user, preferences: { notifications: { ...prefs, [key]: value } } });
    try {
      updateUser(await accountService.updatePreferences({ [key]: value }));
    } catch (error) {
      updateUser(user);
      toast({ title: 'Couldn’t save preference', description: error.message, variant: 'error' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <SettingsCard id="notifications" icon={Bell} title="Notifications" description="Choose what Petly tells you about." delay={0.1}>
      <div className="divide-y divide-line">
        {GROUPS.map(({ key, title, text }) => (
          <Row key={key} title={title} text={text}>
            <Switch checked={prefs[key] !== false} onChange={(v) => toggle(key, v)} disabled={saving === key} label={title} />
          </Row>
        ))}
      </div>
    </SettingsCard>
  );
}

export function AppearanceSettings() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <SettingsCard id="appearance" icon={Palette} title="Appearance" delay={0.15}>
      <Row title="Dark mode" text="Easier on the eyes at night. Saved on this device.">
        <span className="flex items-center gap-3">
          <Moon className="size-4 text-muted" />
          <Switch checked={isDark} onChange={toggleTheme} label="Dark mode" />
        </span>
      </Row>
    </SettingsCard>
  );
}
