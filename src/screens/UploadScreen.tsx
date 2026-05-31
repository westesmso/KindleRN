import * as DocumentPicker from 'expo-document-picker';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { useLibrary } from '../context/LibraryContext';
import { RootStackParamList } from '../navigation/types';
import { DocumentGenre, ReaderDocument, ReaderFormat } from '../types';

function getExtension(fileName: string) {
  const split = fileName.toLowerCase().split('.');

  if (split.length < 2) {
    return '';
  }

  return split[split.length - 1];
}

function detectFormat(extension: string, mimeType?: string): ReaderFormat {
  if (extension === 'pdf' || mimeType?.includes('pdf')) {
    return 'pdf';
  }

  if (extension === 'epub' || mimeType?.includes('epub')) {
    return 'epub';
  }

  return 'unknown';
}

export function UploadScreen() {
  const { addUploadedDocument, uploadedDocuments, removeUploadedDocument, updateUploadedDocument } = useLibrary();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const contentWidth = width > 760 ? 720 : '100%';
  const [quickEditDocument, setQuickEditDocument] = useState<ReaderDocument | null>(null);
  const [quickEditName, setQuickEditName] = useState('');
  const [quickEditAuthor, setQuickEditAuthor] = useState('');
  const [quickEditDate, setQuickEditDate] = useState('');
  const [quickEditGenre, setQuickEditGenre] = useState<DocumentGenre>('tecnico');
  const [quickEditNotes, setQuickEditNotes] = useState('');

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/epub+zip', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const extension = getExtension(asset.name);
    const format = detectFormat(extension, asset.mimeType);

    if (format === 'unknown') {
      Alert.alert('Formato nao suportado', 'Envie um arquivo PDF ou EPUB.');
      return;
    }

    const uploaded: ReaderDocument = {
      id: `${Date.now()}`,
      name: asset.name,
      uri: asset.uri,
      mimeType: asset.mimeType,
      size: asset.size,
      extension,
      format,
      addedAt: new Date().toISOString(),
    };

    addUploadedDocument(uploaded);

    setQuickEditDocument(uploaded);
    setQuickEditName(uploaded.name);
    setQuickEditAuthor(uploaded.author ?? '');
    setQuickEditDate(uploaded.documentDate ?? '');
    setQuickEditGenre(uploaded.genre ?? 'tecnico');
    setQuickEditNotes(uploaded.notes ?? '');

    Alert.alert('Arquivo enviado', 'Upload concluido. Deseja abrir no leitor agora?', [
      {
        text: 'Depois',
        style: 'cancel',
      },
      {
        text: 'Editar dados',
        onPress: () => setQuickEditDocument(uploaded),
      },
      {
        text: 'Abrir leitor',
        onPress: () => navigation.navigate('Reader', { document: uploaded }),
      },
    ]);
  };

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

    updateUploadedDocument(quickEditDocument.id, {
      name: quickEditName.trim() || quickEditDocument.name,
      author: quickEditAuthor.trim() || undefined,
      documentDate: quickEditDate.trim() || undefined,
      genre: quickEditGenre,
      notes: quickEditNotes.trim() || undefined,
    });

    closeQuickEdit();
  };

  const genreOptions = useMemo(
    () => [
      { value: 'tecnico' as const, label: 'Tecnico' },
      { value: 'manga' as const, label: 'Manga' },
      { value: 'romance' as const, label: 'Romance' },
      { value: 'biografia' as const, label: 'Biografia' },
      { value: 'outros' as const, label: 'Outros' },
    ],
    []
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.content, { maxWidth: contentWidth }]}> 
        <Text style={styles.title}>Upload de PDF / EPUB</Text>
        <Text style={styles.subtitle}>
          Envie seus arquivos para leitura local no app e abra direto na tela de leitor.
        </Text>

        <TouchableOpacity onPress={pickDocument} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Selecionar arquivo</Text>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Dica</Text>
          <Text style={styles.tipText}>
            PDFs sao exibidos no leitor embutido. EPUB agora e processado com capitulos no leitor interno, com opcao de abrir externamente.
          </Text>
        </View>

        <Text style={styles.listTitle}>Ultimos uploads ({uploadedDocuments.length})</Text>
        {uploadedDocuments.map((item) => (
          <View key={item.id} style={[styles.rowItem, compact && styles.rowItemCompact]}>
            <View style={styles.rowContent}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.format.toUpperCase()} • {item.extension.toUpperCase()}</Text>
              {item.author || item.genre ? (
                <Text style={styles.rowMetaSmall}>
                  {item.author ? `Autor: ${item.author}` : 'Autor nao definido'}
                  {item.genre ? ` • Genero: ${item.genre}` : ''}
                </Text>
              ) : null}
            </View>
            <View style={[styles.actionsRow, compact && styles.actionsRowCompact]}>
              <TouchableOpacity onPress={() => navigation.navigate('Reader', { document: item })} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Ler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openQuickEdit(item)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('EditDocument', { documentId: item.id })} style={styles.fullEditButton}>
                <Text style={styles.fullEditButtonText}>Completa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Excluir arquivo', 'Deseja remover este arquivo da biblioteca?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: () => removeUploadedDocument(item.id),
                    },
                  ])
                }
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Modal animationType="slide" transparent visible={Boolean(quickEditDocument)} onRequestClose={closeQuickEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar rapido</Text>
            <Text style={styles.modalSubtitle}>Atualize os dados do arquivo enviado sem sair da tela de upload.</Text>

            <Text style={styles.modalLabel}>Nome</Text>
            <TextInput value={quickEditName} onChangeText={setQuickEditName} style={styles.modalInput} placeholder="Nome do arquivo" />

            <Text style={styles.modalLabel}>Autor</Text>
            <TextInput value={quickEditAuthor} onChangeText={setQuickEditAuthor} style={styles.modalInput} placeholder="Autor" />

            <Text style={styles.modalLabel}>Data</Text>
            <TextInput value={quickEditDate} onChangeText={setQuickEditDate} style={styles.modalInput} placeholder="AAAA-MM-DD" />

            <Text style={styles.modalLabel}>Genero</Text>
            <View style={styles.modalChipRow}>
              {genreOptions.map((option) => {
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
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 18,
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
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  uploadButton: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fbbf24',
    fontWeight: '800',
    fontSize: 16,
  },
  tipCard: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderWidth: 1,
    padding: 14,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9a3412',
  },
  tipText: {
    marginTop: 4,
    fontSize: 13,
    color: '#7c2d12',
    lineHeight: 19,
  },
  listTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '800',
    fontSize: 17,
    color: '#0f172a',
  },
  rowItem: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  rowItemCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  rowContent: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: 220,
  },
  rowMeta: {
    marginTop: 3,
    color: '#64748b',
    fontSize: 12,
  },
  rowMetaSmall: {
    marginTop: 4,
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  smallButton: {
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionsRowCompact: {
    justifyContent: 'flex-start',
  },
  editButton: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  fullEditButton: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    opacity: 0.9,
  },
  fullEditButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
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
