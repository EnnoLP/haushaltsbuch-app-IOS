import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../utils/theme';

const PERSON_COLORS = ['#00E5FF', '#7B2FFF', '#FF6B6B', '#00FF9D', '#FFD700', '#FF6B2B'];
const PERSON_AVATARS = ['👤', '👥', '🧑', '👩', '🧔', '👱'];

export default function SettingsScreen() {
  const { persons, updatePerson, categories, addCategory, householdCode, leaveHousehold } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📦');
  const [catColor, setCatColor] = useState('#AEB6BF');
  const [catType, setCatType] = useState('expense');

  function startEdit(p) {
    setEditingId(p.id);
    setName(p.name);
  }

  async function saveEdit(id) {
    if (!name.trim()) return;
    await updatePerson(id, { name: name.trim() });
    setEditingId(null);
  }

  async function handleAddCategory() {
    if (!catName.trim()) return Alert.alert('Pflichtfeld', 'Bitte einen Namen eingeben.');
    await addCategory({ name: catName.trim(), icon: catIcon, color: catColor, type: catType });
    setCatName(''); setCatIcon('📦');
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Household Info */}
      <View style={styles.householdCard}>
        <View>
          <Text style={styles.householdLabel}>Haushaltscode</Text>
          <Text style={styles.householdCode}>{householdCode}</Text>
          <Text style={styles.householdHint}>Person 2 gibt diesen Code ein um beizutreten</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Haushalt verlassen', 'Möchtest du den Haushalt verlassen? Deine Daten bleiben in der Cloud.', [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Verlassen', style: 'destructive', onPress: leaveHousehold },
        ])} style={styles.leaveBtn}>
          <Text style={styles.leaveTxt}>Verlassen</Text>
        </TouchableOpacity>
      </View>

      {/* Persons */}
      <Text style={styles.sectionTitle}>👥 Personen</Text>
      {persons.map(p => (
        <View key={p.id} style={[styles.personCard, { borderColor: p.color + '44' }]}>
          <View style={styles.personLeft}>
            <Text style={styles.personAvatar}>{p.avatar}</Text>
            {editingId === p.id ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            ) : (
              <Text style={styles.personName}>{p.name}</Text>
            )}
          </View>
          {editingId === p.id ? (
            <TouchableOpacity onPress={() => saveEdit(p.id)} style={[styles.editBtn, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}>
              <Text style={{ color: COLORS.green, fontWeight: '700' }}>✓ OK</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => startEdit(p)} style={styles.editBtn}>
              <Text style={{ color: COLORS.muted }}>✏️ Umbenennen</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Colors per Person */}
      {persons.map(p => (
        <View key={`color-${p.id}`} style={styles.colorSection}>
          <Text style={styles.colorLabel}>{p.name} — Farbe</Text>
          <View style={styles.colorRow}>
            {PERSON_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, p.color === c && styles.colorDotActive]}
                onPress={() => updatePerson(p.id, { color: c })}
              />
            ))}
          </View>
          <Text style={styles.colorLabel}>{p.name} — Avatar</Text>
          <View style={styles.colorRow}>
            {PERSON_AVATARS.map(av => (
              <TouchableOpacity
                key={av}
                style={[styles.avatarBtn, p.avatar === av && { backgroundColor: p.color + '33', borderColor: p.color }]}
                onPress={() => updatePerson(p.id, { avatar: av })}
              >
                <Text style={{ fontSize: 20 }}>{av}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Categories */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🏷️ Kategorien</Text>
      <View style={styles.catGrid}>
        {categories.map(cat => (
          <View key={cat.id} style={[styles.catChip, { borderColor: cat.color + '66' }]}>
            <Text>{cat.icon}</Text>
            <Text style={styles.catName}>{cat.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.subTitle}>Neue Kategorie</Text>
      <View style={styles.typeRow}>
        {['expense', 'income', 'both'].map(t => (
          <TouchableOpacity key={t} style={[styles.typeBtn, catType === t && { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent }]} onPress={() => setCatType(t)}>
            <Text style={[styles.typeTxt, catType === t && { color: COLORS.accent }]}>{t === 'expense' ? 'Ausgabe' : t === 'income' ? 'Einnahme' : 'Beides'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={styles.input} value={catName} onChangeText={setCatName} placeholder="Kategoriename" placeholderTextColor={COLORS.muted} />
      <View style={styles.catIconRow}>
        {['🛒','🚗','🏠','🎮','💊','👕','✈️','🐶','📚','⚡'].map(ic => (
          <TouchableOpacity key={ic} style={[styles.iconBtn, catIcon === ic && { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent }]} onPress={() => setCatIcon(ic)}>
            <Text style={{ fontSize: 20 }}>{ic}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleAddCategory}>
        <Text style={styles.saveTxt}>Kategorie hinzufügen</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerTxt}>Erstellt von Enno.W</Text>
        <Text style={styles.footerTxt}>Nur zum privaten Gebrauch</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  householdCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  householdLabel:{ color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  householdCode: { color: COLORS.accent, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  householdHint: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  leaveBtn:      { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  leaveTxt:      { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  subTitle:     { color: COLORS.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 10 },

  personCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  personLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar:{ fontSize: 28 },
  personName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  nameInput:  { color: COLORS.text, fontSize: 15, borderBottomWidth: 1, borderColor: COLORS.accent, minWidth: 120 },
  editBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },

  colorSection: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  colorLabel:   { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  colorRow:     { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 10 },
  colorDot:     { width: 28, height: 28, borderRadius: 14 },
  colorDotActive:{ borderWidth: 3, borderColor: '#fff' },
  avatarBtn:    { padding: 6, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },

  catGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1 },
  catName:  { color: COLORS.muted, fontSize: 12 },
  typeRow:  { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeBtn:  { flex: 1, padding: 10, borderRadius: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  typeTxt:  { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  input:    { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, color: COLORS.text, marginBottom: 10 },
  catIconRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  iconBtn:  { padding: 8, borderRadius: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  saveBtn:  { backgroundColor: COLORS.accent, borderRadius: 14, padding: 14, alignItems: 'center' },
  saveTxt:  { color: '#000', fontWeight: '800', fontSize: 15 },
  footer:   { marginTop: 32, marginBottom: 16, alignItems: 'center' },
  footerTxt:{ color: COLORS.muted, fontSize: 12 },
});
