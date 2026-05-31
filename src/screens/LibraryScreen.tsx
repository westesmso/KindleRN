import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { useLibrary } from '../context/LibraryContext';
import { RootStackParamList } from '../navigation/types';
import { DocumentGenre, ReaderDocument } from '../types';

export function LibraryScreen() {
  const {
    books,
    selectedCategory,
    uploadedDocuments,
    favoriteDocumentIds,
    readerProgressByDocumentId,
    toggleFavoriteDocument,
    updateUploadedDocument,
  } = useLibrary();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'recent' | 'reading'>('all');
  const [sortMode, setSortMode] = useState<'recent' | 'name'>('recent');
  const [quickEditDocument, setQuickEditDocument] = useState<ReaderDocument | null>(null);
  const [quickEditName, setQuickEditName] = useState('');
  const [quickEditAuthor, setQuickEditAuthor] = useState('');
  const [quickEditDate, setQuickEditDate] = useState('');
  const [quickEditGenre, setQuickEditGenre] = useState<DocumentGenre>('tecnico');
  const [quickEditNotes, setQuickEditNotes] = useState('');

  const recommended = books.filter((book) => book.category === selectedCategory);
  const compact = width < 420;
  const contentWidth = width > 760 ? 720 : '100%';

  const visibleDocuments = useMemo(() => {
    const filtered = uploadedDocuments.filter((document) => {
      const isFavorite = favoriteDocumentIds.includes(document.id);
      const isReading = Boolean(readerProgressByDocumentId[document.id]);
      const isRecent =
        new Date(document.addedAt).getTime() >= Date.now() - 1000 * 60 * 60 * 24 * 7;

      if (filterMode === 'favorites') {
        return isFavorite;
      }

      if (filterMode === 'recent') {
        return isRecent;
      }

      if (filterMode === 'reading') {
        return isReading;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sortMode === 'name') {
        return left.name.localeCompare(right.name);
      }

      return new Date(right.addedAt).getTime() - new Date(left.addedAt).getTime();
    });
  }, [favoriteDocumentIds, filterMode, readerProgressByDocumentId, sortMode, uploadedDocuments]);

  const openQuickEdit = (document: ReaderDocument) => {
    setQuickEditDocument(document);
    setQuickEditName(document.name);
    setQuickEditAuthor(document.author ?? '');
    setQuickEditDate(document.documentDate ?? '');
    setQuickEditGenre(document.genre ?? 'tecnico');
    setQuickEditNotes(document.notes ?? '');
  };

  const closeQuickEdit = () => {
    setQuickEditDocument(null);
  };

  const saveQuickEdit = () => {
    if (!quickEditDocument) {
      return;
    }

    const trimmedName = quickEditName.trim();

    if (!trimmedName) {
      return;
    }

    updateUploadedDocument(quickEditDocument.id, {
      name: trimmedName,
      author: quickEditAuthor.trim() || undefined,
      documentDate: quickEditDate.trim() || undefined,
      genre: quickEditGenre,
      notes: quickEditNotes.trim() || undefined,
    });

    closeQuickEdit();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.content, { maxWidth: contentWidth }]}> 
        <Text style={styles.title}>Sua Biblioteca</Text>
        <Text style={styles.subtitle}>Livros recomendados por tema + arquivos enviados por voce.</Text>

        <View style={styles.toolbar}>
          <Text style={styles.toolbarLabel}>Filtrar</Text>
          <View style={styles.filterRow}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'favorites', label: 'Favoritos' },
              { key: 'recent', label: 'Recentes' },
              { key: 'reading', label: 'Em leitura' },
            ].map((option) => {
              const isActive = filterMode === option.key;

              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setFilterMode(option.key as typeof filterMode)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.toolbarLabel, styles.toolbarSpacing]}>Ordenar</Text>
          <View style={styles.filterRow}>
            {[
              { key: 'recent', label: 'Mais recentes' },
              { key: 'name', label: 'Nome' },
            ].map((option) => {
              const isActive = sortMode === option.key;

              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSortMode(option.key as typeof sortMode)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recomendados</Text>
        <View style={[styles.grid, compact && styles.gridCompact]}>
          {recommended.map((book) => (
            <View key={book.id} style={[styles.card, compact && styles.cardCompact]}>
              <View style={[styles.miniCover, { backgroundColor: book.coverColor }]} />
              <Text numberOfLines={2} style={styles.cardTitle}>
                {book.title}
              </Text>
              <Text style={styles.cardDescription}>{book.description}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Arquivos importados</Text>
        {uploadedDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum arquivo enviado</Text>
            <Text style={styles.emptyText}>Use a Tela 4 (Upload) para adicionar PDF ou EPUB.</Text>
          </View>
        ) : visibleDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum resultado</Text>
            <Text style={styles.emptyText}>Tente mudar o filtro ou a ordenacao para ver outros arquivos.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visibleDocuments.map((document) => (
              <View key={document.id} style={[styles.documentItem, compact && styles.documentItemCompact]}>
                <TouchableOpacity onPress={() => navigation.navigate('Reader', { document })} style={styles.documentMainAction}>
                  <Text style={styles.documentName}>{document.name}</Text>
                  <Text style={styles.documentMeta}>
                    {document.extension.toUpperCase()} • {document.size ? `${Math.round(document.size / 1024)} KB` : 'Tamanho indefinido'}
                  </Text>
                  {readerProgressByDocumentId[document.id] ? (
                    <Text style={styles.progressText}>
                      Capitulo {readerProgressByDocumentId[document.id].chapterIndex + 1} • Tema {readerProgressByDocumentId[document.id].theme}
                    </Text>
                  ) : null}
                </TouchableOpacity>

                <View style={[styles.actionsColumn, compact && styles.actionsColumnCompact]}>
                  <TouchableOpacity onPress={() => navigation.navigate('Reader', { document })}>
                    <Text style={styles.readAction}>Ler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openQuickEdit(document)}>
                    <Text style={styles.editAction}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleFavoriteDocument(document.id)}>
                    <Text style={styles.favoriteAction}>{favoriteDocumentIds.includes(document.id) ? '★ Favorito' : '☆ Favoritar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal animationType="slide" transparent visible={Boolean(quickEditDocument)} onRequestClose={closeQuickEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar rapido</Text>
            <Text style={styles.modalSubtitle}>Ajuste os metadados principais sem sair da biblioteca.</Text>

            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput value={quickEditName} onChangeText={setQuickEditName} style={styles.modalInput} placeholder="Nome do arquivo" />

            <Text style={styles.modalLabel}>Autor</Text>
            <TextInput value={quickEditAuthor} onChangeText={setQuickEditAuthor} style={styles.modalInput} placeholder="Autor" />

            <Text style={styles.modalLabel}>Data</Text>
            <TextInput value={quickEditDate} onChangeText={setQuickEditDate} style={styles.modalInput} placeholder="AAAA-MM-DD" />

            <Text style={styles.modalLabel}>Genero</Text>
            <View style={styles.modalChipRow}>
              {([
                { value: 'tecnico', label: 'Tecnico' },
                { value: 'manga', label: 'Manga' },
                { value: 'romance', label: 'Romance' },
                { value: 'biografia', label: 'Biografia' },
                { value: 'outros', label: 'Outros' },
              ] as Array<{ value: DocumentGenre; label: string }>).map((option) => {
                const isActive = quickEditGenre === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setQuickEditGenre(option.value)}
                    style={[styles.modalChip, isActive && styles.modalChipActive]}
                  >
                    <Text style={[styles.modalChipText, isActive && styles.modalChipTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.modalLabel}>Notas</Text>
            <TextInput
              multiline
              value={quickEditNotes}
              onChangeText={setQuickEditNotes}
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Observacoes"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity onPress={closeQuickEdit} style={styles.modalSecondaryButton}>
                <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveQuickEdit} style={styles.modalPrimaryButton}>
                <Text style={styles.modalPrimaryButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!quickEditDocument) {
                  return;
                }

                closeQuickEdit();
                navigation.navigate('EditDocument', { documentId: quickEditDocument.id });
              }}
              style={styles.modalLinkButton}
            >
              <Text style={styles.modalLinkButtonText}>Abrir edição completa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#f8fafc',
    paddingBottom: 32,
    alignItems: 'center',
  },
  containerCompact: {
    padding: 12,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  toolbar: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  toolbarLabel: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  toolbarSpacing: {
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  filterChipTextActive: {
    color: '#fbbf24',
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  grid: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCompact: {
    flexDirection: 'column',
  },
  card: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  cardCompact: {
    width: '100%',
  },
  miniCover: {
    width: 56,
    height: 72,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 5,
    color: '#475569',
    fontSize: 13,
  },
  list: {
    gap: 10,
  },
  documentItem: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  documentItemCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  documentMainAction: {
    flex: 1,
  },
  documentName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    maxWidth: 240,
  },
  documentMeta: {
    marginTop: 3,
    color: '#cbd5e1',
    fontSize: 12,
  },
  progressText: {
    marginTop: 6,
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsColumn: {
    alignItems: 'flex-end',
    gap: 10,
  },
  actionsColumnCompact: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  readAction: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
  },
  editAction: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteAction: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 14,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  modalTextArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  modalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  modalChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modalChipTextActive: {
    color: '#fbbf24',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  modalSecondaryButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#e2e8f0',
  },
  modalSecondaryButtonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 13,
  },
  modalPrimaryButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#0f172a',
  },
  modalPrimaryButtonText: {
    color: '#fbbf24',
    fontWeight: '800',
    fontSize: 13,
  },
  modalLinkButton: {
    alignSelf: 'flex-start',
  },
  modalLinkButtonText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 12,
  },
});
