import { ApiResponse, ListData } from './types';

export const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwtwJmT3MCVNchgCXfLqR76ktHEbj_19j2ALj4Kl-wIqBUK73a73JRE4qeTwQiTe4PF/exec';

// Allow overriding the API URL via local storage if users change Google Apps Script endpoints
export function getApiUrl(): string {
  try {
    const custom = localStorage.getItem('rp_custom_api_url');
    if (custom && custom.trim().startsWith('http')) return custom.trim();
  } catch (e) {}
  return DEFAULT_API_URL;
}

export function setApiUrl(url: string) {
  try {
    if (url) localStorage.setItem('rp_custom_api_url', url.trim());
    else localStorage.removeItem('rp_custom_api_url');
  } catch (e) {}
}

export async function fetchLetters(): Promise<ListData> {
  const url = `${getApiUrl()}?action=list`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
    const json: ApiResponse<ListData> = await res.json();
    if (!json.ok || !json.data) throw new Error(json.error || '편지 목록을 불러오지 못했습니다.');
    return json.data;
  } catch (err: any) {
    // If request fails (e.g. CORS on some setups), check if we have offline/sample cache
    console.warn('API Error, trying fallback or throwing:', err);
    throw err;
  }
}

export async function sendPostApi<T = any>(action: string, payload: any): Promise<T> {
  const url = getApiUrl();
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new Error(`서버 전송 실패 (${res.status})`);
  const json: ApiResponse<T> = await res.json();
  if (!json.ok) throw new Error(json.error || '처리하지 못했습니다.');
  return json.data as T;
}
