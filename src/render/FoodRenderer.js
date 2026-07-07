/**
 * FoodRenderer — 食物渲染器
 * 脉冲发光、辉光环、内核高亮
 */
export class FoodRenderer {
  render(ctx, food, grid) {
    if (!food.position) return;

    const { cx, cy } = grid.cellToPixelCenter(food.position.x, food.position.y);
    const baseRadius = grid.cellSize * 0.35;
    const scale = food.pulseScale;
    const radius = baseRadius * scale;

    // 外层辉光
    ctx.save();
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = 20 + scale * 10;
    ctx.fillStyle = '#ff2e88';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 中层渐变
    ctx.save();
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ff6bb0');
    gradient.addColorStop(0.7, '#ff2e88');
    gradient.addColorStop(1, 'rgba(255, 46, 136, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 内核高亮
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.2, cy - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
