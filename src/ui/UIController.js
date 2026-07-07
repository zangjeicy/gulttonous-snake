/**
 * UIController — UI 控制器
 * 管理所有 DOM 交互：遮罩层、分数面板、排行榜、按钮、Toast
 */
export class UIController {
  constructor() {
    this.$ = (id) => document.getElementById(id);

    // 缓存常用 DOM
    this.overlays = {
      start: this.$('overlay-start'),
      pause: this.$('overlay-pause'),
      gameover: this.$('overlay-gameover'),
    };
    this.scoreCurrent = this.$('score-current');
    this.scoreBest = this.$('score-best');
    this.snakeLength = this.$('snake-length');
    this.snakeSpeed = this.$('snake-speed');
    this.leaderboardList = this.$('leaderboard-list');
    this.playPauseText = this.$('play-pause-text');
    this.btnPlayPause = this.$('btn-play-pause');
    this.toastContainer = this.$('toast-container');

    this.newRecordBadge = this.$('new-record-badge');
    this.gameoverScore = this.$('gameover-score');
    this.gameoverLength = this.$('gameover-length');
    this.gameoverFood = this.$('gameover-food');
  }

  // ========== 遮罩层 ==========

  showOverlay(name) {
    Object.values(this.overlays).forEach((el) => el.classList.remove('overlay--active'));
    if (this.overlays[name]) {
      this.overlays[name].classList.add('overlay--active');
    }
  }

  hideOverlays() {
    Object.values(this.overlays).forEach((el) => el.classList.remove('overlay--active'));
  }

  // ========== 分数面板 ==========

  updateScore(data) {
    this.scoreCurrent.textContent = data.score;
    this.snakeLength.textContent = data.length;
    this.snakeSpeed.textContent = data.speed + 'x';

    // 分数增长弹跳动画
    if (data.score > 0) {
      this.scoreCurrent.classList.remove('bump');
      void this.scoreCurrent.offsetWidth; // 触发 reflow 重启动画
      this.scoreCurrent.classList.add('bump');
    }
  }

  updateBestScore(score) {
    this.scoreBest.textContent = score;
  }

  // ========== Play/Pause 按钮状态 ==========

  updatePlayPauseButton(state) {
    const states = {
      idle: { text: '开始', icon: '▶' },
      running: { text: '暂停', icon: '⏸' },
      paused: { text: '继续', icon: '▶' },
      game_over: { text: '开始', icon: '▶' },
    };
    const s = states[state] || states.idle;
    this.playPauseText.textContent = s.text;
    this.btnPlayPause.querySelector('.btn-icon').textContent = s.icon;
  }

  // ========== 游戏结束界面 ==========

  showGameOver(result) {
    this.gameoverScore.textContent = result.score;
    this.gameoverLength.textContent = result.length;
    this.gameoverFood.textContent = result.foodCount;
    this.newRecordBadge.style.display = 'none';
    this.showOverlay('gameover');
  }

  showNewRecord() {
    this.newRecordBadge.style.display = 'inline-flex';
  }

  // ========== 排行榜 ==========

  renderLeaderboard(board) {
    if (!board || board.length === 0) {
      this.leaderboardList.innerHTML = '<li class="leaderboard-empty">暂无记录，快来挑战吧！</li>';
      return;
    }

    this.leaderboardList.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];
    for (let i = 0; i < Math.min(board.length, 10); i++) {
      const entry = board[i];
      const li = document.createElement('li');

      const rank = document.createElement('span');
      rank.className = `lb-rank lb-rank-${i + 1}`;
      rank.textContent = i < 3 ? medals[i] : `${i + 1}`;

      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = entry.score;

      const date = document.createElement('span');
      date.className = 'lb-date';
      date.textContent = this._formatDate(entry.date);

      li.appendChild(rank);
      li.appendChild(score);
      li.appendChild(date);
      this.leaderboardList.appendChild(li);
    }
  }

  _formatDate(isoString) {
    const d = new Date(isoString);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  // ========== Toast ==========

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ========== 设置面板 ==========

  getToggleValue(name) {
    const el = this.$(`toggle-${name}`);
    return el.getAttribute('aria-checked') === 'true';
  }

  setToggle(name, value) {
    const el = this.$(`toggle-${name}`);
    if (el) {
      el.setAttribute('aria-checked', String(value));
    }
  }

  onToggle(name, callback) {
    const el = this.$(`toggle-${name}`);
    if (el) {
      el.addEventListener('click', () => {
        const current = el.getAttribute('aria-checked') === 'true';
        const next = !current;
        el.setAttribute('aria-checked', String(next));
        callback(next);
      });
    }
  }
}
