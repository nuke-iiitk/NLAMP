import { StyleSheet, View } from 'react-native';

import { Colors } from '../constants/theme';

export default function ProgressTrack({
  progress,
  color = Colors.green,
  height = 12,
}: {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height }]} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${Math.round(clamped * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
