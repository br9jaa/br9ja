import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ActionTile({ icon: Icon, label, caption, highlight = false }) {
  return (
    <Pressable style={[styles.card, highlight ? styles.cardHighlight : null]}>
      <View style={[styles.iconShell, highlight ? styles.iconShellHighlight : null]}>
        <Icon color={highlight ? '#041126' : '#FFD700'} size={20} strokeWidth={2.4} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: 10,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardHighlight: {
    borderColor: 'rgba(255,215,0,0.28)',
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,215,0,0.12)',
  },
  iconShellHighlight: {
    backgroundColor: '#FFD700',
  },
  label: {
    color: '#F8FBFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  caption: {
    color: 'rgba(244,247,251,0.72)',
    fontSize: 13,
    lineHeight: 20,
  },
});
