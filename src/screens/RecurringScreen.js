import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../utils/theme';

const INTERVALS = ['Monatlich', 'Wöchentlich', 'Jährlich'];

export default function RecurringScreen() {
  const { recurring, addRecurring, deleteRecurring, categories, persons } = useApp();
  const [showAdd,    setShowAdd]    = useState(false);
  const [title,      setTitle]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [type,       setType]       = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [personId,   setPersonId]   = useState(persons[0]?.id || '');
  const [interval,   setInterval]   = useState('Monatlich');

  const filteredCats = categories.filter(c => c.type === type || c.type === 'both');

  const totalMonthly = recurring
    .filter(r => r.type === 'expense' && r.interval === 'Monatlich')
    .reduce((s, r) => s + r.amount, 0);

  async function handleAdd() {
    if (!title.trim()) return Alert.alert('Pflichtfeld', 'Bitte einen Titel eingeben.');
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) return Alert.alert('Ungültig', 'Bitte einen gültigen Betrag eingeben.');
    if (!categoryId) return Alert.alert('Pflichtfeld', 'Bitte eine Kategorie wählen.');
    await addRecurring({ title: title.trim(), amount: amt, type, categoryId, personId, interval });
    setTitle(''); setAmount(''); setCategoryId('');
    setShowAdd(false);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Monatliche Fixkosten</Text>
        <Text style={styles.summaryAmount}>{totalMonthly.toFixed(2)} €</Text>
        <Text style={styles.summaryHint}>{recurring.length} wiederkehrende Buchungen</Text>
      </View>

      {/* List */}
      {recurring.map(r => {
        const cat    = categories.find(c => c.id === r.categoryId) || { icon: '📦', color: '#999', name: 'Unbekannt' };
        const person = persons.find(p => p.id === r.personId);
        return (
          <View key={r.id} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: cat.color + '22' }]}>
              <Text style={styles.emoji}>{cat.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{r.title}</Text>
              <Text style={styles.meta}>{r.interval} · {cat.name} · {person?.name}</Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.amount, { color: r.type === 'income' ? COLORS.green : COLORS.red }]}>
                {r.type === 'income' ? '+' : '-'}{r.amount.toFixed(2)} €
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Löschen', `"${r.title}" löschen?`, [
                { text: 'Abbrechen', style: 'cancel' },
                { text: 'Löschen', style: 'destructive', onPress: () => deleteRecurring(r.id) },
              ])}>
                <Text style={styles.delTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {recurring.length === 0 && (
        <Text style={styles.empty}>Noch keine wiederkehrenden Buchungen</Text>
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addTxt}>+ Neue Fixbuchung</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Neue Fixbuchung</Text>

            <View style={styles.typeRow}>
              {['expense', 'income'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && { backgroundColor: t === 'income' ? COLORS.green : COLORS.red }]} onPress={() => { setType(t); setCategoryId(''); }}>
                  <Text style={[styles.typeTxt, type === t && { color: '#000' }]}>{t === 'income' ? '↑ Einnahme' : '↓ Ausgabe'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Titel</Text>
            <TextInput style={styles.modalInput} value={title} onChangeText={setTitle} placeholder="z.B. Miete" placeholderTextColor={COLORS.muted} />

            <Text style={styles.modalLabel}>Betrag (€)</Text>
            <TextInput style={styles.modalInput} value={amount} onChangeText={setAmount} placeholder="0,00" placeholderTextColor={COLORS.muted} keyboardType="decimal-pad" />

            <Text style={styles.modalLabel}>Intervall</Text>
            <View style={styles.chipRow}>
              {INTERVALS.map(iv => (
                <TouchableOpacity key={iv} style={[styles.chip, interval === iv && { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent }]} onPress={() => setInterval(iv)}>
                  <Text style={styles.chipTxt}>{iv}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Person</Text>
            <View style={styles.chipRow}>
              {persons.map(p => (
                <TouchableOpacity key={p.id} style={[styles.chip, personId === p.id && { backgroundColor: p.color + '33', borderColor: p.color }]} onPress={() => setPersonId(p.id)}>
                  <Text style={styles.chipTxt}>{p.avatar} {p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Kategorie</Text>
            <View style={styles.catGrid}>
              {filteredCats.map(cat => (
                <TouchableOpacity key={cat.id} style={[styles.catChip, categoryId === cat.id && { backgroundColor: cat.color + '33', borderColor: cat.color }]} onPress={() => setCategoryId(cat.id)}>
                  <Text>{cat.icon}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text style={{ color: COLORS.muted }}>Abbrechen</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}><Text style={{ color: '#000', fontWeight: '700' }}>Speichern</Text></TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  summaryCard:  { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, alignItems: 'center' },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryAmount:{ color: COLORS.red, fontSize: 36, fontWeight: '900', marginVertical: 6 },
  summaryHint:  { color: COLORS.muted, fontSize: 12 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji: { fontSize: 20 },
  info: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  meta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 14, fontWeight: '700' },
  delTxt: { color: COLORS.muted, fontSize: 16 },
  empty: { color: COLORS.muted, textAlign: 'center', padding: 40 },
  addBtn: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  addTxt: { color: COLORS.accent, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: COLORS.border, maxHeight: '90%' },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalLabel: { color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  modalInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, color: COLORS.text },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  typeTxt: { color: COLORS.muted, fontWeight: '700' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipTxt: { color: COLORS.text, fontSize: 13 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  catName: { color: COLORS.muted, fontSize: 12 },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center' },
});
