/**
 * Grid — 网格系统
 * 负责坐标转换、边界判定、随机格子生成
 */
export const GRID_CONFIG = {
  COLS: 20,
  ROWS: 20,
  CELL_SIZE: 30, // 像素
  CANVAS_SIZE: 600,
};

export class Grid {
  constructor(config = GRID_CONFIG) {
    this.cols = config.COLS;
    this.rows = config.ROWS;
    this.cellSize = config.CELL_SIZE;
    this.canvasSize = config.CANVAS_SIZE;
  }

  /** 判断坐标是否在网格范围内 */
  isInside(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  /** 穿墙模式：将越界坐标环绕到对侧 */
  wrap(x, y) {
    return {
      x: (x + this.cols) % this.cols,
      y: (y + this.rows) % this.rows,
    };
  }

  /** 网格坐标 → 像素坐标（格子左上角） */
  cellToPixel(x, y) {
    return {
      px: x * this.cellSize,
      py: y * this.cellSize,
    };
  }

  /** 网格坐标 → 像素坐标（格子中心） */
  cellToPixelCenter(x, y) {
    return {
      cx: x * this.cellSize + this.cellSize / 2,
      cy: y * this.cellSize + this.cellSize / 2,
    };
  }

  /**
   * 生成一个不在排除列表中的随机格子
   * @param {Array<{x:number,y:number}>} excluded - 需排除的格子
   * @returns {{x:number,y:number}|null}
   */
  randomCell(excluded = []) {
    const occupied = new Set(excluded.map((c) => `${c.x},${c.y}`));
    const available = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!occupied.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }
}
