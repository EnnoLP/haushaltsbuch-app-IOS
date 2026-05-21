import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../utils/theme';

export default function AddScreen({ navigation }) {
  const { addTransaction, categories, persons } = useApp();

  const [type,       setType]       = useState('expense');
  const [title,      setTitle]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId,   setPersonId]   = useState(persons[0]?.id || '');
  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [note,       setNote]       = useState('');

  const filteredCats = categories.filter(c => c.type === type || c.type === 'both');

  async function handleSave() {
    if (!title.trim()) return Alert.alert('Pflichtfeld', 'Bitte einen Titel eingeben.');
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) return Alert.alert('Ungültig', 'Bitte einen gültigen Betrag eingeben.');
    if (!categoryId) return Alert.alert('Pflichtfeld', 'Bitte eine Kategorie wählen.');

    await addTransaction({ type, title: title.trim(), amount: amt, categoryId, personId, date, note });
    setTitle(''); setAmount(''); setCategoryId(''); setNote('');
    navigation.navigate('Dashboard');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Neue Buchung</Text>

        {/* Type Toggle */}
        <View style={styles.typeRow}>
          {['expense', 'income'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && { backgroundColor: t === 'income' ? COLORS.green : COLORS.red }]}
              onPress={() => { setType(t); setCategoryId(''); }}
            >
              <Text style={[styles.typeTxt, type === t && { color: '#000' }]}>
                {t === 'income' ? '↑ Einnahme' : '↓ Ausgabe'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label>Titel</Label>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="z.B. Supermarkt Einkauf"
          placeholderTextColor={COLORS.muted}
        />

        <Label>Betrag (€)</Label>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0,00"
          placeholderTextColor={COLORS.muted}
          keyboardType="decimal-pad"
        />

        <Label>Datum</Label>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="JJJJ-MM-TT"
          placeholderTextColor={COLORS.muted}
        />

        <Label>Person</Label>
        <View style={styles.chipRow}>
          {persons.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, personId === p.id && { backgroundColor: p.color + '33', borderColor: p.color }]}
              onPress={() => setPersonId(p.id)}
            >
              <Text style={styles.chipTxt}>{p.avatar} {p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label>Kategorie</Label>
        <View style={styles.catGrid}>
          {filteredCats.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, categoryId === cat.id && { backgroundColor: cat.color + '33', borderColor: cat.color }]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label>Notiz (optional)</Label>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={note}
          onChangeText={setNote}
          placeholder="Notiz..."
          placeholderTextColor={COLORS.muted}
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveTxt}>Buchung speichern</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Label = ({ children }) => <Text style={styles.label}>{children}</Text>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  heading:   { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 20 },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeTxt: { color: COLORS.muted, fontWeight: '700', fontSize: 15 },

  label: { color: COLORS.muted, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },

  input: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, padding: 14, color: COLORS.text, fontSize: 15,
  },

  chipRow:  { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  chipTxt: { color: COLORS.text, fontSize: 14 },

  catGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  catIcon: { fontSize: 16 },
  catName: { color: COLORS.muted, fontSize: 13 },

  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16,
    padding: 16, alignItems: 'center', marginTop: 24,
  },
  saveTxt: { color: '#000', fontSize: 16, fontWeight: '800' },
});
