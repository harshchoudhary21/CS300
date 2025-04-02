// app/styles/login.style.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  gradientBackground: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  content: { width: '100%', paddingHorizontal: width * 0.06, maxWidth: isTablet ? 500 : '100%', alignSelf: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: isTablet ? 100 : 80, height: isTablet ? 100 : 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15, shadowColor: '#4C63D2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  logoText: { fontSize: isTablet ? 42 : 36, fontWeight: '700', color: '#FFFFFF' },
  logoTitle: { fontSize: isTablet ? 28 : 24, fontWeight: '600', color: '#FFFFFF', letterSpacing: 1 },
  title: { fontSize: isTablet ? 38 : 30, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: isTablet ? 18 : 16, color: '#B8C2FF', marginBottom: 30, textAlign: 'center' },
  signupText: { fontSize: isTablet ? 16 : 14, color: '#B8C2FF', marginRight: 6 },
  signupLink: { fontSize: isTablet ? 16 : 14, color: '#66A5FF', fontWeight: '600' },
  homeLink: { alignItems: 'center', marginTop: 20 },
  homeLinkButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  homeLinkText: { fontSize: isTablet ? 16 : 14, color: '#B8C2FF', marginLeft: 4 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(102, 165, 255, 0.2)', backgroundColor: 'rgba(10, 17, 40, 0.5)', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: isTablet ? 60 : 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', color: '#FFFFFF', fontSize: isTablet ? 17 : 16 },
  visibilityToggle: { paddingHorizontal: 8, paddingVertical: 4 },
  visibilityToggleText: { color: '#66A5FF', fontSize: isTablet ? 15 : 14, fontWeight: '500' },
  button: { borderRadius: 14, paddingVertical: isTablet ? 18 : 16, marginTop: 8, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#4C63D2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  buttonText: { color: '#FFFFFF', fontSize: isTablet ? 18 : 16, fontWeight: '600', marginRight: 8 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  decorCircle: { position: 'absolute', borderRadius: 300, opacity: 0.15, zIndex: 0 },
  decorCircle1: { width: width * 0.7, height: width * 0.7, backgroundColor: '#66A5FF', top: -width * 0.3, right: -width * 0.3 },
  decorCircle2: { width: width * 0.5, height: width * 0.5, backgroundColor: '#4C63D2', bottom: -width * 0.25, left: -width * 0.25 },
  errorText: { 
    color: '#FF6A8E', 
    fontSize: isTablet ? 16 : 14, 
    textAlign: 'center', 
    marginVertical: 12,
    fontWeight: '500'
  },
  buttonDisabled: {
    opacity: 0.7
  },
});