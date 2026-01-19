// src/features/alert-system/lib/alert-sound-manager.ts
class AlertSoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled = true;

  constructor() {
    // Загружаем стандартные звуки
    this.loadSound('default', '/sounds/alert-default.mp3');
    this.loadSound('warning', '/sounds/alert-warning.mp3');
    this.loadSound('critical', '/sounds/alert-critical.mp3');
  }

  loadSound(name: string, path: string) {
    const audio = new Audio(path);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  async play(soundName: string, volume = 0.5): Promise<void> {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName) || this.sounds.get('default');
    if (!sound) return;

    try {
      sound.volume = Math.max(0, Math.min(1, volume));
      sound.currentTime = 0;
      await sound.play();
    } catch (err) {
      console.error('[AlertSoundManager] Play error:', err);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  stopAll() {
    this.sounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

export const alertSoundManager = new AlertSoundManager();
