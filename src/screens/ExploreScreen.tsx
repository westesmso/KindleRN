import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLibrary } from '../context/LibraryContext';
import { BookCategory } from '../types';

const categoryText: Record<BookCategory, string> = {
  tecnico: 'Livros para Computacao, Internet e Midia Digital',
  manga: 'Historias em quadrinhos japonesas e aventuras visuais',
  romance: 'Narrativas romanticas leves e emocionantes',
};

export function ExploreScreen() {
  const { books } = useLibrary();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explorar</Text>
      <Text style={styles.subtitle}>Descubra titulos por categoria, inspirado no layout da loja Kindle.</Text>

      {(Object.keys(categoryText) as BookCategory[]).map((category) => {
        const categoryBooks = books.filter((book) => book.category === category).slice(0, 3);

        return (
          <View key={category} style={styles.block}>
            <Text style={styles.blockTitle}>{category.toUpperCase()}</Text>
            <Text style={styles.blockSubtitle}>{categoryText[category]}</Text>
            <View style={styles.row}>
              {categoryBooks.map((book) => (
                <View key={book.id} style={styles.smallCard}>
                  <View style={[styles.smallCover, { backgroundColor: book.coverColor }]} />
                  <Text numberOfLines={2} style={styles.smallTitle}>
                    {book.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    padding: 18,
    paddingBottom: 30,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  block: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  blockTitle: {
    fontSize: 15,
    color: '#f59e0b',
    fontWeight: '800',
  },
  blockSubtitle: {
    marginTop: 3,
    color: '#334155',
    fontSize: 13,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  smallCard: {
    width: '31%',
  },
  smallCover: {
    width: '100%',
    height: 96,
    borderRadius: 10,
    marginBottom: 8,
  },
  smallTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
});
