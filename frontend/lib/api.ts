const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchBhajans(search?: string, lang?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (lang) params.append('lang', lang);
  
  const res = await fetch(`${API_URL}/bhajans?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch bhajans');
  return res.json();
}

export async function createRoom(creatorName: string) {
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorName }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function getRoom(code: string) {
  const res = await fetch(`${API_URL}/rooms/${code}`);
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
}

export async function addBhajan(data: any) {
  const res = await fetch(`${API_URL}/bhajans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add bhajan');
  return res.json();
}
