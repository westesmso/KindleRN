import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type PdfViewerProps = {
  sourceUri: string;
  onError: () => void;
  onLoad: () => void;
  style?: any;
};

export function PdfViewer(props: PdfViewerProps) {
  const nativeModule = useMemo(() => {
    if (Platform.OS === 'web') {
      return { Impl: require('./PdfViewer.web').PdfViewer };
    }

    try {
      return { Impl: require('./PdfViewer.native').PdfViewer };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error
            : new Error('O visualizador PDF nativo nao esta disponivel neste build.'),
      };
    }
  }, []);

  useEffect(() => {
    if (nativeModule.error) {
      props.onError();
    }
  }, [nativeModule.error, props.onError]);

  const Impl = nativeModule.Impl;

  if (!Impl) {
    return (
      <View style={[styles.fallback, props.style]}>
        <Text style={styles.fallbackTitle}>Visualizador PDF indisponivel</Text>
        <Text style={styles.fallbackText}>Este build nao inclui o modulo nativo necessario para abrir PDFs no app.</Text>
      </View>
    );
  }

  return <Impl {...props} />;
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  fallbackTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
