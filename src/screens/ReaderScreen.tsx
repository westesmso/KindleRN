import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Constants from 'expo-constants';

import { useLibrary } from '../context/LibraryContext';
import { PdfViewer } from '../components/PdfViewer';
import { RootStackParamList } from '../navigation/types';
import { ReaderTheme } from '../types';
import { ParsedEpub, parseEpubFromUri } from '../utils/epubParser';

type ReaderRoute = RouteProp<RootStackParamList, 'Reader'>;

const backgroundTheme: Record<ReaderTheme, string> = {
  claro: '#f8fafc',
  sepia: '#f7efe3',
  noite: '#0f172a',
};

const textTheme: Record<ReaderTheme, string> = {
  claro: '#0f172a',
  sepia: '#3f2d1f',
  noite: '#e2e8f0',
};

export function ReaderScreen() {
  const route = useRoute<ReaderRoute>();
  const { document } = route.params;
  const { readerProgressByDocumentId, saveReaderProgress } = useLibrary();
  const { width } = useWindowDimensions();

  const savedProgress = readerProgressByDocumentId[document.id];

  const [fontSize, setFontSize] = useState(savedProgress?.fontSize ?? 16);
  const [theme, setTheme] = useState<ReaderTheme>(savedProgress?.theme ?? 'claro');
  const [epubData, setEpubData] = useState<ParsedEpub | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(savedProgress?.chapterIndex ?? 0);
  const [epubLoading, setEpubLoading] = useState(false);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(savedProgress?.searchQuery ?? '');
  const [matchCursor, setMatchCursor] = useState(0);
  const [didHydrateInitialState, setDidHydrateInitialState] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [pdfViewerAvailable, setPdfViewerAvailable] = useState(true);
  const controlsRestoreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPdf = document.format === 'pdf';
  const compact = width < 420;
  const contentMaxWidth = width > 760 ? 720 : '100%';
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (document.format !== 'epub') {
      return;
    }

    let cancelled = false;

    const loadEpub = async () => {
      setEpubLoading(true);
      setEpubError(null);
      setSelectedChapterIndex(savedProgress?.chapterIndex ?? 0);

      try {
        const parsed = await parseEpubFromUri(document.uri);

        if (!cancelled) {
          setEpubData(parsed);
        }
      } catch (error) {
        if (!cancelled) {
          setEpubData(null);
          setEpubError(error instanceof Error ? error.message : 'Falha ao ler EPUB.');
        }
      } finally {
        if (!cancelled) {
          setEpubLoading(false);
        }
      }
    };

    void loadEpub();

    return () => {
      cancelled = true;
    };
  }, [document.format, document.uri, savedProgress?.chapterIndex]);

  useEffect(() => {
    if (!didHydrateInitialState) {
      setDidHydrateInitialState(true);
      return;
    }

    saveReaderProgress(document.id, {
      chapterIndex: selectedChapterIndex,
      fontSize,
      theme,
      searchQuery,
      updatedAt: new Date().toISOString(),
    });
  }, [
    didHydrateInitialState,
    document.id,
    selectedChapterIndex,
    fontSize,
    theme,
    searchQuery,
    saveReaderProgress,
  ]);

  const sizeInKb = useMemo(() => {
    if (!document.size) {
      return 'desconhecido';
    }

    return `${Math.round(document.size / 1024)} KB`;
  }, [document.size]);

  const selectedChapter = useMemo(() => {
    if (!epubData) {
      return null;
    }

    return epubData.chapters[selectedChapterIndex] ?? null;
  }, [epubData, selectedChapterIndex]);

  const searchMatches = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    if (!epubData || normalized.length < 2) {
      return [] as number[];
    }

    return epubData.chapters
      .map((chapter, index) => ({
        index,
        hit:
          chapter.title.toLowerCase().includes(normalized) ||
          chapter.content.toLowerCase().includes(normalized),
      }))
      .filter((item) => item.hit)
      .map((item) => item.index);
  }, [epubData, searchQuery]);

  useEffect(() => {
    setMatchCursor(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchMatches.length) {
      return;
    }

    const index = searchMatches[Math.min(matchCursor, searchMatches.length - 1)] ?? searchMatches[0];
    setSelectedChapterIndex(index);
  }, [searchMatches, matchCursor]);

  useEffect(() => {
    return () => {
      if (controlsRestoreTimeout.current) {
        clearTimeout(controlsRestoreTimeout.current);
      }
    };
  }, []);

  const openExternal = async () => {
    const canOpen = await Linking.canOpenURL(document.uri);

    if (!canOpen) {
      Alert.alert('Falha ao abrir', 'Nao foi possivel abrir o arquivo neste dispositivo.');
      return;
    }

    await Linking.openURL(document.uri);
  };

  const handleScrollStart = () => {
    setControlsVisible(false);

    if (controlsRestoreTimeout.current) {
      clearTimeout(controlsRestoreTimeout.current);
    }
  };

  const handleScrollEnd = () => {
    if (controlsRestoreTimeout.current) {
      clearTimeout(controlsRestoreTimeout.current);
    }

    controlsRestoreTimeout.current = setTimeout(() => {
      setControlsVisible(true);
    }, 180);
  };

  const handlePdfError = () => {
    setPdfLoadError('Nao foi possivel abrir este PDF dentro do leitor.');
    setPdfViewerAvailable(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundTheme[theme] }]}>
      <View style={[styles.readerHeader, compact && styles.readerHeaderCompact]}>
        <View style={[styles.headerInfo, compact && styles.headerInfoCompact]}>
          <Text numberOfLines={1} style={styles.title}>
            {document.name}
          </Text>
          <Text style={styles.meta}>
            Formato: {document.format.toUpperCase()} • Tamanho: {sizeInKb}
          </Text>
        </View>

        <TouchableOpacity onPress={openExternal} style={[styles.openButton, compact && styles.openButtonCompact]}>
          <Text style={styles.openButtonText}>Abrir externo</Text>
        </TouchableOpacity>
      </View>

      {controlsVisible ? (
        <View style={styles.controlsWrapper}>
          <TouchableOpacity
            onPress={() => setControlsOpen((prev) => !prev)}
            style={[styles.dropdownHeader, controlsOpen && styles.dropdownHeaderOpen]}
          >
            <Text style={styles.dropdownTitle}>Opções de leitura</Text>
            <Text style={styles.dropdownChevron}>{controlsOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {controlsOpen ? (
            <View style={styles.dropdownPanel}>
              <View style={styles.rowGroup}>
                <TouchableOpacity onPress={() => setFontSize((prev) => Math.max(12, prev - 1))} style={styles.controlButton}>
                  <Text style={styles.controlText}>A-</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFontSize((prev) => Math.min(28, prev + 1))} style={styles.controlButton}>
                  <Text style={styles.controlText}>A+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Buscar no EPUB (min. 2 letras)"
                  placeholderTextColor="#64748b"
                  style={styles.searchInput}
                  value={searchQuery}
                />
                <Text style={styles.searchMeta}>
                  {searchMatches.length > 0 ? `${searchMatches.length} capitulos com ocorrencia` : 'Sem ocorrencias'}
                </Text>
                <View style={styles.searchActions}>
                  <TouchableOpacity
                    disabled={searchMatches.length === 0}
                    onPress={() =>
                      setMatchCursor((prev) =>
                        searchMatches.length ? (prev - 1 + searchMatches.length) % searchMatches.length : 0
                      )
                    }
                    style={[styles.searchButton, searchMatches.length === 0 && styles.searchButtonDisabled]}
                  >
                    <Text style={styles.searchButtonText}>Anterior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={searchMatches.length === 0}
                    onPress={() =>
                      setMatchCursor((prev) => (searchMatches.length ? (prev + 1) % searchMatches.length : 0))
                    }
                    style={[styles.searchButton, searchMatches.length === 0 && styles.searchButtonDisabled]}
                  >
                    <Text style={styles.searchButtonText}>Proximo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.themeGroup}>
                <TouchableOpacity onPress={() => setTheme('claro')} style={styles.themeButton}>
                  <Text style={styles.themeButtonText}>Claro</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTheme('sepia')} style={styles.themeButton}>
                  <Text style={styles.themeButtonText}>Sépia</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTheme('noite')} style={styles.themeButton}>
                  <Text style={styles.themeButtonText}>Noite</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {isPdf ? (
        Platform.OS === 'web' ? (
          <PdfViewer sourceUri={document.uri} style={styles.pdfNativeViewer} onError={handlePdfError} onLoad={() => setPdfLoadError(null)} />
        ) : isExpoGo ? (
          <View style={styles.pdfFallback}>
            <Text style={styles.pdfFallbackTitle}>Leitura PDF indisponivel no Expo Go</Text>
            <Text style={styles.pdfFallbackText}>
              O visualizador PDF nativo requer um development build ou app instalado.
            </Text>
            <Text style={styles.pdfFallbackText}>Abra o arquivo externamente para continuar lendo.</Text>
            <TouchableOpacity onPress={openExternal} style={styles.pdfFallbackButton}>
              <Text style={styles.pdfFallbackButtonText}>Abrir externo</Text>
            </TouchableOpacity>
          </View>
        ) : !pdfViewerAvailable ? (
          <View style={styles.pdfFallback}>
            <Text style={styles.pdfFallbackTitle}>Falha ao carregar o PDF</Text>
            <Text style={styles.pdfFallbackText}>{pdfLoadError}</Text>
            <Text style={styles.pdfFallbackText}>Tente abrir no visualizador externo do aparelho.</Text>
            <TouchableOpacity onPress={openExternal} style={styles.pdfFallbackButton}>
              <Text style={styles.pdfFallbackButtonText}>Abrir externo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PdfViewer
            sourceUri={document.uri}
            style={styles.pdfNativeViewer}
            onError={handlePdfError}
            onLoad={() => setPdfLoadError(null)}
          />
        )
      ) : (
        <View style={[styles.epubPanel, { maxWidth: contentMaxWidth }, compact && styles.epubPanelCompact]}>
          {epubLoading ? (
            <Text style={[styles.epubTitle, { color: textTheme[theme] }]}>Carregando EPUB...</Text>
          ) : null}

          {epubError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Nao foi possivel processar o EPUB</Text>
              <Text style={styles.errorText}>{epubError}</Text>
              <Text style={styles.errorText}>Tente abrir pelo botao "Abrir externo".</Text>
            </View>
          ) : null}

          {!epubLoading && !epubError && epubData && selectedChapter ? (
            <>
              <Text style={[styles.epubTitle, { color: textTheme[theme] }]}>{epubData.title}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chapterList}>
                {epubData.chapters.map((chapter, index) => {
                  const isActive = index === selectedChapterIndex;

                  return (
                    <TouchableOpacity
                      key={chapter.id}
                      onPress={() => setSelectedChapterIndex(index)}
                      style={[styles.chapterChip, isActive && styles.chapterChipActive]}
                    >
                      <Text style={[styles.chapterChipText, isActive && styles.chapterChipTextActive]} numberOfLines={1}>
                        {chapter.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <ScrollView
                contentContainerStyle={styles.chapterContent}
                onMomentumScrollBegin={handleScrollStart}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollBeginDrag={handleScrollStart}
                onScrollEndDrag={handleScrollEnd}
                scrollEventThrottle={16}
              >
                <Text style={[styles.chapterTitle, { color: textTheme[theme] }]}>{selectedChapter.title}</Text>
                <Text style={[styles.epubText, { color: textTheme[theme], fontSize }]}>{selectedChapter.content}</Text>
              </ScrollView>
            </>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readerHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  readerHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  headerInfoCompact: {
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 220,
  },
  meta: {
    marginTop: 3,
    color: '#cbd5e1',
    fontSize: 12,
  },
  openButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  openButtonCompact: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  openButtonText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
  },
  controlsWrapper: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  dropdownHeader: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownHeaderOpen: {
    backgroundColor: '#475569',
  },
  dropdownTitle: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 13,
  },
  dropdownChevron: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  dropdownPanel: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    borderRadius: 8,
    backgroundColor: '#334155',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  controlText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  pdfNativeViewer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
  },
  pdfFallback: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 10,
  },
  pdfFallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  pdfFallbackText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  pdfFallbackButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  pdfFallbackButtonText: {
    color: '#fbbf24',
    fontWeight: '800',
    fontSize: 13,
  },
  epubPanel: {
    flex: 1,
    padding: 12,
    alignSelf: 'center',
    width: '100%',
  },
  epubPanelCompact: {
    padding: 10,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#0f172a',
    fontSize: 14,
  },
  searchMeta: {
    marginTop: 8,
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  searchActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    borderRadius: 8,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  searchButtonDisabled: {
    opacity: 0.4,
  },
  searchButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  themeGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  themeButton: {
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  themeButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  epubTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  chapterList: {
    maxHeight: 44,
    marginBottom: 10,
  },
  chapterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#94a3b8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: '#e2e8f0',
    maxWidth: 180,
  },
  chapterChipActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  chapterChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  chapterChipTextActive: {
    color: '#92400e',
  },
  chapterContent: {
    paddingBottom: 40,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  epubText: {
    lineHeight: 30,
  },
  errorBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    backgroundColor: '#fee2e2',
  },
  errorTitle: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 4,
    color: '#991b1b',
    fontSize: 13,
  },
});
