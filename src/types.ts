export interface Letter {
  id: string;
  at: string;
  name: string;
  role: '학생' | '교직원' | '학부모' | string;
  grade: number | null;
  classNo: number | null;
  message: string;
}

export interface Settings {
  name: string;
  title: string;
  org: string;
  orgSpaced?: string;
  who: string;
  fullTarget: string;
  deadline: string;
  closed: boolean;
  isDefaultPin?: boolean;
  sheetUrl?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ListData {
  letters: Letter[];
  count: number;
  settings: Settings;
}
