import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const defaultStreamUrl = 'http://192.168.0.102:8888/drone/index.m3u8';
const defaultApiUrl = 'http://192.168.0.102:8000';

export default function HomeScreen() {
  const [inputUrl, setInputUrl] = useState(defaultStreamUrl);
  const [streamUrl, setStreamUrl] = useState(defaultStreamUrl);
  const [isConnected, setIsConnected] = useState(true);

  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [status, setStatus] = useState('Sin conectar al servidor de comandos');
  const [motorTestRunning, setMotorTestRunning] = useState(false);
  const [telemetria, setTelemetria] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
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

  const fetchTelemetria = async () => {
    try {
      const res = await fetch(`${apiUrl}/telemetria`);
      setTelemetria(await res.json());
    } catch {
      // se reintenta en el siguiente ciclo
    }
  };

  const moverInicio = (vx: number, yawRate: number) =>
    enviarComando('/mover', { vx: String(vx), yaw_rate: String(yawRate) });
  const moverFin = () => enviarComando('/parar_movimiento');

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${apiUrl}/logs`);
      const data = await res.json();
      setLogs(data.lineas ?? []);
    } catch {
      // se reintenta en el siguiente ciclo
    }
  };

  const ejecutarScript = (nombre: string) => enviarComando('/ejecutar_script', { nombre });
  const detenerScript = () => enviarComando('/detener_script');

  const toggleMotorTest = () => {
    if (motorTestRunning) {
      enviarComando('/motor_test/detener');
      setMotorTestRunning(false);
      return;
    }
    Alert.alert('Prueba de motores', 'Los motores van a girar de verdad, poco a poco. ¿Confirmas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Probar', onPress: () => { enviarComando('/motor_test/iniciar'); setMotorTestRunning(true); } },
    ]);
  };

  useEffect(() => {
    if (isConnected && apiUrl) {
      pingRef.current = setInterval(() => {
        enviarComando('/ping');
        fetchTelemetria();
        fetchLogs();
      }, 2000);
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

      <View style={styles.logBox}>
        <Text style={styles.label}>Consola (últimas líneas)</Text>
        {logs.length === 0 ? (
          <Text style={styles.logLine}>—</Text>
        ) : (
          logs.map((linea, i) => <Text key={i} style={styles.logLine}>{linea}</Text>)
        )}
      </View>

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

        {telemetria && (
          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryText}>
              Modo: {telemetria.modo} {telemetria.armado ? '(ARMADO)' : ''}
            </Text>
            <Text style={styles.telemetryText}>Altitud: {telemetria.altitud?.toFixed?.(1)} m</Text>
            <Text style={styles.telemetryText}>Satélites: {telemetria.satelites ?? '-'}</Text>
            <Text style={styles.telemetryText}>Batería: {telemetria.bateria_voltaje ?? '-'} V</Text>
          </View>
        )}

        <Text style={styles.label}>Movimiento (mantén pulsado)</Text>
        <View style={styles.dpad}>
          <Pressable style={styles.dpadButton} onPressIn={() => moverInicio(2, 0)} onPressOut={moverFin}>
            <Text style={styles.dpadButtonText}>▲ Adelante</Text>
          </Pressable>
          <View style={styles.row}>
            <Pressable style={styles.dpadButton} onPressIn={() => moverInicio(0, -0.5)} onPressOut={moverFin}>
              <Text style={styles.dpadButtonText}>◀ Girar izq.</Text>
            </Pressable>
            <Pressable style={styles.dpadButton} onPressIn={() => moverInicio(0, 0.5)} onPressOut={moverFin}>
              <Text style={styles.dpadButtonText}>Girar der. ▶</Text>
            </Pressable>
          </View>
          <Pressable style={styles.dpadButton} onPressIn={() => moverInicio(-2, 0)} onPressOut={moverFin}>
            <Text style={styles.dpadButtonText}>▼ Atrás</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.half}><Button title="Despegar" onPress={despegar} /></View>
          <View style={styles.half}><Button title="Aterrizar" onPress={() => enviarComando('/aterrizar')} /></View>
        </View>
        <View style={styles.spacer}>
          <Button title="RTL" onPress={() => enviarComando('/rtl')} />
        </View>
        <View style={styles.spacer}>
          <Button title={motorTestRunning ? 'Parar motores' : 'Probar motores'} onPress={toggleMotorTest} />
        </View>
        <View style={styles.spacer}>
          <Button title="PARADA DE EMERGENCIA" color="#c0392b" onPress={() => enviarComando('/parada_emergencia')} />
        </View>

        <View style={styles.separator} />
        <Text style={styles.label}>Ejecutar scripts (drone-env)</Text>
        <View style={styles.row}>
          <View style={styles.half}><Button title="Movimiento" onPress={() => ejecutarScript('movimiento')} /></View>
          <View style={styles.half}><Button title="Misión" onPress={() => ejecutarScript('mision')} /></View>
        </View>
        <View style={styles.spacer}>
          <Button title="Detección personas" onPress={() => ejecutarScript('deteccion_personas')} />
        </View>
        <View style={styles.spacer}>
          <Button title="Detener script" onPress={detenerScript} />
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
  telemetryBox: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 10, marginBottom: 12 },
  telemetryText: { color: '#0f0', fontSize: 12, fontFamily: 'monospace' },
  dpad: { alignItems: 'center', marginBottom: 12 },
  dpadButton: { backgroundColor: '#333', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, margin: 4 },
  dpadButtonText: { color: '#fff', textAlign: 'center' },
  logBox: { backgroundColor: '#111', padding: 12 },
  logLine: { color: '#0f0', fontSize: 11, fontFamily: 'monospace' },
  separator: { height: 1, backgroundColor: '#333', marginVertical: 16 },
});
