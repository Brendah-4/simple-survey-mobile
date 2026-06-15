import React, { useRef } from 'react';
import { BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webRef = useRef(null);
  const canGoBack = useRef(false);

  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack.current && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: 'https://simple-survey-web-one.vercel.app/' }}
        style={styles.webview}
        onNavigationStateChange={state => { canGoBack.current = state.canGoBack; }}
        onFileDownload={({ nativeEvent: { downloadUrl } }) => Linking.openURL(downloadUrl)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
