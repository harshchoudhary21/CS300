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
  userTypeContainer: { flexDirection: isTablet ? 'row' : 'column', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  userTypeButton: { flex: isTablet ? 0.48 : undefined, marginBottom: isTablet ? 0 : 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#4C63D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  userTypeGradient: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(102, 165, 255, 0.2)' },
  userTypeIconContainer: { width: isTablet ? 70 : 60, height: isTablet ? 70 : 60, borderRadius: 15, backgroundColor: 'rgba(76, 99, 210, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  userTypeTitle: { fontSize: isTablet ? 20 : 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  userTypeDescription: { fontSize: isTablet ? 16 : 14, color: '#B8C2FF' },
  bottomContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  signupText: { fontSize: isTablet ? 16 : 14, color: '#B8C2FF', marginRight: 6 },
  signupLink: { fontSize: isTablet ? 16 : 14, color: '#66A5FF', fontWeight: '600' },
  homeLink: { alignItems: 'center' },
  homeLinkButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  homeLinkText: { fontSize: isTablet ? 16 : 14, color: '#B8C2FF', marginLeft: 4 },
  typeIndicator: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(76, 99, 210, 0.2)', borderRadius: 30, marginBottom: 20 },
  typeIndicatorText: { color: '#66A5FF', fontWeight: '600', fontSize: isTablet ? 16 : 14 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(102, 165, 255, 0.2)', backgroundColor: 'rgba(10, 17, 40, 0.5)', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: isTablet ? 60 : 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', color: '#FFFFFF', fontSize: isTablet ? 17 : 16 },
  visibilityToggle: { paddingHorizontal: 8, paddingVertical: 4 },
  visibilityToggleText: { color: '#66A5FF', fontSize: isTablet ? 15 : 14, fontWeight: '500' },
  button: { borderRadius: 14, paddingVertical: isTablet ? 18 : 16, marginTop: 8, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#4C63D2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  buttonText: { color: '#FFFFFF', fontSize: isTablet ? 18 : 16, fontWeight: '600', marginRight: 8 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  backButtonText: { color: '#B8C2FF', fontSize: isTablet ? 16 : 14, marginLeft: 4 },
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