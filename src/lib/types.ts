export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Snapshot {
  id: number;
  category_id: number;
  amount: number;
  date: string;
  account: string | null;
  created_at: string;
}

export interface SnapshotWithCategory extends Snapshot {
  category_name: string;
  category_color: string;
  category_icon: string;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  [key: string]: string | number;
}

export interface CategoryTotal {
  category_id: number;
  category_name: string;
  category_color: string;
  total: number;
}
