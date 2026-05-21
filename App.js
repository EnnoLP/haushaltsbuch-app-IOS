import React from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider, useApp } from './src/context/AppContext';
import { COLORS } from './src/utils/theme';

import DashboardScreen    from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddScreen          from './src/screens/AddScreen';
import SavingsScreen      from './src/screens/SavingsScreen';
import RecurringScreen    from './src/screens/RecurringScreen';
import SettingsScreen     from './src/screens/SettingsScreen';
import HouseholdScreen    from './src/screens/HouseholdScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard:    '🏠',
  Transaktionen:'📋',
  Hinzufügen:   '➕',
  Sparziele:    '🎯',
  Wiederkehrend:'🔄',
  Einstellungen:'⚙️',
};

function TabIcon({ name, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{ICONS[name]}</Text>
    </View>
  );
}

function AppNavigator() {
  const { loaded, householdId, joinHousehold } = useApp();

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!householdId) {
    return <HouseholdScreen onJoined={joinHousehold} />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.muted,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 16,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          headerStyle: { backgroundColor: COLORS.bg, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        })}
      >
        <Tab.Screen name="Dashboard"     component={DashboardScreen}    options={{ title: 'Dashboard', headerTitle: '💰 Haushaltsbuch' }} />
        <Tab.Screen name="Transaktionen" component={TransactionsScreen} options={{ title: 'Buchungen' }} />
        <Tab.Screen name="Hinzufügen"    component={AddScreen}          options={{ title: 'Neu' }} />
        <Tab.Screen name="Sparziele"     component={SavingsScreen}      options={{ title: 'Sparen' }} />
        <Tab.Screen name="Wiederkehrend" component={RecurringScreen}    options={{ title: 'Fixkosten' }} />
        <Tab.Screen name="Einstellungen" component={SettingsScreen}     options={{ title: 'Einstellungen' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
