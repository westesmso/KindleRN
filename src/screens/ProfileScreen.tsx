import { StyleSheet, Text, View } from 'react-native';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil do Leitor</Text>
      <Text style={styles.description}>
        Tela extra no Drawer para simular a area de conta, preferencias e sincronizacao do app.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrega</Text>
        <Text style={styles.cardText}>Projeto React Native com Tabs, Drawer, icones e funcionalidades.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Compatibilidade</Text>
        <Text style={styles.cardText}>Interface planejada para iOS e Android no Expo SDK 54.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  description: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
