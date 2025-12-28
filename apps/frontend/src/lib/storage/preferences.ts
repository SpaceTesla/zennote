type ThemePreference = 'light' | 'dark' | 'system';

export type UserPreferences = {
  theme: ThemePreference;
  notesPerPage: number;
  defaultSort: 'created_at' | 'updated_at' | 'title';
  defaultSortOrder: 'asc' | 'desc';
};

const PREFS_KEY = 'user_preferences';

const defaultPrefs: UserPreferences = {
  theme: 'system',
  notesPerPage: 20,
  defaultSort: 'updated_at',
  defaultSortOrder: 'desc',
};

export const preferences = {
  get(): UserPreferences {
    if (typeof window === 'undefined') return defaultPrefs;
    const stored = localStorage.getItem(PREFS_KEY);
    if (!stored) return defaultPrefs;
    try {
      return { ...defaultPrefs, ...JSON.parse(stored) };
    } catch {
      return defaultPrefs;
    }
  },
  set(prefs: Partial<UserPreferences>): void {
    if (typeof window === 'undefined') return;
    const current = this.get();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  },
};


