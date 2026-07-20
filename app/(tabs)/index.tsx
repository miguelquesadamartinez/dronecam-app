import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

const defaultStreamUrl = 'http://192.168.0.100:8080/stream.m3u8';

export default function HomeScreen() {
  const [inputUrl, setInputUrl] = useState(defaultStreamUrl);
  const [streamUrl, setStreamUrl] = useState(defaultStreamUrl);
  const player = useVideoPlayer(streamUrl, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Text style={styles.label}>URL del stream Raspberry Pi</Text>
        <TextInput
          value={inputUrl}
          onChangeText={setInputUrl}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://192.168.0.100:8080/stream.m3u8"
          keyboardType="url"
        />
        <Button title="Conectar" onPress={() => setStreamUrl(inputUrl)} />
      </View>
      <VideoView style={styles.video} player={player} allowsFullscreen contentFit="contain" />
    </View>
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
  video: { width: '100%', height: 300 },
});
