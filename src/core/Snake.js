/**
 * Snake — 蛇实体
 * 管理蛇身数据、移动、增长、自身碰撞检测
 */

// 方向常量
export const Direction = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export class Snake {
  constructor(grid) {
    this.grid = grid;
    this.reset();
  }

  /** 初始化蛇身：中央位置，长度 3，朝右移动 */
  reset() {
    const cx = Math.floor(this.grid.cols / 2);
    const cy = Math.floor(this.grid.rows / 2);

    this.body = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];

    this.direction = { ...Direction.RIGHT };
    this._nextDirection = { ...Direction.RIGHT };
    this._directionQueue = [];
    this._growPending = 0;
    this.justGrew = false; // 渲染用标记：本帧是否刚增长
  }

  /**
   * 设置下一个方向（支持提前排队，提升响应感）
   * 自动拒绝 180° 反转
   */
  setDirection(dir) {
    const lastQueued =
      this._directionQueue.length > 0
        ? this._directionQueue[this._directionQueue.length - 1]
        : this.direction;

    // 拒绝相反方向
    if (dir.x === -lastQueued.x && dir.y === -lastQueued.y) return;
    // 拒绝相同方向（无意义重复）
    if (dir.x === lastQueued.x && dir.y === lastQueued.y) return;

    // 最多缓存 2 个方向，避免队列过长
    if (this._directionQueue.length < 2) {
      this._directionQueue.push(dir);
    }
  }

  /**
   * 蛇向前移动一步
   * @param {boolean} wrapMode - 是否穿墙模式
   * @returns {{ate:boolean, dead:boolean, moved:boolean}}
   */
  step(wrapMode = false) {
    this.justGrew = false;

    // 从队列取出下一个方向
    if (this._directionQueue.length > 0) {
      this.direction = this._directionQueue.shift();
    }

    const head = this.body[0];
    let newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // 边界处理
    if (!this.grid.isInside(newHead.x, newHead.y)) {
      if (wrapMode) {
        newHead = this.grid.wrap(newHead.x, newHead.y);
      } else {
        return { ate: false, dead: true, moved: false };
      }
    }

    // 自身碰撞检测（排除尾部，因为尾部会移走——除非要增长）
    const checkBody = this._growPending > 0 ? this.body : this.body.slice(0, -1);
    for (const seg of checkBody) {
      if (seg.x === newHead.x && seg.y === newHead.y) {
        return { ate: false, dead: true, moved: false };
      }
    }

    // 移动：新头加入
    this.body.unshift(newHead);

    if (this._growPending > 0) {
      this._growPending--;
      this.justGrew = true;
    } else {
      this.body.pop();
    }

    return { ate: false, dead: false, moved: true };
  }

  /** 标记蛇需要增长（下一步移动时生效） */
  grow() {
    this._growPending++;
  }

  /** 蛇头位置 */
  get head() {
    return this.body[0];
  }

  /** 蛇身长度 */
  get length() {
    return this.body.length;
  }
}
