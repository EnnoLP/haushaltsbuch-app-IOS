import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { COLORS, FONTS } from '../utils/theme';

const { width } = Dimensions.get('window');
const NOW = new Date();

export default function DashboardScreen({ navigation }) {
  const { transactions, getMonthTransactions, getCategoryById, persons, savings } = useApp();
  const [month, setMonth] = useState(NOW.getMonth());
  const [year,  setYear]  = useState(NOW.getFullYear());

  const monthTx = useMemo(() => getMonthTransactions(month, year), [getMonthTransactions, month, year]);

  const totalIncome  = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const totalExpense = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const balance      = totalIncome - totalExpense;

  const byPerson = useMemo(() => persons.map(p => ({
    ...p,
    income:  monthTx.filter(t => t.personId === p.id && t.type === 'income').reduce((s, t)  => s + t.amount, 0),
    expense: monthTx.filter(t => t.personId === p.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  })), [monthTx, persons]);

  const pieData = useMemo(() => {
    const map = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(map).map(([id, value]) => {
      const cat = getCategoryById(id);
      return { name: cat.name, amount: value, color: cat.color, legendFontColor: COLORS.muted, legendFontSize: 12 };
    }).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [monthTx, getCategoryById]);

  const recentTx = useMemo(() => transactions.slice(0, 5), [transactions]);

  const monthName = new Date(year, month, 1).toLocaleString('de', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month Selector */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}><Text style={styles.monthArrow}>‹</Text></TouchableOpacity>
        <Text style={styles.monthLabel}>{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}><Text style={styles.monthArrow}>›</Text></TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Verfügbares Guthaben</Text>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? COLORS.green : COLORS.red }]}>
          {balance >= 0 ? '+' : ''}{balance.toFixed(2)} €
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceSub}>
            <Text style={styles.balanceSubLabel}>↑ Einnahmen</Text>
            <Text style={[styles.balanceSubValue, { color: COLORS.green }]}>+{totalIncome.toFixed(2)} €</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.balanceSub}>
            <Text style={styles.balanceSubLabel}>↓ Ausgaben</Text>
            <Text style={[styles.balanceSubValue, { color: COLORS.red }]}>-{totalExpense.toFixed(2)} €</Text>
          </View>
        </View>
      </View>

      {/* Per Person */}
      <View style={styles.personsRow}>
        {byPerson.map(p => (
          <View key={p.id} style={[styles.personCard, { borderColor: p.color + '44' }]}>
            <Text style={styles.personAvatar}>{p.avatar}</Text>
            <Text style={styles.personName}>{p.name}</Text>
            <Text style={[styles.personVal, { color: COLORS.green }]}>+{p.income.toFixed(0)}€</Text>
            <Text style={[styles.personVal, { color: COLORS.red }]}>-{p.expense.toFixed(0)}€</Text>
          </View>
        ))}
      </View>

      {/* Chart */}
      {pieData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ausgaben nach Kategorie</Text>
          <PieChart
            data={pieData}
            width={width - 32}
            height={180}
            chartConfig={{ color: () => COLORS.accent }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            hasLegend={true}
          />
        </View>
      )}

      {/* Savings Preview */}
      {savings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sparziele</Text>
          {savings.slice(0, 2).map(goal => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100);
            return (
              <View key={goal.id} style={styles.savingsRow}>
                <Text style={styles.savingsIcon}>{goal.icon || '🎯'}</Text>
                <View style={styles.savingsInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.savingsName}>{goal.name}</Text>
                    <Text style={styles.savingsPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: COLORS.accent }]} />
                  </View>
                  <Text style={styles.savingsAmt}>{goal.saved.toFixed(0)} / {goal.target.toFixed(0)} €</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Letzte Buchungen</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transaktionen')}>
            <Text style={styles.seeAll}>Alle →</Text>
          </TouchableOpacity>
        </View>
        {recentTx.length === 0
          ? <Text style={styles.empty}>Noch keine Buchungen</Text>
          : recentTx.map(tx => <TxRow key={tx.id} tx={tx} getCategoryById={getCategoryById} persons={persons} />)
        }
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function TxRow({ tx, getCategoryById, persons }) {
  const cat    = getCategoryById(tx.categoryId);
  const person = persons.find(p => p.id === tx.personId);
  const d      = new Date(tx.date).toLocaleDateString('de', { day: '2-digit', month: '2-digit' });
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={styles.txEmoji}>{cat.icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{tx.title}</Text>
        <Text style={styles.txMeta}>{d} · {person?.name || ''}</Text>
      </View>
      <Text style={[styles.txAmt, { color: tx.type === 'income' ? COLORS.green : COLORS.red }]}>
        {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)} €
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  monthRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 16 },
  monthBtn:  { padding: 8 },
  monthArrow:{ color: COLORS.accent, fontSize: 24, fontWeight: '700' },
  monthLabel:{ color: COLORS.text, fontSize: 16, fontWeight: '700' },

  balanceCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  balanceLabel:  { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  balanceAmount: { fontSize: 36, fontWeight: '900', marginBottom: 16 },
  balanceRow:    { flexDirection: 'row', alignItems: 'center' },
  balanceSub:    { flex: 1, alignItems: 'center' },
  balanceSubLabel:{ color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  balanceSubValue:{ fontSize: 16, fontWeight: '700' },
  divider:       { width: 1, height: 36, backgroundColor: COLORS.border },

  personsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  personCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 16,
    padding: 14, alignItems: 'center', borderWidth: 1,
  },
  personAvatar: { fontSize: 24, marginBottom: 4 },
  personName:   { color: COLORS.text, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  personVal:    { fontSize: 13, fontWeight: '700' },

  section:      { marginBottom: 20 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  seeAll:       { color: COLORS.accent, fontSize: 13 },

  savingsRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  savingsIcon: { fontSize: 28 },
  savingsInfo: { flex: 1 },
  savingsName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  savingsPct:  { color: COLORS.accent, fontSize: 13 },
  progressBg:  { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginVertical: 6 },
  progressFill:{ height: 6, borderRadius: 3 },
  savingsAmt:  { color: COLORS.muted, fontSize: 12 },

  txRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  txIcon:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txEmoji: { fontSize: 20 },
  txInfo:  { flex: 1 },
  txTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  txMeta:  { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  txAmt:   { fontSize: 15, fontWeight: '700' },
  empty:   { color: COLORS.muted, textAlign: 'center', padding: 20 },
});
