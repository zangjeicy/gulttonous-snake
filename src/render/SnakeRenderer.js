/**
 * SnakeRenderer — 蛇身渲染器
 * 霓虹辉光、头身渐变、蛇眼、圆角段
 */
export class SnakeRenderer {
  render(ctx, snake, grid) {
    const body = snake.body;
    if (!body || body.length === 0) return;

    const cellSize = grid.cellSize;
    const total = body.length;

    // 从尾部向头部绘制（头部在最上层）
    for (let i = total - 1; i >= 0; i--) {
      const seg = body[i];
      const { px, py } = grid.cellToPixel(seg.x, seg.y);
      const isHead = i === 0;

      // 颜色从头部亮绿到尾部深青
      const t = i / Math.max(total - 1, 1);
      const alpha = 1 - t * 0.5;

      // 增长动画：最后一段淡入
      let segAlpha = alpha;
      let scale = 1;
      if (snake.justGrew && i === total - 1) {
        segAlpha = 0.5;
        scale = 0.7;
      }

      this._drawSegment(ctx, px, py, cellSize, isHead, segAlpha, scale, t);
    }

    // 绘制蛇眼
    this._drawEyes(ctx, snake, grid);
  }

  _drawSegment(ctx, px, py, cellSize, isHead, alpha, scale, t) {
    const padding = 2;
    const size = (cellSize - padding * 2) * scale;
    const offsetX = (cellSize - size) / 2;
    const x = px + offsetX;
    const y = py + offsetX;
    const radius = isHead ? 8 : 6;

    ctx.save();

    // 辉光
    if (isHead) {
      ctx.shadowColor = '#00ffa3';
      ctx.shadowBlur = 16;
    } else {
      ctx.shadowColor = '#00ffa3';
      ctx.shadowBlur = 8 * alpha;
    }

    // 渐变填充
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    if (isHead) {
      gradient.addColorStop(0, '#00ffa3');
      gradient.addColorStop(1, '#00cc82');
    } else {
      const r = Math.floor(0 + (0 - 0) * t);
      const g = Math.floor(255 - 80 * t);
      const b = Math.floor(163 - 40 * t);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${r}, ${Math.max(g - 30, 100)}, ${Math.max(b - 20, 60)}, ${alpha})`);
    }

    ctx.fillStyle = gradient;
    this._roundRect(ctx, x, y, size, size, radius);
    ctx.fill();

    // 头部高亮边框
    if (isHead) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      this._roundRect(ctx, x, y, size, size, radius);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawEyes(ctx, snake, grid) {
    const head = snake.head;
    if (!head) return;
    const { cx, cy } = grid.cellToPixelCenter(head.x, head.y);
    const dir = snake.direction;
    const cellSize = grid.cellSize;
    const eyeOffset = cellSize * 0.2;
    const eyeRadius = cellSize * 0.08;

    // 根据方向计算眼睛位置
    const perpX = -dir.y;
    const perpY = dir.x;

    const eye1x = cx + dir.x * eyeOffset + perpX * eyeOffset;
    const eye1y = cy + dir.y * eyeOffset + perpY * eyeOffset;
    const eye2x = cx + dir.x * eyeOffset - perpX * eyeOffset;
    const eye2y = cy + dir.y * eyeOffset - perpY * eyeOffset;

    ctx.save();
    // 眼白
    ctx.fillStyle = '#0a0e1a';
    ctx.shadowColor = '#00ffa3';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(eye1x, eye1y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2x, eye2y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1x + dir.x * 1, eye1y + dir.y * 1, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2x + dir.x * 1, eye2y + dir.y * 1, eyeRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 圆角矩形路径 */
  _roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
