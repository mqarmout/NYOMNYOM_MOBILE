import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync().catch(() => {});
import { useStore, PAGER } from './src/state/store';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SpendingScreen } from './src/screens/SpendingScreen';
import { JobsScreen } from './src/screens/JobsScreen';
import { FitnessScreen } from './src/screens/FitnessScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { ClimbingScreen } from './src/screens/ClimbingScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { HydroScreen } from './src/screens/HydroScreen';
import { PrintsScreen } from './src/screens/PrintsScreen';
import { SectionPager } from './src/navigation/SectionPager';
import { TabBar } from './src/navigation/TabBar';
import { MoreSheet } from './src/navigation/MoreSheet';
import { CommandTerminal } from './src/navigation/CommandTerminal';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Toasts } from './src/components/crt/Toasts';
import { AddExpenseSheet } from './src/screens/sheets/AddExpenseSheet';
import { LogWorkoutSheet } from './src/screens/sheets/LogWorkoutSheet';
import { LogSendSheet } from './src/screens/sheets/LogSendSheet';
import { AddApplicationSheet } from './src/screens/sheets/AddApplicationSheet';
import { AddTaskSheet } from './src/screens/sheets/AddTaskSheet';
import { LogDoseSheet } from './src/screens/sheets/LogDoseSheet';
import { PALETTES } from './src/theme/palettes';

function AppInner() {
  const auth = useStore(s => s.auth);
  const hydrated = useStore(s => s.hydrated);
  const palette = useStore(s => s.palette);
  const font = useStore(s => s.font);

  const [fontsLoaded] = useFonts({
    'JetBrainsMono-Regular': require('./assets/fonts/JetBrainsMono-Regular.ttf'),
    'IBMPlexMono-Regular': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
    'FiraCode-Regular': require('./assets/fonts/FiraCode-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded && hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, hydrated]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [logWorkoutOpen, setLogWorkoutOpen] = useState(false);
  const [logSendOpen, setLogSendOpen] = useState(false);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [logDoseOpen, setLogDoseOpen] = useState(false);
  const [logPrintOpen, setLogPrintOpen] = useState(false);

  if (!hydrated || !fontsLoaded) {
    const p = PALETTES[palette];
    return (
      <View style={[styles.loading, { backgroundColor: p.bg }]}>
        <ActivityIndicator color={p.accent} />
      </View>
    );
  }

  return (
    <ThemeProvider palette={palette} font={font}>
      {!auth ? (
        <LoginScreen />
      ) : (
        <View style={styles.root}>
          <SectionPager>
            <HomeScreen />
            <SpendingScreen onAddExpense={() => setAddExpenseOpen(true)} />
            <FitnessScreen onLogWorkout={() => setLogWorkoutOpen(true)} />
            <ClimbingScreen onLogSend={() => setLogSendOpen(true)} />
            <HydroScreen onLogDose={() => setLogDoseOpen(true)} />
            <JobsScreen onAddJob={() => setAddJobOpen(true)} />
            <PortfolioScreen />
            <ProjectsScreen onAddTask={() => setAddTaskOpen(true)} />
            <PrintsScreen onLogPrint={() => setLogPrintOpen(true)} />
          </SectionPager>

          <TabBar onMorePress={() => setMoreOpen(true)} />
          <Toasts />

          <MoreSheet
            open={moreOpen}
            onClose={() => setMoreOpen(false)}
            onProfile={() => setProfileOpen(true)}
          />

          <CommandTerminal open={termOpen} onClose={() => setTermOpen(false)} />
          <ProfileScreen open={profileOpen} onClose={() => setProfileOpen(false)} />

          <AddExpenseSheet open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
          <LogWorkoutSheet open={logWorkoutOpen} onClose={() => setLogWorkoutOpen(false)} />
          <LogSendSheet open={logSendOpen} onClose={() => setLogSendOpen(false)} />
          <AddApplicationSheet open={addJobOpen} onClose={() => setAddJobOpen(false)} />
          <AddTaskSheet open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
          <LogDoseSheet open={logDoseOpen} onClose={() => setLogDoseOpen(false)} />
        </View>
      )}
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
