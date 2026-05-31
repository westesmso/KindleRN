import { Platform } from 'react-native';

type PdfViewerProps = {
  sourceUri: string;
  onError: () => void;
  onLoad: () => void;
  style?: any;
};

export function PdfViewer(props: PdfViewerProps) {
  const Impl = Platform.OS === 'web' ? require('./PdfViewer.web').PdfViewer : require('./PdfViewer.native').PdfViewer;
  return <Impl {...props} />;
}
