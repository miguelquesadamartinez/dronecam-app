import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const defaultStreamUrl = 'http://192.168.0.102:8888/drone/index.m3u8';
const defaultApiUrl = 'http://192.168.0.102:8000';

export default function HomeScreen() {
  const [inputUrl, setInputUrl] = useState(defaultStreamUrl);
  const [streamUrl, setStreamUrl] = useState(defaultStreamUrl);
  const [isConnected, setIsConnected] = useState(true);

  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [status, setStatus] = useState('Sin conectar al servidor de comandos');
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useVideoPlayer(streamUrl, (player) => {
    player.loop = true;
    player.play();
  });

  const disconnect = () => {
    (player as any)?.pause?.();
    (player as any)?.stop?.();
    setStreamUrl('');
    setIsConnected(false);
  };

  const enviarComando = async (path: string, params: Record<string, string> = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const url = `${apiUrl}${path}${qs ? `?${qs}` : ''}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      setStatus(`${path} -> ${JSON.stringify(data)}`);
    } catch (err: any) {
      setStatus(`Error en ${path}: ${err?.message ?? err}`);
    }
  };

  const despegar = () => {
    Alert.alert('Confirmar despegue', '¿Despegar el dron ahora?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Despegar', onPress: () => enviarComando('/despegar', { altitud: '5' }) },
    ]);
  };

  useEffect(() => {
    if (isConnected && apiUrl) {
      pingRef.current = setInterval(() => enviarComando('/ping'), 2000);
    }
    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, apiUrl]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.controls}>
        <Text style={styles.label}>URL del stream Raspberry Pi</Text>
        <TextInput
          value={inputUrl}
          onChangeText={setInputUrl}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://192.168.0.102:8888/drone/index.m3u8"
          keyboardType="url"
        />
        <Button title="Conectar" onPress={() => { setStreamUrl(inputUrl); setIsConnected(true); }} />
        <View style={styles.spacer}>
          <Button title="Desconectar" onPress={disconnect} disabled={!isConnected} />
        </View>
      </View>

      <VideoView style={styles.video} player={player} allowsFullscreen contentFit="contain" />

      <View style={styles.controls}>
        <Text style={styles.label}>URL del servidor de comandos (RPi)</Text>
        <TextInput
          value={apiUrl}
          onChangeText={setApiUrl}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://192.168.0.102:8000"
          keyboardType="url"
        />

        <View style={styles.row}>
          <View style={styles.half}><Button title="Despegar" onPress={despegar} /></View>
          <View style={styles.half}><Button title="Aterrizar" onPress={() => enviarComando('/aterrizar')} /></View>
        </View>
        <View style={styles.spacer}>
          <Button title="RTL" onPress={() => enviarComando('/rtl')} />
        </View>
        <View style={styles.spacer}>
          <Button title="PARADA DE EMERGENCIA" color="#c0392b" onPress={() => enviarComando('/parada_emergencia')} />
        </View>

        <Text style={styles.status}>{status}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  controls: { padding: 16, backgroundColor: '#111' },
  label: { color: '#fff', marginBottom: 8 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  spacer: { marginTop: 8 },
  video: { width: '100%', height: 300 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  status: { color: '#aaa', marginTop: 12, fontSize: 12 },
});
