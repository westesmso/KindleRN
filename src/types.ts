export type BookCategory = 'tecnico' | 'manga' | 'romance';

export type Book = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  description: string;
  coverColor: string;
};

export type ReaderFormat = 'pdf' | 'epub' | 'unknown';

export type ReaderTheme = 'claro' | 'sepia' | 'noite';

export type DocumentGenre = 'tecnico' | 'manga' | 'romance' | 'biografia' | 'outros';

export type ReaderDocument = {
  id: string;
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  extension: string;
  format: ReaderFormat;
  addedAt: string;
  author?: string;
  documentDate?: string;
  genre?: DocumentGenre;
  notes?: string;
  updatedAt?: string;
};

export type ReaderProgress = {
  chapterIndex: number;
  fontSize: number;
  theme: ReaderTheme;
  searchQuery?: string;
  updatedAt: string;
};
