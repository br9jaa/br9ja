import { StyleSheet, Text, View } from 'react-native';

export default function MetricCard({ label, value, tone = 'default' }) {
  return (
    <View style={[styles.card, tone === 'gold' ? styles.cardGold : null]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === 'gold' ? styles.valueGold : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  cardGold: {
    borderColor: 'rgba(255,215,0,0.28)',
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  label: {
    color: 'rgba(244,247,251,0.72)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    color: '#F8FBFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  valueGold: {
    color: '#FFD700',
  },
});
