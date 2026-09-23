import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Header } from './src/components/ui';
import FormScreen from './src/screens/FormScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import { colors } from './src/theme';

// تنقل بسيط بالحالة: الرئيسية ← النموذج ← النتيجة، أو الرئيسية ← القارئ
export default function App() {
  const [screen, setScreen] = useState('home');
  const [type, setType] = useState(null);
  const [data, setData] = useState(null);

  const goBack = () => {
    if (screen === 'result') setScreen('form');
    else setScreen('home');
  };

  // زر الرجوع في أندرويد
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'home') return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  });

  const titles = {
    form: type?.title,
    result: 'الباركود جاهز',
    scanner: 'قراءة باركود',
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.top} edges={['top']}>
        {screen !== 'home' ? <Header title={titles[screen]} onBack={goBack} /> : null}
      </SafeAreaView>
      <SafeAreaView style={styles.body} edges={['bottom']}>
        {screen === 'home' ? (
          <HomeScreen
            onSelectType={(t) => {
              setType(t);
              setScreen('form');
            }}
            onOpenScanner={() => setScreen('scanner')}
          />
        ) : null}

        {/* النموذج يبقى محمّلاً أثناء عرض النتيجة حتى لا تضيع البيانات عند الرجوع */}
        {type && (screen === 'form' || screen === 'result') ? (
          <View style={[styles.body, screen !== 'form' && styles.hidden]}>
            <FormScreen
              key={type.id}
              type={type}
              onGenerated={(payload) => {
                setData(payload);
                setScreen('result');
              }}
            />
          </View>
        ) : null}

        {screen === 'result' ? <ResultScreen data={data} /> : null}
        {screen === 'scanner' ? <ScannerScreen /> : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  top: {
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hidden: {
    display: 'none',
  },
});
