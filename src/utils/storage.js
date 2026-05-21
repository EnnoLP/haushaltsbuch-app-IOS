import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: '@hb_transactions',
  CATEGORIES: '@hb_categories',
  RECURRING: '@hb_recurring',
  SAVINGS: '@hb_savings',
  PERSONS: '@hb_persons',
};

export const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Miete',        icon: '🏠', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Lebensmittel', icon: '🛒', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Auto',         icon: '🚗', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Freizeit',     icon: '🎮', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Restaurant',   icon: '🍕', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: 'Gesundheit',   icon: '💊', color: '#DDA0DD', type: 'expense' },
  { id: '7', name: 'Kleidung',     icon: '👕', color: '#98D8C8', type: 'expense' },
  { id: '8', name: 'Abos',         icon: '📱', color: '#F7DC6F', type: 'expense' },
  { id: '9', name: 'Gehalt',       icon: '💰', color: '#58D68D', type: 'income' },
  { id: '10', name: 'Sonstiges',   icon: '📦', color: '#AEB6BF', type: 'both' },
];

export const DEFAULT_PERSONS = [
  { id: '1', name: 'Person 1', color: '#00E5FF', avatar: '👤' },
  { id: '2', name: 'Person 2', color: '#7B2FFF', avatar: '👥' },
];

async function load(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function save(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const Storage = {
  getTransactions:  () => load(KEYS.TRANSACTIONS, []),
  saveTransactions: (v) => save(KEYS.TRANSACTIONS, v),

  getCategories:    () => load(KEYS.CATEGORIES, DEFAULT_CATEGORIES),
  saveCategories:   (v) => save(KEYS.CATEGORIES, v),

  getRecurring:     () => load(KEYS.RECURRING, []),
  saveRecurring:    (v) => save(KEYS.RECURRING, v),

  getSavings:       () => load(KEYS.SAVINGS, []),
  saveSavings:      (v) => save(KEYS.SAVINGS, v),

  getPersons:       () => load(KEYS.PERSONS, DEFAULT_PERSONS),
  savePersons:      (v) => save(KEYS.PERSONS, v),
};
