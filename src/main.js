/**
 * NEON SNAKE — 入口文件
 * 初始化所有模块、设置事件回调、启动持久渲染循环
 */
import { Game, GameState } from './core/Game.js';
import { Renderer } from './render/Renderer.js';
import { InputManager } from './input/InputManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { StorageManager } from './storage/StorageManager.js';
import { UIController } from './ui/UIController.js';

// ========== 初始化模块 ==========
const canvas = document.getElementById('game-canvas');
const storage = new StorageManager();
const audio = new AudioManager();
const ui = new UIController();

// 读取存储的设置，应用到模块
const settings = storage.getSettings();
audio.setEnabled(settings.soundEnabled);

// 创建渲染器（必须在 game 之前，因为回调中引用 renderer）
const renderer = new Renderer(canvas.getContext('2d'), null);

// 创建游戏实例，绑定回调
const game = new Game(canvas, {
  onStateChange(newState, oldState) {
    ui.updatePlayPauseButton(newState);

    switch (newState) {
      case GameState.IDLE:
        ui.showOverlay('start');
        renderer.clearEffects();
        break;
      case GameState.RUNNING:
        if (oldState === GameState.PAUSED) {
          ui.hideOverlays();
        } else if (oldState === GameState.IDLE || oldState === GameState.GAME_OVER) {
          ui.hideOverlays();
          audio.playStart();
        }
        break;
      case GameState.PAUSED:
        ui.showOverlay('pause');
        audio.playPause();
        break;
    }
  },

  onScoreChange(data) {
    ui.updateScore(data);
    ui.updateBestScore(storage.getBestScore());
  },

  onEat(data) {
    audio.playEat();
    renderer.triggerEat(data.position);
  },

  onGameOver(result) {
    audio.playGameOver();
    renderer.triggerDeath(result.body);

    // 提交分数到排行榜
    const rankInfo = storage.addScore({
      score: result.score,
      length: result.length,
    });

    // 刷新 UI
    ui.updateBestScore(storage.getBestScore());
    ui.renderLeaderboard(storage.getLeaderboard());

    // 延迟显示结束弹窗（让死亡爆炸特效先播放）
    setTimeout(() => {
      ui.showGameOver(result);
      if (rankInfo) {
        if (rankInfo.isNewBest) {
          ui.showNewRecord();
          ui.showToast('🏆 新纪录！太强了！');
        } else {
          ui.showToast(`上榜成功！第 ${rankInfo.rank} 名`);
        }
      }
    }, 400);
  },
});

// 更新渲染器使用游戏的 ctx 和 grid
renderer.ctx = game.ctx;
renderer.grid = game.grid;
renderer.size = game.grid.canvasSize;

// ========== 输入管理 ==========
const input = new InputManager({
  onDirection(dir) {
    game.handleDirection(dir);
  },
  onStart() {
    audio.init();
    audio.resume();
    if (game.canStart) game.start();
    else if (game.canResume) game.resume();
  },
  onPause() {
    if (game.canPause) game.pause();
    else if (game.canResume) game.resume();
  },
  onReset() {
    game.reset();
    ui.renderLeaderboard(storage.getLeaderboard());
  },
});
input.attach();

// ========== 按钮事件 ==========
document.getElementById('btn-start').addEventListener('click', () => {
  audio.init();
  audio.resume();
  game.start();
});

document.getElementById('btn-resume').addEventListener('click', () => {
  game.resume();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  game.start();
});

document.getElementById('btn-back-home').addEventListener('click', () => {
  game.reset();
});

document.getElementById('btn-play-pause').addEventListener('click', () => {
  audio.init();
  audio.resume();
  if (game.canStart) game.start();
  else if (game.canPause) game.pause();
  else if (game.canResume) game.resume();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  game.reset();
});

document.getElementById('btn-clear-board').addEventListener('click', () => {
  storage.clearLeaderboard();
  ui.renderLeaderboard([]);
  ui.updateBestScore(0);
  ui.showToast('排行榜已清空');
});

// ========== 设置开关 ==========
ui.setToggle('sound', settings.soundEnabled);
ui.setToggle('wrap', settings.wrapMode);

ui.onToggle('sound', (value) => {
  audio.setEnabled(value);
  storage.saveSettings({ ...storage.getSettings(), soundEnabled: value });
  if (value) {
    audio.init();
    audio.resume();
  }
  ui.showToast(value ? '音效已开启' : '音效已关闭');
});

ui.onToggle('wrap', (value) => {
  game.wrapMode = value;
  storage.saveSettings({ ...storage.getSettings(), wrapMode: value });
  ui.showToast(value ? '穿墙模式已开启' : '穿墙模式已关闭');
});

// ========== 初始化界面 ==========
ui.updatePlayPauseButton(GameState.IDLE);
ui.renderLeaderboard(storage.getLeaderboard());
ui.updateBestScore(storage.getBestScore());

// ========== 持久渲染循环 ==========
let lastTime = performance.now();

function frame(now) {
  requestAnimationFrame(frame);

  const dt = Math.min(now - lastTime, 100); // 限制最大 dt 防止后台标签跳帧
  lastTime = now;

  game.update(dt);
  renderer.render(game.getRenderData());
}

requestAnimationFrame(frame);

// ========== 窗口 resize 处理 ==========
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    game.resize();
    renderer.size = game.grid.canvasSize;
  }, 100);
});
