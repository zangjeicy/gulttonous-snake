/**
 * AudioManager — 音频管理
 * 使用 Web Audio API 合成音效，无外部音频文件
 * 音效类型：移动、吃食物、游戏结束、开始
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._initialized = false;
  }

  /** 延迟初始化 AudioContext（需用户交互后） */
  init() {
    if (this._initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio API 不可用');
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /** 恢复 audio context（浏览器自动暂停策略） */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 播放一个合成音
   * @param {number} freq - 频率 Hz
   * @param {number} duration - 时长 ms
   * @param {string} type - 波形 'sine' | 'square' | 'sawtooth' | 'triangle'
   * @param {number} volume - 音量 0~1
   * @param {number} freqEnd - 频率扫描结束值
   */
  _tone(freq, duration, type = 'sine', volume = 0.15, freqEnd = null) {
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration / 1000);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration / 1000 + 0.05);
  }

  /** 吃食物音效：上升双音 */
  playEat() {
    this._tone(523, 80, 'square', 0.12); // C5
    setTimeout(() => this._tone(784, 120, 'square', 0.1), 60); // G5
  }

  /** 游戏结束音效：下降音阶 */
  playGameOver() {
    this._tone(440, 150, 'sawtooth', 0.15, 220); // A4 → A3
    setTimeout(() => this._tone(220, 300, 'sawtooth', 0.12, 110), 120); // A3 → A2
  }

  /** 开始游戏音效 */
  playStart() {
    this._tone(392, 80, 'sine', 0.1); // G4
    setTimeout(() => this._tone(523, 80, 'sine', 0.1), 70); // C5
    setTimeout(() => this._tone(659, 120, 'sine', 0.1), 140); // E5
  }

  /** 暂停音效 */
  playPause() {
    this._tone(440, 60, 'sine', 0.08);
  }
}
