import { StatusBar } from 'expo-status-bar';

import { LibraryProvider } from './src/context/LibraryContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <LibraryProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </LibraryProvider>
  );
}
