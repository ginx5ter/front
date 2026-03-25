import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Save, Link2, Trash2, Copy, Check, Monitor, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/Avatar';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgDesktopInputRef = useRef<HTMLInputElement>(null);
  const bgMobileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBgD, setUploadingBgD] = useState(false);
  const [uploadingBgM, setUploadingBgM] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.users.updateMe({ username: username.trim() });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    field: string,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      await api.users.updateMe({ [field]: data.publicUrl });
      await refreshProfile();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, 'avatars', 'avatar_url', setUploadingAvatar);
  };

  const handleBgChange = (e: ChangeEvent<HTMLInputElement>, mobile: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, 'backgrounds', mobile ? 'bg_mobile_url' : 'bg_desktop_url', mobile ? setUploadingBgM : setUploadingBgD);
  };

  const removeBackground = async (mobile: boolean) => {
    await api.users.updateMe({ [mobile ? 'bg_mobile_url' : 'bg_desktop_url']: null });
    await refreshProfile();
  };

  const copyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-2xl animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-2">Профиль</h1>
      <p className="text-sm text-text-muted mb-8">Настрой свой аккаунт</p>

      <div className="space-y-6">
        {/* Avatar section */}
        <div className="card">
          <h2 className="font-medium text-text-primary mb-4">Аватар</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar profile={profile} size="xl" />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center hover:bg-accent-light transition-all shadow-lg"
              >
                <Camera className="w-3.5 h-3.5 text-bg-primary" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-medium text-text-primary">{profile?.username}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
              {uploadingAvatar && <p className="text-xs text-accent mt-1">Загружается...</p>}
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="card">
          <h2 className="font-medium text-text-primary mb-4">Отображаемое имя</h2>
          <div className="flex gap-3">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Твоё имя"
              className="input-field flex-1"
            />
            <button
              onClick={handleSave}
              disabled={saving || !username.trim()}
              className="btn-primary flex items-center gap-2 px-4"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Сохранено' : 'Сохранить'}
            </button>
          </div>
          {error && <p className="text-sm text-urgency-critical mt-2">{error}</p>}
        </div>

        {/* Background */}
        <div className="card">
          <h2 className="font-medium text-text-primary mb-1">Фон страницы</h2>
          <p className="text-xs text-text-muted mb-4">Только ты будешь видеть свой фон. Для ПК и телефона — отдельно.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Desktop bg */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Monitor className="w-4 h-4" /> Десктоп
              </label>
              <div
                className="relative h-28 rounded-xl border border-dashed border-border overflow-hidden bg-bg-secondary cursor-pointer hover:border-accent/30 transition-all"
                onClick={() => bgDesktopInputRef.current?.click()}
              >
                {profile?.bg_desktop_url ? (
                  <>
                    <img src={profile.bg_desktop_url} alt="bg" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); bgDesktopInputRef.current?.click(); }}
                        className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-all"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); removeBackground(false); }}
                        className="p-2 bg-black/50 rounded-lg hover:bg-urgency-critical/50 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <Camera className="w-6 h-6 text-text-muted" />
                    <span className="text-xs text-text-muted">
                      {uploadingBgD ? 'Загружается...' : 'Выбрать фото'}
                    </span>
                  </div>
                )}
              </div>
              <input ref={bgDesktopInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleBgChange(e, false)} />
            </div>

            {/* Mobile bg */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Smartphone className="w-4 h-4" /> Телефон
              </label>
              <div
                className="relative h-28 rounded-xl border border-dashed border-border overflow-hidden bg-bg-secondary cursor-pointer hover:border-accent/30 transition-all"
                onClick={() => bgMobileInputRef.current?.click()}
              >
                {profile?.bg_mobile_url ? (
                  <>
                    <img src={profile.bg_mobile_url} alt="bg" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); bgMobileInputRef.current?.click(); }}
                        className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-all"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); removeBackground(true); }}
                        className="p-2 bg-black/50 rounded-lg hover:bg-urgency-critical/50 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <Camera className="w-6 h-6 text-text-muted" />
                    <span className="text-xs text-text-muted">
                      {uploadingBgM ? 'Загружается...' : 'Выбрать фото'}
                    </span>
                  </div>
                )}
              </div>
              <input ref={bgMobileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleBgChange(e, true)} />
            </div>
          </div>
        </div>

        {/* Telegram */}
        <div className="card">
          <h2 className="font-medium text-text-primary mb-1 flex items-center gap-2">
            <span>Telegram</span>
            {profile?.telegram_chat_id && (
              <span className="text-xs bg-urgency-low/20 text-urgency-low px-2 py-0.5 rounded-full">Привязан</span>
            )}
          </h2>
          <p className="text-xs text-text-muted mb-4">
            Привяжи Telegram чтобы получать уведомления о дедлайнах и список задач.
          </p>

          <div className="space-y-3">
            <div className="bg-bg-secondary rounded-xl p-4 space-y-2">
              <p className="text-sm text-text-secondary font-medium">Инструкция:</p>
              <ol className="text-sm text-text-muted space-y-1 list-decimal list-inside">
                <li>Открой бота в Telegram</li>
                <li>Отправь команду: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">/link {user?.id}</code></li>
              </ol>
            </div>

            <div>
              <p className="text-xs text-text-muted mb-1.5">Твой User ID</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-bg-secondary rounded-lg px-3 py-2.5 text-sm text-text-secondary font-mono truncate border border-border">
                  {user?.id}
                </code>
                <button onClick={copyUserId} className="btn-ghost px-3">
                  {copied ? <Check className="w-4 h-4 text-urgency-low" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!profile?.telegram_chat_id && (
              <a
                href="https://t.me/YourBotUsername"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Открыть бота в Telegram
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
