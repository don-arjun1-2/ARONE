import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  db,
  auth,
  handleFirestoreError,
  OperationType,
  setAccessToken,
} from './services/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  JarvisHeaderHUD,
  SystemStatusMenu,
  PerformanceOverviewHUD,
  SystemMonitorHUD,
  NetworkBatteryHUD,
  QuickAccessHUD,
} from './components/JarvisHUDPanels';
import { JarvisHoloGlobe } from './components/JarvisHoloGlobe';
import { JarvisHoloDeckModal } from './components/JarvisHoloDeckModal';
import { VoiceAssistantPanel } from './components/VoiceAssistantPanel';
import { ChatInterface } from './components/ChatInterface';
import { SmartHomeHub, SmartDeviceState } from './components/SmartHomeHub';
import { ExecutiveTasks } from './components/ExecutiveTasks';
import { MeetingsManager, MeetingItem } from './components/MeetingsManager';
import { EmailCenter, EmailItem } from './components/EmailCenter';
import { EncryptedVault, DecryptedLogItem } from './components/EncryptedVault';
import { SystemTelemetry } from './components/SystemTelemetry';
import {
  ChatMessage,
  AssistantMode,
  sendChatMessage,
  generateSpeechTTS,
  playBase64Audio,
  stopAudioPlayback,
  speakWithBrowserSpeech,
} from './services/geminiClient';
import { parseUserCommand } from './utils/commandParser';
import { encryptLog, decryptLog, computeHash } from './utils/crypto';
import { computeDailyInsight } from './utils/telemetryInsight';
import { loadWakeWordSettings, DEFAULT_WAKE_WORD } from './utils/wakeWordDetector';
import { useVoiceListener } from './hooks/useVoiceListener';

// Initial Seed Data
const DEFAULT_DEVICES: SmartDeviceState[] = [
  { id: 'dev-1', name: 'Ambient Chandeliers', room: 'Living Room', type: 'light', isOn: true, value: 80 },
  { id: 'dev-2', name: 'Executive Desk Luminaires', room: 'Executive Office', type: 'light', isOn: true, value: 100 },
  { id: 'dev-3', name: 'Master Suite Climate Control', room: 'Master Suite', type: 'thermostat', isOn: true, value: 72 },
  { id: 'dev-4', name: 'Front Perimeter Security Lock', room: 'Security Perimeter', type: 'lock', isOn: true },
  { id: 'dev-5', name: 'Front Entrance Surveillance', room: 'Security Perimeter', type: 'camera', isOn: true },
  { id: 'dev-6', name: 'Audiophile Soundscape', room: 'Living Room', type: 'media', isOn: false, value: 50 },
];

const DEFAULT_MEETINGS: MeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Executive Strategic Briefing with Board',
    attendees: 'arjun@company.com, stakeholders',
    scheduledTime: 'Tomorrow at 10:00 AM',
    duration: '45m',
    location: 'Google Meet (meet.google.com/aron-exec)',
    status: 'Confirmed',
    agenda: 'Quarterly review of autonomous infrastructure and AI assistant operations.',
  },
  {
    id: 'meet-2',
    title: 'Architectural Review: Quantum Cryptography',
    attendees: 'security-team@company.com',
    scheduledTime: 'Wednesday at 2:00 PM',
    duration: '30m',
    location: 'Google Meet (meet.google.com/aron-crypto)',
    status: 'Confirmed',
    agenda: 'Validation of AES-GCM zero-knowledge database pipelines.',
  },
];

