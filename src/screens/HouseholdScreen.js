import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { COLORS } from '../utils/theme';
import { DEFAULT_CATEGORIES, DEFAULT_PERSONS } from '../utils/storage';

export default function HouseholdScreen({ onJoined }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) return Alert.alert('Zu kurz', 'Bitte mindestens 4 Zeichen eingeben.');
    setLoading(true);
    try {
      // Haushalt suchen oder neu anlegen
      let { data: existing } = await supabase
        .from('households')
        .select('id')
        .eq('code', clean)
        .single();

      let householdId;

      if (existing) {
        householdId = existing.id;
      } else {
        // Neuen Haushalt anlegen + Standarddaten
        const { data: created, error } = await supabase
          .from('households')
          .insert({ code: clean })
          .select('id')
          .single();

        if (error) throw error;
        householdId = created.id;

        // Standardkategorien & Personen einfügen
        await supabase.from('categories').insert(
          DEFAULT_CATEGORIES.map(c => ({ ...c, household_id: householdId }))
        );
        await supabase.from('persons').insert(
          DEFAULT_PERSONS.map(p => ({ ...p, household_id: householdId }))
        );
      }

      onJoined(householdId, clean);
    } catch (e) {
      Alert.alert('Fehler', e.message || 'Verbindung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.title}>Haushaltsbuch</Text>
        <Text style={styles.subtitle}>
          Gib einen gemeinsamen Code ein.{'\n'}
          Beide Personen tippen denselben Code — dann seht ihr alles zusammen.
        </Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={t => setCode(t.toUpperCase())}
            placeholder="Z.B. SMITH2026"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
            maxLength={20}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleJoin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.btnTxt}>Haushalt beitreten / erstellen</Text>
          }
        </TouchableOpacity>

        <Text style={styles.hint}>
          Neuer Code = neuer Haushalt{'\n'}
          Gleicher Code = gemeinsame Daten
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:    { fontSize: 56, marginBottom: 16 },
  title:    { color: COLORS.text, fontSize: 28, fontWeight: '900', marginBottom: 10 },
  subtitle: { color: COLORS.muted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputWrap:{ width: '100%', marginBottom: 16 },
  input: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, padding: 18, color: COLORS.text, fontSize: 22,
    fontWeight: '800', textAlign: 'center', letterSpacing: 4,
  },
  btn: {
    backgroundColor: COLORS.accent, borderRadius: 16,
    padding: 18, width: '100%', alignItems: 'center',
  },
  btnTxt: { color: '#000', fontSize: 16, fontWeight: '800' },
  hint:   { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
