import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../utils/theme';

const ICONS = ['🎯', '🚗', '✈️', '🏠', '💍', '🖥️', '🎸', '📱', '🌴', '💰'];

export default function SavingsScreen() {
  const { savings, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useApp();
  const [showAdd,     setShowAdd]     = useState(false);
  const [showDeposit, setShowDeposit] = useState(null);
  const [name,        setName]        = useState('');
  const [target,      setTarget]      = useState('');
  const [icon,        setIcon]        = useState('🎯');
  const [depositAmt,  setDepositAmt]  = useState('');

  async function handleAdd() {
    if (!name.trim()) return Alert.alert('Pflichtfeld', 'Bitte einen Namen eingeben.');
    const t = parseFloat(target.replace(',', '.'));
    if (isNaN(t) || t <= 0) return Alert.alert('Ungültig', 'Bitte ein gültiges Ziel eingeben.');
    await addSavingsGoal({ name: name.trim(), target: t, icon });
    setName(''); setTarget(''); setIcon('🎯');
    setShowAdd(false);
  }

  async function handleDeposit() {
    const amt = parseFloat(depositAmt.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) return Alert.alert('Ungültig', 'Bitte einen gültigen Betrag eingeben.');
    await updateSavingsGoal(showDeposit, amt);
    setDepositAmt('');
    setShowDeposit(null);
  }

  const total      = savings.reduce((s, g) => s + g.target, 0);
  const totalSaved = savings.reduce((s, g) => s + g.saved, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Gespartes Gesamt</Text>
        <Text style={styles.summaryAmount}>{totalSaved.toFixed(2)} €</Text>
        <Text style={styles.summaryOf}>von {total.toFixed(2)} € Ziel</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: total > 0 ? `${Math.min((totalSaved / total) * 100, 100)}%` : '0%' }]} />
        </View>
      </View>

      {/* Goals */}
      {savings.map(goal => {
        const pct = total > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
        const done = goal.saved >= goal.target;
        return (
          <View key={goal.id} style={[styles.goalCard, done && { borderColor: COLORS.green + '44' }]}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>{goal.name} {done ? '✅' : ''}</Text>
                <Text style={styles.goalAmt}>{goal.saved.toFixed(2)} / {goal.target.toFixed(2)} €</Text>
              </View>
              <Text style={[styles.goalPct, { color: done ? COLORS.green : COLORS.accent }]}>{pct.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: done ? COLORS.green : COLORS.accent }]} />
            </View>
            <View style={styles.goalActions}>
              <TouchableOpacity style={styles.depositBtn} onPress={() => setShowDeposit(goal.id)}>
                <Text style={styles.depositTxt}>+ Einzahlen</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Löschen', `"${goal.name}" löschen?`, [
                { text: 'Abbrechen', style: 'cancel' },
                { text: 'Löschen', style: 'destructive', onPress: () => deleteSavingsGoal(goal.id) },
              ])}>
                <Text style={styles.delTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addTxt}>+ Neues Sparziel</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Neues Sparziel</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput style={styles.modalInput} value={name} onChangeText={setName} placeholder="z.B. Urlaub" placeholderTextColor={COLORS.muted} />
            <Text style={styles.modalLabel}>Zielbetrag (€)</Text>
            <TextInput style={styles.modalInput} value={target} onChangeText={setTarget} placeholder="1000" placeholderTextColor={COLORS.muted} keyboardType="decimal-pad" />
            <Text style={styles.modalLabel}>Icon</Text>
            <View style={styles.iconRow}>
              {ICONS.map(ic => (
                <TouchableOpacity key={ic} style={[styles.iconBtn, icon === ic && { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent }]} onPress={() => setIcon(ic)}>
                  <Text style={{ fontSize: 20 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text style={{ color: COLORS.muted }}>Abbrechen</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}><Text style={{ color: '#000', fontWeight: '700' }}>Speichern</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={!!showDeposit} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Betrag einzahlen</Text>
            <TextInput style={styles.modalInput} value={depositAmt} onChangeText={setDepositAmt} placeholder="Betrag in €" placeholderTextColor={COLORS.muted} keyboardType="decimal-pad" />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeposit(null)}><Text style={{ color: COLORS.muted }}>Abbrechen</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDeposit}><Text style={{ color: '#000', fontWeight: '700' }}>Einzahlen</Text></TouchableOpacity>
            </View>
          </View>
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
  summaryAmount:{ color: COLORS.accent, fontSize: 36, fontWeight: '900', marginVertical: 6 },
  summaryOf:    { color: COLORS.muted, fontSize: 13, marginBottom: 12 },
  progressBg:   { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 },

  goalCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goalIcon: { fontSize: 30, marginRight: 12 },
  goalInfo: { flex: 1 },
  goalName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  goalAmt:  { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  goalPct:  { fontSize: 16, fontWeight: '800' },
  goalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  depositBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.accent + '44' },
  depositTxt: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  delTxt: { color: COLORS.muted, fontSize: 18, padding: 4 },

  addBtn: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginTop: 4 },
  addTxt: { color: COLORS.accent, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: COLORS.border },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalLabel: { color: COLORS.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, color: COLORS.text },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  iconBtn: { padding: 8, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center' },
});
