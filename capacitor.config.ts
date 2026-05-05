import type { CapacitorConfig } from '@capacitor/cli';

const isPawPatrol = process.env.VITE_THEME === 'pawpatrol'
const isElsa = process.env.VITE_THEME === 'elsa'

const config: CapacitorConfig = {
  appId: isPawPatrol ? 'com.pawpatrol.diary' : isElsa ? 'com.elsa.diary' : 'com.ultraman.diary',
  appName: isPawPatrol ? '汪汪队日记' : isElsa ? '艾莎日记' : '奥特曼日记',
  webDir: 'dist'
};

export default config;
