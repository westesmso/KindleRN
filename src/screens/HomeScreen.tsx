import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useLibrary } from '../context/LibraryContext';
import { BookCategory } from '../types';

const categoryLabels: Record<BookCategory, string> = {
  tecnico: 'Cientifico/Tecnico',
  manga: 'Manga',
  romance: 'Romance',
};

export function HomeScreen() {
  const { books, selectedCategory, setSelectedCategory } = useLibrary();

  const filtered = books.filter((book) => book.category === selectedCategory);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroSubtitle}>Loja Kindle RN</Text>
        <Text style={styles.heroTitle}>Explore. Escolha. Leia.</Text>
        <Text style={styles.heroText}>
          Clone inspirado no app da Amazon Kindle com foco em navegacao, categorias e leitura.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Escolha seu tema preferido</Text>
      <View style={styles.chipRow}>
        {(Object.keys(categoryLabels) as BookCategory[]).map((category) => {
          const isActive = selectedCategory === category;

          return (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{categoryLabels[category]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Destaques para voce</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {filtered.map((book) => (
          <View key={book.id} style={styles.bookCard}>
            <View style={[styles.cover, { backgroundColor: book.coverColor }]} />
            <Text numberOfLines={2} style={styles.bookTitle}>
              {book.title}
            </Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 30,
    backgroundColor: '#f8fafc',
    gap: 14,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#f59e0b',
  },
  chipText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#111827',
  },
  horizontalList: {
    marginTop: 4,
  },
  bookCard: {
    width: 138,
    marginRight: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  cover: {
    borderRadius: 12,
    height: 150,
    marginBottom: 10,
  },
  bookTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0f172a',
  },
  bookAuthor: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 12,
  },
});
