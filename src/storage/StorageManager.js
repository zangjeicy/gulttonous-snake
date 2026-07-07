/**
 * StorageManager — 本地存储管理
 * 排行榜 Top10 读写、用户设置持久化
 */

const LB_KEY = 'snake.leaderboard';
const SETTINGS_KEY = 'snake.settings';
const MAX_RECORDS = 10;

export class StorageManager {
  /**
   * 读取排行榜
   * @returns {Array<{score:number, date:string, length:number}>}
   */
  getLeaderboard() {
    try {
      const raw = localStorage.getItem(LB_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  /**
   * 添加一条分数记录
   * @param {{score:number, length:number}} record
   * @returns {{rank:number, isNewBest:boolean}|null} 排名信息，null 表示未入榜
   */
  addScore(record) {
    const board = this.getLeaderboard();
    const newRecord = {
      score: record.score,
      date: new Date().toISOString(),
      length: record.length,
    };

    board.push(newRecord);
    board.sort((a, b) => b.score - a.score);

    const rank = board.findIndex((r) => r === newRecord) + 1;
    const trimmed = board.slice(0, MAX_RECORDS);

    // 检查是否仍在榜单中
    if (rank > MAX_RECORDS) return null;

    const isNewBest = rank === 1;

    try {
      localStorage.setItem(LB_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('无法保存排行榜', e);
    }

    return { rank, isNewBest };
  }

  /** 获取最高分 */
  getBestScore() {
    const board = this.getLeaderboard();
    return board.length > 0 ? board[0].score : 0;
  }

  /** 清空排行榜 */
  clearLeaderboard() {
    try {
      localStorage.removeItem(LB_KEY);
    } catch (e) {
      console.warn('无法清空排行榜', e);
    }
  }

  /**
   * 读取设置
   * @returns {{soundEnabled:boolean, wrapMode:boolean}}
   */
  getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { soundEnabled: true, wrapMode: false };
      return { soundEnabled: true, wrapMode: false, ...JSON.parse(raw) };
    } catch {
      return { soundEnabled: true, wrapMode: false };
    }
  }

  /** 保存设置 */
  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('无法保存设置', e);
    }
  }
}
