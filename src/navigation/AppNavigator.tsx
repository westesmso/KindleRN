import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DrawerParamList, RootStackParamList, TabParamList } from './types';
import { ExploreScreen } from '../screens/ExploreScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditDocumentScreen } from '../screens/EditDocumentScreen';
import { ReaderScreen } from '../screens/ReaderScreen';
import { UploadScreen } from '../screens/UploadScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
            Inicio: 'home-outline',
            Biblioteca: 'library-outline',
            Explorar: 'compass-outline',
            Upload: 'cloud-upload-outline',
          };

          return <Ionicons color={color} name={iconMap[route.name]} size={size} />;
        },
      })}
    >
      <Tab.Screen component={HomeScreen} name="Inicio" options={{ title: 'Tela 1' }} />
      <Tab.Screen component={LibraryScreen} name="Biblioteca" options={{ title: 'Tela 2' }} />
      <Tab.Screen component={ExploreScreen} name="Explorar" options={{ title: 'Tela 3' }} />
      <Tab.Screen component={UploadScreen} name="Upload" options={{ title: 'Tela 4' }} />
    </Tab.Navigator>
  );
}

function KindleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen component={MainTabs} name="Tabs" options={{ headerShown: false }} />
      <Stack.Screen
        component={ReaderScreen}
        name="Reader"
        options={{
          title: 'Leitor',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen
        component={EditDocumentScreen}
        name="EditDocument"
        options={{
          title: 'Editar arquivo',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
        }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
          drawerActiveTintColor: '#f59e0b',
          drawerInactiveTintColor: '#1e293b',
        }}
      >
        <Drawer.Screen component={KindleStack} name="Kindle" options={{ title: 'Clone Kindle' }} />
        <Drawer.Screen component={ProfileScreen} name="Perfil" options={{ title: 'Conta e Extras' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
