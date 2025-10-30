export const getActorName = (): string => {
  if (typeof window === 'undefined') return 'Anonim';
  const v = localStorage.getItem('actorName');
  return (v && v.trim()) ? v.trim() : 'Anonim';
};

export const setActorName = (name: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('actorName', name || '');
};

