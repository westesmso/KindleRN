import PDFView from 'react-native-pdf';
import { StyleProp, ViewStyle } from 'react-native';

type PdfViewerProps = {
  sourceUri: string;
  onError: () => void;
  onLoad: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PdfViewer({ sourceUri, onError, onLoad, style }: PdfViewerProps) {
  return (
    <PDFView
      source={{ uri: sourceUri, cache: true }}
      style={style}
      enablePaging
      trustAllCerts={false}
      onError={onError}
      onLoadComplete={onLoad}
    />
  );
}
