import React, { useEffect, useState } from 'react';
import { SettingsService } from '../services/settings';

const AdminLinkPage: React.FC = () => {
  const [status, setStatus] = useState<'idle'|'ok'|'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const k = url.searchParams.get('k') || '';
        if (!k || k.length < 16) {
          setStatus('error');
          setMessage('Geçersiz admin anahtarı.');
          return;
        }
        localStorage.setItem('adminKey', k);
        await SettingsService.setAdminKey(k);
        setStatus('ok');
        setMessage('Admin etkin. Bu cihaz yetkilendirildi.');
      } catch (e) {
        console.error(e);
        setStatus('error');
        setMessage('Admin anahtarı kaydedilemedi.');
      }
    };
    run();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Admin Bağlantısı</h1>
        <p style={{ marginTop: 8, color: status === 'error' ? '#b91c1c' : '#065f46' }}>{message || 'İşleniyor...'}</p>
        {status === 'ok' && (
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>Ana ekrana dön</a>
        )}
      </div>
    </div>
  );
};

export default React.memo(AdminLinkPage);

