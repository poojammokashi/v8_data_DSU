import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from 'react-icons/hi2';
import Card from '@components/ui/Card';
import Switch from '@components/ui/Switch';
import Select from '@components/ui/Select';
import { useThemeStore } from '@store/themeStore';
import { THEME } from '@config/constants';
import { cn } from '@utils/cn';

const THEME_OPTIONS = [
  { value: THEME.LIGHT, label: 'Light', icon: HiOutlineSun },
  { value: THEME.DARK, label: 'Dark', icon: HiOutlineMoon },
  { value: THEME.SYSTEM, label: 'System', icon: HiOutlineComputerDesktop },
];

const LANGUAGE_OPTIONS = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'hi-IN', label: 'Hindi' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    weeklyDigest: true,
    billingReminders: true,
    productUpdates: false,
  });

  function updateNotification(key, value) {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success('Preference saved');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">Settings</h1>
        <p className="text-sm text-ink-muted mt-1">Manage appearance, notifications and regional preferences.</p>
      </div>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Appearance</Card.Title>
            <Card.Description>Choose how Voltura looks on your device.</Card.Description>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
                  theme === value
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-500/5'
                    : 'border-border hover:border-ink-faint'
                )}
              >
                <Icon className={cn('h-5 w-5', theme === value ? 'text-amber-500' : 'text-ink-muted')} />
                <span className={cn('text-xs font-medium', theme === value ? 'text-ink' : 'text-ink-muted')}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Notifications</Card.Title>
            <Card.Description>Choose what you want to be alerted about.</Card.Description>
          </div>
        </Card.Header>
        <Card.Body className="space-y-5">
          <Switch
            label="Critical alerts"
            description="Peak demand breaches, settlement failures"
            checked={notifications.criticalAlerts}
            onChange={(v) => updateNotification('criticalAlerts', v)}
          />
          <Switch
            label="Weekly digest"
            description="Summary of generation & consumption trends"
            checked={notifications.weeklyDigest}
            onChange={(v) => updateNotification('weeklyDigest', v)}
          />
          <Switch
            label="Billing reminders"
            description="Upcoming due dates and settlement status"
            checked={notifications.billingReminders}
            onChange={(v) => updateNotification('billingReminders', v)}
          />
          <Switch
            label="Product updates"
            description="New features and platform announcements"
            checked={notifications.productUpdates}
            onChange={(v) => updateNotification('productUpdates', v)}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Regional</Card.Title>
            <Card.Description>Language and date/number formatting.</Card.Description>
          </div>
        </Card.Header>
        <Card.Body>
          <Select label="Language" defaultValue="en-IN" options={LANGUAGE_OPTIONS} containerClassName="max-w-xs" />
        </Card.Body>
      </Card>
    </div>
  );
}
