import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../utils/theme';

export default function TransactionsScreen() {
  const { transactions, deleteTransaction, getCategoryById, persons } = useApp();
  const [filter, setFilter] = useState('alle'); // alle | income | expense
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return transactions
      .filter(t => filter === 'alle' || t.type === filter)
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [transactions, filter, search]);

  function confirmDelete(id, title) {
    Alert.alert('Löschen', `"${title}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Suchen..."
        placeholderTextColor={COLORS.muted}
      />

      {/* Filter */}
      <View style={styles.filterRow}>
        {[['alle', 'Alle'], ['expense', 'Ausgaben'], ['income', 'Einnahmen']].map(([v, l]) => (
          <TouchableOpacity
            key={v}
            style={[styles.filterBtn, filter === v && styles.filterBtnActive]}
            onPress={() => setFilter(v)}
          >
            <Text style={[styles.filterTxt, filter === v && styles.filterTxtActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.count}>{filtered.length} Buchungen</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TxCard
            tx={item}
            cat={getCategoryById(item.categoryId)}
            person={persons.find(p => p.id === item.personId)}
            onDelete={() => confirmDelete(item.id, item.title)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Keine Buchungen gefunden</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function TxCard({ tx, cat, person, onDelete }) {
  const d = new Date(tx.date).toLocaleDateString('de', { day: '2-digit', month: '2-digit', year: '2-digit' });
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: cat.color + '22' }]}>
        <Text style={styles.emoji}>{cat.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{tx.title}</Text>
        <Text style={styles.meta}>{d} · {cat.name} · {person?.name || ''}</Text>
        {tx.note ? <Text style={styles.note}>{tx.note}</Text> : null}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: tx.type === 'income' ? COLORS.green : COLORS.red }]}>
          {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)} €
        </Text>
        <TouchableOpacity onPress={onDelete} style={styles.delBtn}>
          <Text style={styles.delTxt}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  search: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, padding: 12, color: COLORS.text, marginBottom: 12,
  },
  filterRow:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive:{ backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterTxt:      { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterTxtActive:{ color: '#000' },
  count:          { color: COLORS.muted, fontSize: 12, marginBottom: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  icon:   { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji:  { fontSize: 22 },
  info:   { flex: 1 },
  title:  { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  meta:   { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  note:   { color: COLORS.muted, fontSize: 11, marginTop: 3, fontStyle: 'italic' },
  right:  { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700' },
  delBtn: { padding: 4 },
  delTxt: { color: COLORS.muted, fontSize: 14 },
  empty:  { color: COLORS.muted, textAlign: 'center', padding: 40 },
});
