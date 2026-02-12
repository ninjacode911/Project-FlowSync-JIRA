import React, { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { fetchAdminSettings, updateAdminSettings, WorkspaceSettings } from '../../src/services/adminService';

type Tab = 'general' | 'security' | 'email' | 'issues';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>('general');
  const [error, setError] = useState('');

  // Local form state
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [language, setLanguage] = useState('');
  const [defaultRole, setDefaultRole] = useState('');
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(false);
  const [requireNumber, setRequireNumber] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [twoFactor, setTwoFactor] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [issueKeyFormat, setIssueKeyFormat] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetchAdminSettings();
        setSettings(s);
        setName(s.name || '');
        setTimezone(s.timezone || 'UTC');
        setLanguage(s.language || 'en');
        setDefaultRole(s.defaultRole || 'MEMBER');
        setMinLength(s.passwordPolicy?.minLength || 8);
        setRequireUppercase(s.passwordPolicy?.requireUppercase || false);
        setRequireNumber(s.passwordPolicy?.requireNumber || false);
        setSessionTimeout(s.sessionTimeoutMinutes || 60);
        setTwoFactor(s.twoFactorRequired || false);
        setSmtpHost(s.email?.smtpHost || '');
        setSmtpPort(s.email?.smtpPort || 587);
        setSmtpUser(s.email?.smtpUser || '');
        setFromEmail(s.email?.fromEmail || '');
        setFromName(s.email?.fromName || '');
        setIssueKeyFormat(s.issueKeyFormat || 'PROJECT-NUM');
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, any> = {};
      if (tab === 'general') {
        payload.name = name;
        payload.timezone = timezone;
        payload.language = language;
        payload.defaultRole = defaultRole;
      } else if (tab === 'security') {
        payload.passwordPolicy = { minLength, requireUppercase, requireNumber };
        payload.sessionTimeoutMinutes = sessionTimeout;
        payload.twoFactorRequired = twoFactor;
      } else if (tab === 'email') {
        payload.email = { smtpHost, smtpPort, smtpUser, fromEmail, fromName };
      } else if (tab === 'issues') {
        payload.issueKeyFormat = issueKeyFormat;
      }
      await updateAdminSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error saving settings');
    }
    setSaving(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'security', label: 'Security' },
    { key: 'email', label: 'Email' },
    { key: 'issues', label: 'Issues' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
          <p className="text-slate-500 mt-1">Configure global workspace preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {tab === 'general' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Role for New Users</label>
              <select value={defaultRole} onChange={e => setDefaultRole(e.target.value)} className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
              </select>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Password Length</label>
              <input type="number" min={6} max={128} value={minLength} onChange={e => setMinLength(Number(e.target.value))} className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={requireUppercase} onChange={e => setRequireUppercase(e.target.checked)} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">Require uppercase letter</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={requireNumber} onChange={e => setRequireNumber(e.target.checked)} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">Require number</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (minutes)</label>
              <input type="number" min={5} max={1440} value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={twoFactor} onChange={e => setTwoFactor(e.target.checked)} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">Require two-factor authentication</span>
            </label>
          </div>
        )}

        {tab === 'email' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
              <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.example.com" className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
              <input type="number" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Username</label>
              <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Email</label>
              <input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="noreply@flowsync.com" className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Name</label>
              <input type="text" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="FlowSync" className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        )}

        {tab === 'issues' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Key Format</label>
              <input type="text" value={issueKeyFormat} onChange={e => setIssueKeyFormat(e.target.value)} placeholder="PROJECT-NUM" className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <p className="text-xs text-slate-400 mt-1">Used as template for auto-generated issue keys.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
