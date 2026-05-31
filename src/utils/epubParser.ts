import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { Platform } from 'react-native';

export type ParsedEpubChapter = {
  id: string;
  title: string;
  content: string;
};

export type ParsedEpub = {
  title: string;
  chapters: ParsedEpubChapter[];
};

function getAttributeValue(tag: string, attrName: string): string | null {
  const attrRegex = new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i');
  const match = tag.match(attrRegex);
  return match?.[1] ?? null;
}

function getFirstTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}\\b[^>]*>`, 'i');
  const match = xml.match(regex);
  return match?.[0] ?? null;
}

function getAllTags(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const matches = xml.match(regex);
  return matches ?? [];
}

function getTitleFromMetadata(opfXml: string): string {
  const titleMatch =
    opfXml.match(/<(?:\w+:)?title\b[^>]*>([\s\S]*?)<\/(?:\w+:)?title>/i) ||
    opfXml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);

  if (!titleMatch?.[1]) {
    return 'Livro EPUB';
  }

  const cleanTitle = stripHtml(titleMatch[1]);
  return cleanTitle.length > 0 ? cleanTitle : 'Livro EPUB';
}

function dirname(path: string): string {
  const idx = path.lastIndexOf('/');

  if (idx === -1) {
    return '';
  }

  return path.slice(0, idx + 1);
}

function joinPath(base: string, relative: string): string {
  if (!base) {
    return relative;
  }

  if (relative.startsWith('/')) {
    return relative.slice(1);
  }

  return `${base}${relative}`;
}

function stripHtml(input: string): string {
  const noScript = input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const withBreaks = noScript.replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\s*\/p\s*>/gi, '\n\n');
  const noTags = withBreaks.replace(/<[^>]+>/g, ' ');

  return noTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function guessChapterTitle(rawHtml: string, fallback: string) {
  const titleMatch =
    rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    rawHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) ||
    rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  if (!titleMatch?.[1]) {
    return fallback;
  }

  const clean = stripHtml(titleMatch[1]);
  return clean.length > 0 ? clean : fallback;
}

async function loadZipFromUri(uri: string): Promise<JSZip> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error('Falha ao carregar o arquivo EPUB no ambiente web.');
    }

    const arrayBuffer = await response.arrayBuffer();
    return JSZip.loadAsync(arrayBuffer);
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return JSZip.loadAsync(base64, { base64: true });
}

export async function parseEpubFromUri(uri: string): Promise<ParsedEpub> {
  const zip = await loadZipFromUri(uri);
  const containerFile = zip.file('META-INF/container.xml');

  if (!containerFile) {
    throw new Error('EPUB invalido: container.xml nao encontrado.');
  }

  const containerXml = await containerFile.async('text');
  const rootfileTag = getFirstTag(containerXml, 'rootfile');
  const opfPath = rootfileTag ? getAttributeValue(rootfileTag, 'full-path') : null;

  if (!opfPath) {
    throw new Error('EPUB invalido: arquivo OPF nao encontrado.');
  }

  const opfFile = zip.file(opfPath);
  if (!opfFile) {
    throw new Error('EPUB invalido: caminho OPF nao existe no arquivo.');
  }

  const opfXml = await opfFile.async('text');
  const title = getTitleFromMetadata(opfXml);

  const manifestItems = getAllTags(opfXml, 'item');
  const spineItems = getAllTags(opfXml, 'itemref');
  const basePath = dirname(opfPath);

  const hrefById = new Map<string, string>();
  for (const item of manifestItems) {
    const id = getAttributeValue(item, 'id');
    const href = getAttributeValue(item, 'href');

    if (id && href) {
      hrefById.set(id, href);
    }
  }

  const chapterPaths = spineItems
    .map((item) => getAttributeValue(item, 'idref'))
    .filter((idref): idref is string => typeof idref === 'string' && hrefById.has(idref))
    .map((idref) => joinPath(basePath, hrefById.get(idref) || ''));

  const resolvedChapterPaths = chapterPaths.length
    ? chapterPaths
    : manifestItems
        .map((item) => getAttributeValue(item, 'href'))
        .filter((href): href is string => typeof href === 'string' && /\.x?html?$/i.test(href))
        .map((href) => joinPath(basePath, href));

  const chapters: ParsedEpubChapter[] = [];

  for (let i = 0; i < resolvedChapterPaths.length; i += 1) {
    const chapterPath = resolvedChapterPaths[i];
    const chapterFile = zip.file(chapterPath);

    if (!chapterFile) {
      continue;
    }

    const rawHtml = await chapterFile.async('text');
    const content = stripHtml(rawHtml);

    if (!content) {
      continue;
    }

    chapters.push({
      id: `${i + 1}`,
      title: guessChapterTitle(rawHtml, `Capitulo ${i + 1}`),
      content,
    });
  }

  if (chapters.length === 0) {
    throw new Error('Nao foi possivel extrair capitulos deste EPUB.');
  }

  return {
    title,
    chapters,
  };
}
