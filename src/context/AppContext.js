import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { DEFAULT_CATEGORIES, DEFAULT_PERSONS } from '../utils/storage';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [householdId, setHouseholdId] = useState(null);
  const [householdCode, setHouseholdCode] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories,   setCategories]   = useState(DEFAULT_CATEGORIES);
  const [recurring,    setRecurring]     = useState([]);
  const [savings,      setSavings]       = useState([]);
  const [persons,      setPersons]       = useState(DEFAULT_PERSONS);
  const [loaded,       setLoaded]        = useState(false);
  const subs = useRef([]);

  // Restore household from local storage on boot
  useEffect(() => {
    AsyncStorage.multiGet(['@hb_household_id', '@hb_household_code']).then(pairs => {
      const id   = pairs[0][1];
      const code = pairs[1][1];
      if (id && code) joinHousehold(id, code);
      else setLoaded(true);
    });
  }, []);

  async function joinHousehold(id, code) {
    setHouseholdId(id);
    setHouseholdCode(code);
    await AsyncStorage.multiSet([['@hb_household_id', id], ['@hb_household_code', code]]);
    await loadAll(id);
    subscribeRealtime(id);
    setLoaded(true);
  }

  async function leaveHousehold() {
    subs.current.forEach(s => s.unsubscribe());
    subs.current = [];
    await AsyncStorage.multiRemove(['@hb_household_id', '@hb_household_code']);
    setHouseholdId(null);
    setHouseholdCode(null);
    setTransactions([]); setCategories(DEFAULT_CATEGORIES);
    setRecurring([]); setSavings([]); setPersons(DEFAULT_PERSONS);
  }

  async function loadAll(id) {
    const [tx, cats, rec, sav, pers] = await Promise.all([
      supabase.from('transactions').select('*').eq('household_id', id).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('household_id', id),
      supabase.from('recurring').select('*').eq('household_id', id),
      supabase.from('savings').select('*').eq('household_id', id),
      supabase.from('persons').select('*').eq('household_id', id),
    ]);
    if (tx.data?.length)   setTransactions(tx.data);
    if (cats.data?.length) setCategories(cats.data);
    if (rec.data?.length)  setRecurring(rec.data);
    if (sav.data?.length)  setSavings(sav.data);
    if (pers.data?.length) setPersons(pers.data);
  }

  function subscribeRealtime(id) {
    subs.current.forEach(s => s.unsubscribe());

    const txSub = supabase.channel('transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `household_id=eq.${id}` },
        () => supabase.from('transactions').select('*').eq('household_id', id).order('created_at', { ascending: false }).then(r => r.data && setTransactions(r.data))
      ).subscribe();

    const savSub = supabase.channel('savings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings', filter: `household_id=eq.${id}` },
        () => supabase.from('savings').select('*').eq('household_id', id).then(r => r.data && setSavings(r.data))
      ).subscribe();

    const recSub = supabase.channel('recurring')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring', filter: `household_id=eq.${id}` },
        () => supabase.from('recurring').select('*').eq('household_id', id).then(r => r.data && setRecurring(r.data))
      ).subscribe();

    const persSub = supabase.channel('persons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'persons', filter: `household_id=eq.${id}` },
        () => supabase.from('persons').select('*').eq('household_id', id).then(r => r.data && setPersons(r.data))
      ).subscribe();

    subs.current = [txSub, savSub, recSub, persSub];
  }

  // ── Transactions ──
  const addTransaction = useCallback(async (data) => {
    const tx = { id: uid(), household_id: householdId, created_at: new Date().toISOString(), ...data };
    await supabase.from('transactions').insert(tx);
  }, [householdId]);

  const deleteTransaction = useCallback(async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
  }, []);

  // ── Categories ──
  const addCategory = useCallback(async (cat) => {
    await supabase.from('categories').insert({ id: uid(), household_id: householdId, ...cat });
    const r = await supabase.from('categories').select('*').eq('household_id', householdId);
    if (r.data) setCategories(r.data);
  }, [householdId]);

  // ── Recurring ──
  const addRecurring = useCallback(async (data) => {
    await supabase.from('recurring').insert({ id: uid(), household_id: householdId, ...data });
  }, [householdId]);

  const deleteRecurring = useCallback(async (id) => {
    await supabase.from('recurring').delete().eq('id', id);
  }, []);

  // ── Savings ──
  const addSavingsGoal = useCallback(async (goal) => {
    await supabase.from('savings').insert({ id: uid(), household_id: householdId, saved: 0, ...goal });
  }, [householdId]);

  const updateSavingsGoal = useCallback(async (id, amount) => {
    const goal = savings.find(s => s.id === id);
    if (!goal) return;
    const newSaved = Math.min(goal.saved + amount, goal.target);
    await supabase.from('savings').update({ saved: newSaved }).eq('id', id);
  }, [savings]);

  const deleteSavingsGoal = useCallback(async (id) => {
    await supabase.from('savings').delete().eq('id', id);
  }, []);

  // ── Persons ──
  const updatePerson = useCallback(async (id, data) => {
    await supabase.from('persons').update(data).eq('id', id);
    const r = await supabase.from('persons').select('*').eq('household_id', householdId);
    if (r.data) setPersons(r.data);
  }, [householdId]);

  // ── Helpers ──
  const getMonthTransactions = useCallback((month, year) =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }), [transactions]);

  const getCategoryById = useCallback((id) =>
    categories.find(c => c.id === id) || { name: 'Unbekannt', icon: '❓', color: '#999' },
  [categories]);

  return (
    <AppContext.Provider value={{
      loaded, householdId, householdCode, joinHousehold, leaveHousehold,
      transactions, addTransaction, deleteTransaction,
      categories, addCategory,
      recurring, addRecurring, deleteRecurring,
      savings, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      persons, updatePerson,
      getMonthTransactions, getCategoryById,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
