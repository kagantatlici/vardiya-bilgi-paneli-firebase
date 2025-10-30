import React, { useEffect, useMemo, useState } from 'react';
import type { AuditFeedItem } from '../services/audit';
import { onAuditFeed } from '../services/audit';
import { callRevertLeave, callHideAudit } from '../services/functions';
import { onHiddenAudits } from '../services/moderation';

type Filter = 'today' | 'yesterday' | 'all';

const withinFilter = (ts: Date, f: Filter) => {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (f === 'all') return true;
  if (f === 'today') {
    return startOfDay(ts).getTime() === startOfDay(now).getTime();
  }
  if (f === 'yesterday') {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return startOfDay(ts).getTime() === startOfDay(y).getTime();
  }
  return true;
};

const AuditLogPanel: React.FC = () => {
  const [items, setItems] = useState<AuditFeedItem[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>('today');
  const [expanded, setExpanded] = useState<boolean>(false);
  const adminKey = typeof window !== 'undefined' ? localStorage.getItem('adminKey') : '';

  useEffect(() => {
    const unsub = onAuditFeed(50, (list) => setItems(list));
    const unsubHidden = onHiddenAudits((paths) => setHidden(paths));
    return () => { unsub(); unsubHidden(); };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (hidden.has(it.path)) return false;
      const ts = (it.ts && (it.ts as any).toDate) ? (it.ts as any).toDate() : new Date();
      return withinFilter(ts, filter);
    });
  }, [items, filter, hidden]);

  const latest = filtered[0];
  const others = filtered.slice(1);

  const canAdmin = !!adminKey;

  const revert = async (auditPath: string) => {
    try {
      await callRevertLeave(auditPath, adminKey || undefined);
      alert('Geri alma isteği gönderildi.');
    } catch (e: any) {
      alert('Geri alma başarısız: ' + (e?.message || 'Bilinmeyen hata'));
    }
  };

  const renderItem = (it: AuditFeedItem) => {
    const ts = (it.ts && (it.ts as any).toDate) ? (it.ts as any).toDate() : new Date();
    const time = ts.toLocaleString('tr-TR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return (
      <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0' }}>
        <div>
          <div style={{ fontSize: 13, color: '#111827' }}>{it.humanLine || 'Değişiklik'}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{time}</div>
        </div>
        {canAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => revert(it.path)}
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
            >
              Geri Al
            </button>
            <button
              onClick={async () => {
                try {
                  await callHideAudit(it.path, adminKey || undefined);
                  alert('Kayıt gizlendi');
                } catch (e: any) {
                  alert('Gizleme başarısız: ' + (e?.message || 'Bilinmeyen hata'));
                }
              }}
              style={{ background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
            >
              Sil
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: 0 }}>Son değişiklikler</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['today','yesterday','all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#ea580c' : '#f3f4f6',
                color: filter === f ? '#fff' : '#374151',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >{f === 'today' ? 'Bugün' : f === 'yesterday' ? 'Dün' : 'Tümü'}</button>
          ))}
        </div>
      </div>
      {latest ? (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
          {renderItem(latest)}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#6b7280' }}>Kayıt yok</div>
      )}
      {others.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
          >
            {expanded ? 'Gizle' : `Önceki kayıtlar (${others.length})`}
          </button>
          {expanded && (
            <div style={{ marginTop: 8, borderTop: '1px solid #e5e7eb' }}>
              {others.map(renderItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AuditLogPanel);