const DEFAULT_EMAILS: EmailItem[] = [
  {
    id: 'email-1',
    recipient: 'board@company.com',
    subject: 'Executive Summary: ARONE Operational Readiness',
    body: 'Greetings,\n\nAll autonomous executive services, smart home integration matrices, and encrypted logging pipelines are currently nominal.\n\nRespectfully,\nARONE Executive Operations',
    status: 'sent',
    priority: 'Confidential',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const DEFAULT_VAULT_KEY = 'ARONE_PROTOCOL_77';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setOAuthToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Holographic Subsystem Modal: null = default Iron Man Globe Bridge
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Assistant & Voice states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [activeMode, setActiveMode] = useState<AssistantMode>('general');
  const [wakeWord, setWakeWord] = useState<string>(() => {
    return loadWakeWordSettings().wakeWord || DEFAULT_WAKE_WORD;
  });

  // Global voice listener & wake-word engine
  const voiceListener = useVoiceListener({
    onCommand: (cmd) => handleSendMessage(cmd),
    isSpeaking,
    onStopSpeaking: () => handleStopSpeaking(),
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Greetings, sir. ARONE is online and operating at maximum capacity. All environmental controls, task matrices, executive calendars, and encrypted audit vaults are standing by. How may I be of service today?',
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Operational state
  const [devices, setDevices] = useState<SmartDeviceState[]>(DEFAULT_DEVICES);
  const [activeScene, setActiveScene] = useState<string>('Home Protocol');
  const [meetings, setMeetings] = useState<MeetingItem[]>(DEFAULT_MEETINGS);
  const [emails, setEmails] = useState<EmailItem[]>(DEFAULT_EMAILS);

  // Encrypted Vault state
  const [vaultUnlocked, setVaultUnlocked] = useState(true);
  const [vaultPassphrase, setVaultPassphrase] = useState(DEFAULT_VAULT_KEY);
  const [encryptedLogs, setEncryptedLogs] = useState<any[]>([]);
  const [decryptedLogs, setDecryptedLogs] = useState<DecryptedLogItem[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Audio playback reference
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) setOAuthToken(token);
      },
      () => {
        setUser(null);
        setOAuthToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Firestore when authenticated
  useEffect(() => {
    if (!user) return;

    const interactionsPath = `users/${user.uid}/interactions`;
    const qInteractions = query(collection(db, interactionsPath));
    const unsubInteractions = onSnapshot(
      qInteractions,
      (snapshot) => {
        const rawList: any[] = [];
        snapshot.forEach((d) => rawList.push({ id: d.id, ...d.data() }));
        setEncryptedLogs(rawList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, interactionsPath);
      }
    );

    const devicesPath = `users/${user.uid}/smartDevices`;
    const qDevices = query(collection(db, devicesPath));
    const unsubDevices = onSnapshot(
      qDevices,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SmartDeviceState[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setDevices(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, devicesPath);
      }
    );

    return () => {
      unsubInteractions();
      unsubDevices();
    };
  }, [user]);

  // Decrypt logs when encryptedLogs or passphrase change
  useEffect(() => {
    if (!vaultUnlocked) {
      setDecryptedLogs([]);
      return;
    }

    const decryptAll = async () => {
      setIsDecrypting(true);
      try {
        const results: DecryptedLogItem[] = [];
        for (const item of encryptedLogs) {
          try {
            const { text, verified } = await decryptLog(
              {
                ciphertext: item.ciphertext,
                iv: item.iv,
                salt: item.salt,
                hashSignature: item.hashSignature,
              },
              vaultPassphrase
            );
            results.push({
              id: item.id,
              actionType: item.actionType || 'directive',
              summary: item.summary || 'Encrypted Interaction',
              decryptedText: text,
              timestamp: item.timestamp || new Date().toISOString(),
              verified,
              modelUsed: item.modelUsed,
              rawCiphertext: item.ciphertext,
              iv: item.iv,
              salt: item.salt,
              hashSignature: item.hashSignature,
            });
          } catch {
            results.push({
              id: item.id,
              actionType: item.actionType || 'directive',
              summary: item.summary || 'Encrypted Record',
              decryptedText: '[Ciphertext Locked - Invalid Key]',
              timestamp: item.timestamp || new Date().toISOString(),
              verified: false,
              rawCiphertext: item.ciphertext,
              iv: item.iv,
              salt: item.salt,
            });
          }
        }
        setDecryptedLogs(results);
      } catch (err) {
        console.error('Decryption error:', err);
      } finally {
        setIsDecrypting(false);
      }
    };

    if (encryptedLogs.length > 0) {
      decryptAll();
    }
  }, [encryptedLogs, vaultUnlocked, vaultPassphrase]);

  // Securely log an interaction with AES-GCM and SHA-256
  const logInteraction = async (
    summary: string,
    actionType: string,
    payload: any,
    modelUsed = 'system'
  ) => {
    try {
      const plaintext = JSON.stringify({
        summary,
        actionType,
        payload,
        timestamp: new Date().toISOString(),
        modelUsed,
      });

      const encrypted = await encryptLog(plaintext, vaultPassphrase);
      const hashSig = await computeHash(encrypted.ciphertext);

      const logDoc = {
        actionType,
        summary,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
        hashSignature: hashSig,
        modelUsed,
        timestamp: new Date().toISOString(),
      };

      if (user) {
        const docRef = doc(collection(db, `users/${user.uid}/interactions`));
        await setDoc(docRef, { ...logDoc, createdAt: serverTimestamp() });
      } else {
        setEncryptedLogs((prev) => [{ id: 'local-' + Date.now(), ...logDoc }, ...prev]);
        setDecryptedLogs((prev) => [
          {
            id: 'local-' + Date.now(),
            actionType,
            summary,
            decryptedText: plaintext,
            timestamp: new Date().toISOString(),
            verified: true,
            modelUsed,
            rawCiphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            salt: encrypted.salt,
            hashSignature: hashSig,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Failed to encrypt interaction log:', err);
    }
  };

  // Google OAuth Login
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res && res.user) {
        setUser(res.user);
        if (res.accessToken) {
          setOAuthToken(res.accessToken);
          setAccessToken(res.accessToken);
        }
        logInteraction('Executive authenticated with Google Workspace', 'auth', {
          email: res.user.email,
        });
        if (autoSpeak) {
          speakText(`Welcome back, ${res.user.displayName || 'sir'}. Google Tasks matrix synchronized.`);
        }
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setOAuthToken(null);
    setAccessToken(null);
    logInteraction('Executive signed out', 'auth', {});
  };

  // Text-To-Speech with automatic browser fallback if Gemini TTS quota is constrained
  const speakText = async (text: string) => {
    try {
      stopAudioPlayback();
      setIsSpeaking(true);
      const ttsData = await generateSpeechTTS(text);
      if (ttsData && ttsData.audioBase64) {
        currentAudioRef.current = playBase64Audio(
          ttsData.audioBase64,
          () => setIsSpeaking(false),
          text
        );
      } else {
        // Fall back gracefully to browser Web Speech API
        speakWithBrowserSpeech(text, () => setIsSpeaking(false));
      }
    } catch (e) {
      console.warn('Gemini TTS rate limited or network failure. Using browser voice fallback:', e);
      speakWithBrowserSpeech(text, () => setIsSpeaking(false));
    }
  };

  const handleStopSpeaking = () => {
    stopAudioPlayback();
    setIsSpeaking(false);
  };

  // Assistant messaging & directive execution
  const handleSendMessage = async (text: string, modeOverride?: AssistantMode) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    const mode = modeOverride || activeMode;
    const command = parseUserCommand(text);

    let systemActionSummary: string | null = null;
    let spokenReplyOverride: string | null = null;

    if (command.type === 'smart_home') {
      const { action, room } = command.parameters;
      if (action === 'toggle_on' || action === 'toggle_off') {
        const turnOn = action === 'toggle_on';
        setDevices((prev) =>
          prev.map((d) => {
            if (
              room === 'all' ||
              d.room.toLowerCase().includes((room || '').toLowerCase()) ||
              d.name.toLowerCase().includes((room || '').toLowerCase())
            ) {
              return { ...d, isOn: turnOn };
            }
            return d;
          })
        );
        systemActionSummary = `Smart Home Command: ${action} in ${room}`;
        spokenReplyOverride = `I have adjusted the ${room === 'all' ? 'environmental devices' : room + ' devices'} as requested, sir.`;
      }
    } else if (command.type === 'schedule_meeting') {
      const { title, date, time } = command.parameters;
      const scheduledTime = date && time ? `${date} at ${time}` : 'Tomorrow at 10:00 AM';
      const newMeet: MeetingItem = {
        id: 'meet-' + Date.now(),
        title: title || 'Executive Briefing',
        attendees: 'arjun@company.com',
        scheduledTime,
        duration: '45m',
        location: 'Google Meet',
        status: 'Confirmed',
        agenda: 'Automated executive coordination via ARONE.',
      };
      setMeetings((prev) => [newMeet, ...prev]);
      systemActionSummary = `Scheduled Meeting: ${newMeet.title}`;
      spokenReplyOverride = `I have confirmed the meeting "${newMeet.title}" for ${newMeet.scheduledTime}.`;
    } else if (command.type === 'send_email') {
      const { recipient, subject, body } = command.parameters;
      const newEmail: EmailItem = {
        id: 'email-' + Date.now(),
        recipient: recipient || 'stakeholders@company.com',
        subject: subject || 'Autonomous Operational Update',
        body: body || 'Sir, all operational parameters remain nominal under ARONE supervision.',
        status: 'sent',
        priority: 'Confidential',
        createdAt: new Date().toISOString(),
      };
      setEmails((prev) => [newEmail, ...prev]);
      systemActionSummary = `Dispatched Email to ${newEmail.recipient}`;
      spokenReplyOverride = `Executive correspondence dispatched to ${newEmail.recipient}.`;
    }

    try {
      const systemContext = `
System State:
- Smart Devices: ${devices.map((d) => `${d.name} (${d.room}): ${d.isOn ? 'ON' : 'OFF'}`).join(', ')}
- Scheduled Meetings: ${meetings.map((m) => `${m.title} at ${m.scheduledTime}`).join('; ')}
- Pending Emails: ${emails.length} items
- Google Tasks API: ${accessToken ? 'Authenticated & Active' : 'Not Authenticated'}
- Active Scene: ${activeScene}
${systemActionSummary ? `[Action Executed by ARONE: ${systemActionSummary}]` : ''}
`;

      const chatHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      chatHistory.push({
        role: 'user',
        content: `${text}\n\n[System Telemetry Context: ${systemContext}]`,
      });

      const response = await sendChatMessage(chatHistory, mode);

      const assistantMsg: ChatMessage = {
        id: 'resp-' + Date.now(),
        role: 'assistant',
        content: response.text,
        modelUsed: response.model,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Encrypt interaction in audit vault
      logInteraction(
        text.slice(0, 60),
        command.type !== 'general_chat' ? command.type : 'chat_directive',
        {
          command,
          response: response.text.slice(0, 200),
          modelUsed: response.model,
        },
        response.model
      );

      // Auto-speak response if enabled
      if (autoSpeak) {
        const speechContent = spokenReplyOverride || response.text;
        speakText(speechContent.slice(0, 300));
      }
    } catch (err: any) {
      console.warn('API communication note, engaging local executive engine:', err);
      const fallbackReply =
        spokenReplyOverride ||
        (systemActionSummary
          ? `Right away, sir. ${systemActionSummary}. System parameters remain nominal.`
          : 'Understood, sir. Directive acknowledged. Autonomous operational matrices are standing by.');

      const fallbackMsg: ChatMessage = {
        id: 'resp-' + Date.now(),
        role: 'assistant',
        content: fallbackReply,
        modelUsed: 'arone-autonomous-core',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);

      logInteraction(
        text.slice(0, 60),
        command.type !== 'general_chat' ? command.type : 'chat_directive',
        {
          command,
          response: fallbackReply,
          modelUsed: 'arone-autonomous-core',
        },
        'arone-autonomous-core'
      );

      if (autoSpeak) {
        speakText(fallbackReply);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Smart Home Device Actions
  const handleToggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const next = !d.isOn;
          logInteraction(`Toggled Device ${d.name} to ${next ? 'ON' : 'OFF'}`, 'smart_home', {
            id,
            name: d.name,
            state: next,
          });
          return { ...d, isOn: next };
        }
        return d;
      })
    );
  };

  const handleUpdateDeviceValue = (id: string, value: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, value } : d))
    );
  };

  const handleActivateScene = (sceneId: string) => {
    setActiveScene(sceneId);
    let spoken = '';

    if (sceneId === 'Night Secure Protocol') {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          isOn: d.type === 'lock' || d.type === 'camera',
          value: d.type === 'thermostat' ? 68 : d.value,
        }))
      );
      spoken = 'Night secure protocol active. Perimeter locked, cameras recording, ambient luminaires deactivated.';
    } else if (sceneId === 'Deep Focus Protocol') {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          isOn: d.room === 'Executive Office' || d.type === 'lock',
          value: d.type === 'light' ? 100 : d.type === 'thermostat' ? 70 : d.value,
        }))
      );
      spoken = 'Deep focus protocol active. Office illuminance set to 100% daylight, external distractions silenced.';
    } else {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          isOn: true,
          value: d.type === 'thermostat' ? 72 : 80,
        }))
      );
      spoken = 'Home protocol restored. All systems running nominal.';
    }

    if (autoSpeak) speakText(spoken);
    logInteraction(`Activated Smart Home Scene: ${sceneId}`, 'smart_home', { scene: sceneId });
  };

  // Meeting actions
  const handleScheduleMeeting = (newMeeting: Omit<MeetingItem, 'id'>) => {
    const item: MeetingItem = {
      ...newMeeting,
      id: 'meet-' + Date.now(),
    };
    setMeetings((prev) => [item, ...prev]);
    logInteraction(`Scheduled Meeting: ${item.title}`, 'schedule_meeting', item);

    const spoken = `Meeting "${item.title}" successfully confirmed for ${item.scheduledTime}.`;
    if (autoSpeak) speakText(spoken);
  };

  const handleCancelMeeting = (meetingId: string) => {
    const target = meetings.find((m) => m.id === meetingId);
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (target) {
      logInteraction(`Cancelled Meeting: ${target.title}`, 'schedule_meeting', { meetingId, title: target.title });
      if (autoSpeak) speakText(`Meeting "${target.title}" has been cancelled, sir.`);
    }
  };

  // Email actions
  const handleSendEmail = (draft: Omit<EmailItem, 'id' | 'createdAt' | 'status'>) => {
    const item: EmailItem = {
      ...draft,
      id: 'email-' + Date.now(),
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setEmails((prev) => [item, ...prev]);
    logInteraction(`Dispatched Email to ${item.recipient}: ${item.subject}`, 'send_email', item);

    const spoken = `Executive email dispatched to ${item.recipient}. Registered in communication outbox.`;
    if (autoSpeak) speakText(spoken);
  };

  const handleDeleteEmail = (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
  };

  // Encrypted Vault Lock/Unlock
  const handleVaultUnlock = async (passphrase: string): Promise<boolean> => {
    try {
      setVaultPassphrase(passphrase);
      setVaultUnlocked(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleVaultLock = () => {
    setVaultUnlocked(false);
  };

  // Daily Insight calculation
  const dailyInsight = computeDailyInsight(
    encryptedLogs.length > 0 ? encryptedLogs : decryptedLogs,
    {
      smartHomeOperations: devices.filter((d) => d.isOn).length,
      emailCount: emails.length,
      meetingsCount: meetings.length,
      tasksCount: 1,
      voiceDirectivesCount: messages.filter((m) => m.role === 'user').length,
    }
  );

  // Cycle Scene Protocol for Quick Access button
  const handleCycleScene = () => {
    const scenes = ['Home Protocol', 'Deep Focus Protocol', 'Night Secure Protocol'];
    const nextIdx = (scenes.indexOf(activeScene) + 1) % scenes.length;
    handleActivateScene(scenes[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-[#020612] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden hud-grid-bg">
      {/* Background Cyber HUD Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#020612]/80 to-[#020612] z-0" />

      {/* Top Header: Insignia + Digital Clock + Weather Telemetry + Controls */}
      <JarvisHeaderHUD
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        vaultUnlocked={vaultUnlocked}
        onToggleVaultLock={() => (vaultUnlocked ? handleVaultLock() : setVaultUnlocked(true))}
        autoSpeak={autoSpeak}
        setAutoSpeak={setAutoSpeak}
        isSpeaking={isSpeaking}
        tasksTokenAvailable={!!accessToken}
        onSelectModule={(id) => setActiveModule(id)}
      />

      {/* Main Jarvis Cockpit Command Center (Matching Reference Image) */}
      <main className="flex-1 w-full max-w-[1550px] mx-auto p-2 sm:p-4 relative z-10 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* LEFT HUD COLUMN: SYSTEM STATUS Menu + PERFORMANCE OVERVIEW */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            {/* System Status Angled Menu */}
            <SystemStatusMenu
              activeModule={activeModule || ''}
              onSelectModule={(id) => setActiveModule(id)}
              tasksTokenAvailable={!!accessToken}
              vaultUnlocked={vaultUnlocked}
            />

            {/* Performance Overview (Oscilloscope Waveform + 4 Gauges: CPU, RAM, GPU, DISK) */}
            <PerformanceOverviewHUD />
          </div>

          {/* CENTER STAGE: Holographic 3D Earth Globe + Orbital Rings + Pedestal + Voice Directive */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[480px]">
            <JarvisHoloGlobe
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onSendMessage={(txt) => handleSendMessage(txt)}
              activeScene={activeScene}
              onOpenModule={(mod) => setActiveModule(mod)}
              isListening={voiceListener.isListening}
              onStartListening={voiceListener.toggleListening}
              onStopListening={voiceListener.toggleListening}
            />
          </div>

          {/* RIGHT HUD COLUMN: SYSTEM MONITOR + NETWORK BATTERY + QUICK ACCESS */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            {/* System Monitor (Waveform + Usage Bars) */}
            <SystemMonitorHUD />

            {/* Network Status + Mobile Gateway Battery + Daily Insight */}
            <NetworkBatteryHUD dailyInsight={dailyInsight} />

            {/* Quick Access (Chat, Voice, Scene Protocol, Vault Lock) */}
            <QuickAccessHUD
              onSelectModule={(id) => setActiveModule(id)}
              onVoiceTrigger={() => {
                setActiveModule('assistant');
              }}
              onCycleScene={handleCycleScene}
              onLockVault={() => (vaultUnlocked ? handleVaultLock() : setVaultUnlocked(true))}
              vaultUnlocked={vaultUnlocked}
            />
          </div>
        </div>
      </main>

      {/* CONTEXTUAL HOLOGRAPHIC HUD MODAL / COCKPIT DECK */}
      <JarvisHoloDeckModal
        isOpen={activeModule !== null}
        onClose={() => setActiveModule(null)}
        title={
          activeModule === 'assistant'
            ? 'COMMAND CORE // NEURAL TERMINAL'
            : activeModule === 'home'
            ? 'DIAGNOSTICS // SMART HOME IOT MATRIX'
            : activeModule === 'tasks'
            ? 'EXECUTIVE DIRECTIVES // GOOGLE TASKS'
            : activeModule === 'meetings'
            ? 'COMMUNICATIONS // EXECUTIVE MEETINGS'
            : activeModule === 'emails'
            ? 'CORRESPONDENCE // EXECUTIVE MAIL OUTBOX'
            : activeModule === 'vault'
            ? 'SECURITY // ZERO-KNOWLEDGE ENCRYPTED VAULT'
            : 'SYSTEM TELEMETRY // REAL-TIME METRICS'
        }
        subtitle={
          activeModule === 'assistant'
            ? 'Direct multi-turn Gemini 3.8 / 4 neural reasoning & vocalization engine'
            : activeModule === 'home'
            ? 'Automated environment scenes, luminaires, thermostats, and perimeter surveillance'
            : activeModule === 'tasks'
            ? 'Bidirectional synchronization with official Google Workspace Tasks API'
            : activeModule === 'meetings'
            ? 'Autonomous schedule coordination, attendee management, and conference links'
            : activeModule === 'emails'
            ? 'High-priority executive drafts, dispatch confirmations, and communication audit'
            : activeModule === 'vault'
            ? 'AES-GCM 256-bit military-grade encryption with SHA-256 tamper-proof signatures'
            : 'Autonomous operations insight, gateway battery health, and event frequency'
        }
      >
        {/* MODULE 1: COMMAND CORE / NEURAL CHAT */}
        {activeModule === 'assistant' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-4">
              <VoiceAssistantPanel
                onSendMessage={(txt) => handleSendMessage(txt)}
                isThinking={isProcessing}
                isSpeaking={isSpeaking}
                onStopSpeaking={handleStopSpeaking}
                autoSpeak={autoSpeak}
                setAutoSpeak={setAutoSpeak}
                initialWakeWord={wakeWord}
                onWakeWordUpdated={(w) => setWakeWord(w)}
              />
            </div>
            <div className="lg:col-span-7">
              <ChatInterface
                messages={messages}
                onSendMessage={(txt, mode) => handleSendMessage(txt, mode)}
                onClearHistory={() => setMessages([])}
                isProcessing={isProcessing}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
              />
            </div>
          </div>
        )}

        {/* MODULE 2: SMART HOME */}
        {activeModule === 'home' && (
          <SmartHomeHub
            devices={devices}
            onToggleDevice={handleToggleDevice}
            onUpdateDeviceValue={handleUpdateDeviceValue}
            onActivateScene={handleActivateScene}
            activeScene={activeScene}
          />
        )}

        {/* MODULE 3: GOOGLE TASKS */}
        {activeModule === 'tasks' && (
          <ExecutiveTasks
            accessToken={accessToken}
            onAuthenticate={handleLogin}
            onLogInteraction={(summary, type, details) => logInteraction(summary, type, details)}
          />
        )}

        {/* MODULE 4: MEETINGS */}
        {activeModule === 'meetings' && (
          <MeetingsManager
            meetings={meetings}
            onScheduleMeeting={handleScheduleMeeting}
            onCancelMeeting={handleCancelMeeting}
          />
        )}

        {/* MODULE 5: EMAILS */}
        {activeModule === 'emails' && (
          <EmailCenter
            emails={emails}
            onSendEmail={handleSendEmail}
            onDeleteEmail={handleDeleteEmail}
          />
        )}

        {/* MODULE 6: ENCRYPTED VAULT */}
        {activeModule === 'vault' && (
          <EncryptedVault
            isUnlocked={vaultUnlocked}
            onUnlock={handleVaultUnlock}
            onLock={handleVaultLock}
            logs={decryptedLogs}
            passphraseInput={vaultPassphrase}
            setPassphraseInput={setVaultPassphrase}
            isDecrypting={isDecrypting}
          />
        )}

        {/* MODULE 7: SYSTEM TELEMETRY */}
        {activeModule === 'logs' && (
          <div className="space-y-4">
            <SystemTelemetry
              activeDevicesCount={devices.filter((d) => d.isOn).length}
              totalDevicesCount={devices.length}
              activeScene={activeScene}
              meetingsCount={meetings.length}
              tasksTokenAvailable={!!accessToken}
              encryptedLogsCount={encryptedLogs.length}
              dailyInsight={dailyInsight}
            />
          </div>
        )}
      </JarvisHoloDeckModal>
    </div>
  );
}
