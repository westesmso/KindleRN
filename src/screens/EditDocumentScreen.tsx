import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { useLibrary } from '../context/LibraryContext';
import { RootStackParamList } from '../navigation/types';
import { DocumentGenre } from '../types';

type EditDocumentRoute = RouteProp<RootStackParamList, 'EditDocument'>;

const genreOptions: Array<{ value: DocumentGenre; label: string }> = [
  { value: 'tecnico', label: 'Tecnico' },
  { value: 'manga', label: 'Manga' },
  { value: 'romance', label: 'Romance' },
  { value: 'biografia', label: 'Biografia' },
  { value: 'outros', label: 'Outros' },
];

function formatToInputValue(value?: string) {
  if (!value) {
    return '';
  }

  return value;
}

function inputValueToDate(value: string) {
  return value.trim();
}

export function EditDocumentScreen() {
  const route = useRoute<EditDocumentRoute>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const { uploadedDocuments, updateUploadedDocument } = useLibrary();

  const document = uploadedDocuments.find((item) => item.id === route.params.documentId);

  const initialValues = useMemo(
    () => ({
      name: document?.name ?? '',
      author: document?.author ?? '',
      documentDate: formatToInputValue(document?.documentDate),
      genre: document?.genre ?? 'tecnico',
      notes: document?.notes ?? '',
    }),
    [document]
  );

  const [name, setName] = useState(initialValues.name);
  const [author, setAuthor] = useState(initialValues.author);
  const [documentDate, setDocumentDate] = useState(initialValues.documentDate);
  const [genre, setGenre] = useState<DocumentGenre>(initialValues.genre);
  const [notes, setNotes] = useState(initialValues.notes);

  if (!document) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Arquivo nao encontrado</Text>
        <Text style={styles.fallbackText}>O documento pode ter sido removido da biblioteca.</Text>
      </View>
    );
  }

  const compact = width < 380;
  const maxContentWidth = width > 760 ? 720 : '100%';

  const saveChanges = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Nome obrigatorio', 'Informe um nome para o arquivo.');
      return;
    }

    updateUploadedDocument(document.id, {
      name: trimmedName,
      author: author.trim() || undefined,
      documentDate: inputValueToDate(documentDate) || undefined,
      genre,
      notes: notes.trim() || undefined,
    });

    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.card, { maxWidth: maxContentWidth }]}> 
        <Text style={styles.title}>Editar arquivo</Text>
        <Text style={styles.subtitle}>
          Ajuste os metadados do arquivo enviado. Isso ajuda a organizar e pesquisar melhor a biblioteca.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do arquivo</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nome visivel na biblioteca" />
        </View>

        <View style={styles.formGroupRow}>
          <View style={[styles.flexField, compact && styles.flexFieldFull]}>
            <Text style={styles.label}>Autor</Text>
            <TextInput value={author} onChangeText={setAuthor} style={styles.input} placeholder="Nome do autor" />
          </View>
          <View style={[styles.flexField, compact && styles.flexFieldFull]}>
            <Text style={styles.label}>Data</Text>
            <TextInput value={documentDate} onChangeText={setDocumentDate} style={styles.input} placeholder="AAAA-MM-DD" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Genero</Text>
          <View style={styles.genreGrid}>
            {genreOptions.map((option) => {
              const isActive = genre === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setGenre(option.value)}
                  style={[styles.genreChip, isActive && styles.genreChipActive]}
                >
                  <Text style={[styles.genreChipText, isActive && styles.genreChipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Observacoes</Text>
          <TextInput
            multiline
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.textArea]}
            placeholder="Notas extras, referencia, contexto..."
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveChanges} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 18,
    alignItems: 'center',
  },
  containerCompact: {
    padding: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  formGroup: {
    gap: 8,
  },
  formGroupRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  flexField: {
    flex: 1,
    minWidth: 180,
    gap: 8,
  },
  flexFieldFull: {
    minWidth: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  genreChipActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  genreChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  genreChipTextActive: {
    color: '#111827',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  secondaryButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 13,
  },
  primaryButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#0f172a',
  },
  primaryButtonText: {
    color: '#fbbf24',
    fontWeight: '800',
    fontSize: 13,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  fallbackText: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
});
