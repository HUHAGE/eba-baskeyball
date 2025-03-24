export interface Player {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  members: Player[];
}

export interface GroupingHistory {
  id: number;
  date: string;
  groups: Group[];
}

export interface AppState {
  isDark: boolean;
  lastGrouping: Group[] | null;
} 