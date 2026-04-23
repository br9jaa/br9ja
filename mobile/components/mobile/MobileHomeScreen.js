import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, Gamepad2, ShieldCheck, SmartphoneCharging, Wallet2, Zap } from 'lucide-react-native';

import MetricCard from './MetricCard';
import ActionTile from './ActionTile';

const { createApiClient } = require('../../../services/api');

const apiClient = createApiClient();
const providerPreview = apiClient.describeProviders();

export default function MobileHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>BR9</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>Android Foundation</Text>
            </View>
          </View>

          <Text style={styles.eyebrow}>BR9ja Mobile</Text>
          <Text style={styles.heroTitle}>Wallet-first payments with BR9 Gold momentum.</Text>
          <Text style={styles.heroCopy}>
            Expo Router now drives the app shell, shared provider clients are ready for VTpass and SquadCo,
            and the UI foundation is set up for Material Design 3 patterns on Android.
          </Text>
        </View>

        <View style={styles.metricRow}>
          <MetricCard label="BR9 Gold Target" value="1,000" tone="gold" />
          <MetricCard label="Wallet Snapshot" value="₦24,800" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Core Actions</Text>
          <Text style={styles.sectionTitle}>Separate mobile UI, app-first flows.</Text>
          <View style={styles.actionGrid}>
            <ActionTile
              icon={Wallet2}
              label="Wallet"
              caption="Balance, receipts, and weekly payout rhythm stay visible."
              highlight
            />
            <ActionTile
              icon={SmartphoneCharging}
              label="Bill Pay"
              caption="Provider-backed airtime, utilities, and vending flows."
            />
            <ActionTile
              icon={Gamepad2}
              label="BR9 Gold"
              caption="App-only play loop and benchmark progress belong here."
            />
            <ActionTile
              icon={ShieldCheck}
              label="Security"
              caption="PIN, biometrics, and verified device posture stay central."
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Provider Bridge</Text>
          <Text style={styles.sectionTitle}>Shared API shape for web and Android.</Text>

          {providerPreview.map((provider) => (
            <View key={provider.provider} style={styles.providerRow}>
              <View>
                <Text style={styles.providerLabel}>{provider.provider}</Text>
                <Text style={styles.providerCaption}>{provider.baseUrl}</Text>
              </View>
              <View style={styles.providerBadge}>
                <ArrowUpRight color="#041126" size={16} strokeWidth={2.4} />
                <Text style={styles.providerBadgeText}>Ready</Text>
              </View>
            </View>
          ))}

          <View style={styles.providerNote}>
            <Zap color="#FFD700" size={18} strokeWidth={2.4} />
            <Text style={styles.providerNoteText}>
              Use the shared client for meter verification, vending, virtual accounts, and webhook-aware provider routing.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#041126',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  heroCard: {
    gap: 14,
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    backgroundColor: '#07192F',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
  },
  brandMarkText: {
    color: '#041126',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,215,0,0.10)',
  },
  heroChipText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eyebrow: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#F8FBFF',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  heroCopy: {
    color: 'rgba(244,247,251,0.76)',
    fontSize: 15,
    lineHeight: 24,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 14,
  },
  sectionCard: {
    gap: 16,
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionEyebrow: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#F8FBFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  providerLabel: {
    color: '#F8FBFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  providerCaption: {
    color: 'rgba(244,247,251,0.68)',
    fontSize: 12,
    lineHeight: 18,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFD700',
  },
  providerBadgeText: {
    color: '#041126',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  providerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  providerNoteText: {
    flex: 1,
    color: 'rgba(244,247,251,0.78)',
    fontSize: 13,
    lineHeight: 20,
  },
});
