import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { mockBooks } from '../data/mockBooks';
import { Book, BookCategory, ReaderDocument, ReaderProgress } from '../types';

const LIBRARY_STORAGE_KEY = 'kindlern/library-state-v1';

type PersistedLibraryState = {
  selectedCategory: BookCategory;
  uploadedDocuments: ReaderDocument[];
  favoriteDocumentIds: string[];
  readerProgressByDocumentId: Record<string, ReaderProgress>;
};

type LibraryContextType = {
  books: Book[];
  selectedCategory: BookCategory;
  uploadedDocuments: ReaderDocument[];
  favoriteDocumentIds: string[];
  readerProgressByDocumentId: Record<string, ReaderProgress>;
  setSelectedCategory: (category: BookCategory) => void;
  addUploadedDocument: (document: ReaderDocument) => void;
  updateUploadedDocument: (documentId: string, updates: Partial<ReaderDocument>) => void;
  removeUploadedDocument: (documentId: string) => void;
  toggleFavoriteDocument: (documentId: string) => void;
  saveReaderProgress: (documentId: string, progress: ReaderProgress) => void;
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('tecnico');
  const [uploadedDocuments, setUploadedDocuments] = useState<ReaderDocument[]>([]);
  const [favoriteDocumentIds, setFavoriteDocumentIds] = useState<string[]>([]);
  const [readerProgressByDocumentId, setReaderProgressByDocumentId] = useState<Record<string, ReaderProgress>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  const addUploadedDocument = useCallback((document: ReaderDocument) => {
    setUploadedDocuments((prev) => [document, ...prev]);
  }, []);

  const updateUploadedDocument = useCallback((documentId: string, updates: Partial<ReaderDocument>) => {
    setUploadedDocuments((prev) =>
      prev.map((document) =>
        document.id === documentId
          ? {
              ...document,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : document
      )
    );
  }, []);

  const removeUploadedDocument = useCallback((documentId: string) => {
    setUploadedDocuments((prev) => prev.filter((document) => document.id !== documentId));
    setFavoriteDocumentIds((prev) => prev.filter((id) => id !== documentId));
    setReaderProgressByDocumentId((prev) => {
      if (!prev[documentId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[documentId];
      return next;
    });
  }, []);

  const toggleFavoriteDocument = useCallback((documentId: string) => {
    setFavoriteDocumentIds((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [documentId, ...prev]
    );
  }, []);

  const saveReaderProgress = useCallback((documentId: string, progress: ReaderProgress) => {
    setReaderProgressByDocumentId((prev) => {
      const current = prev[documentId];

      if (
        current &&
        current.chapterIndex === progress.chapterIndex &&
        current.fontSize === progress.fontSize &&
        current.theme === progress.theme &&
        (current.searchQuery ?? '') === (progress.searchQuery ?? '')
      ) {
        return prev;
      }

      return {
        ...prev,
        [documentId]: progress,
      };
    });
  }, []);

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const raw = await AsyncStorage.getItem(LIBRARY_STORAGE_KEY);

        if (!raw) {
          setIsHydrated(true);
          return;
        }

        const parsed = JSON.parse(raw) as PersistedLibraryState;

        if (parsed.selectedCategory) {
          setSelectedCategory(parsed.selectedCategory);
        }

        if (Array.isArray(parsed.uploadedDocuments)) {
          setUploadedDocuments(parsed.uploadedDocuments);
        }

        if (Array.isArray(parsed.favoriteDocumentIds)) {
          setFavoriteDocumentIds(parsed.favoriteDocumentIds);
        }

        if (parsed.readerProgressByDocumentId && typeof parsed.readerProgressByDocumentId === 'object') {
          setReaderProgressByDocumentId(parsed.readerProgressByDocumentId);
        }
      } catch {
        // Ignore hydration failures to keep app usable.
      } finally {
        setIsHydrated(true);
      }
    };

    void loadPersistedState();
  }, []);

  useEffect(() => {
    const persistState = async () => {
      if (!isHydrated) {
        return;
      }

      try {
        const toPersist: PersistedLibraryState = {
          selectedCategory,
          uploadedDocuments,
          favoriteDocumentIds,
          readerProgressByDocumentId,
        };

        await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(toPersist));
      } catch {
        // Ignore persistence failures to avoid crashing UI interactions.
      }
    };

    void persistState();
  }, [isHydrated, selectedCategory, uploadedDocuments, favoriteDocumentIds, readerProgressByDocumentId]);

  const value = useMemo(
    () => ({
      books: mockBooks,
      selectedCategory,
      uploadedDocuments,
      favoriteDocumentIds,
      readerProgressByDocumentId,
      setSelectedCategory,
      addUploadedDocument,
      updateUploadedDocument,
      removeUploadedDocument,
      toggleFavoriteDocument,
      saveReaderProgress,
    }),
    [
      selectedCategory,
      uploadedDocuments,
      favoriteDocumentIds,
      readerProgressByDocumentId,
      addUploadedDocument,
      updateUploadedDocument,
      removeUploadedDocument,
      toggleFavoriteDocument,
      saveReaderProgress,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error('useLibrary must be used inside LibraryProvider');
  }

  return context;
}
