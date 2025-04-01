// app/styles/landing.style.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1128' },
  container: { flex: 1, position: 'relative' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: height * 0.05 },
  contentContainer: { width: '100%', alignItems: 'center', padding: width * 0.05, maxWidth: 600 },
  logoContainer: { marginBottom: height * 0.04, shadowColor: '#5485E8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  logoGradient: { width: isTablet ? 180 : 150, height: isTablet ? 180 : 150, borderRadius: isTablet ? 50 : 40, alignItems: 'center', justifyContent: 'center', padding: 20 },
  textContainer: { alignItems: 'center', width: '100%', marginBottom: height * 0.04 },
  title: { fontSize: isTablet ? 52 : 42, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1, textAlign: 'center', textShadowColor: 'rgba(84, 133, 232, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  subtitle: { fontSize: isTablet ? 22 : 18, color: '#E0E6FF', marginTop: 8, textAlign: 'center' },
  divider: { width: 60, height: 4, backgroundColor: '#4C63D2', marginVertical: 20, borderRadius: 2 },
  description: { fontSize: isTablet ? 18 : 16, color: '#B8C2FF', textAlign: 'center', maxWidth: 450, lineHeight: isTablet ? 28 : 24 },
  buttonContainer: { width: '100%', maxWidth: 320, marginBottom: 20 },
  buttonWrapper: { borderRadius: 16, overflow: 'hidden', shadowColor: '#4C63D2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  buttonGradient: { paddingVertical: isTablet ? 18 : 16, paddingHorizontal: 24, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: isTablet ? 20 : 18, fontWeight: '600', marginRight: 8 },
  loginLinkContainer: { flexDirection: 'row', marginTop: 10, alignItems: 'center', marginBottom: 30 },
  loginText: { color: '#B8C2FF', fontSize: isTablet ? 16 : 14, marginRight: 6 },
  loginLink: { color: '#66A5FF', fontSize: isTablet ? 16 : 14, fontWeight: '600' },
  decorCircle: { position: 'absolute', borderRadius: 300, opacity: 0.15, zIndex: 0 },
  decorCircle1: { width: width * 0.7, height: width * 0.7, backgroundColor: '#66A5FF', top: -width * 0.3, right: -width * 0.3 },
  decorCircle2: { width: width * 0.5, height: width * 0.5, backgroundColor: '#4C63D2', bottom: -width * 0.25, left: -width * 0.25 },
  infoContainer: { alignItems: 'center', marginTop: 10, paddingTop: 20, width: '100%', maxWidth: 280 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#66A5FF', marginRight: 10 },
  infoText: { color: '#E0E6FF', fontSize: isTablet ? 16 : 14 },
});