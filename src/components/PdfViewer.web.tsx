import { StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

type PdfViewerProps = {
  sourceUri: string;
  onError: () => void;
  onLoad: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PdfViewer({ sourceUri, onError, onLoad, style }: PdfViewerProps) {
  return (
    <WebView
      allowsInlineMediaPlayback
      originWhitelist={['*']}
      source={{ uri: sourceUri }}
      style={style}
      cacheEnabled={false}
      javaScriptEnabled
      domStorageEnabled
      onError={onError}
      onHttpError={onError}
      onLoadEnd={onLoad}
      setSupportMultipleWindows={false}
    />
  );
}
