/**
 * Effects — 粒子特效系统
 * 吃食物爆裂、死亡爆炸、光圈扩散
 */
const MAX_PARTICLES = 200;

export class Effects {
  constructor() {
    this.particles = [];
    this.rings = []; // 扩散光圈
  }

  /**
   * 吃食物时爆裂粒子
   * @param {number} cx - 像素中心 x
   * @param {number} cy - 像素中心 y
   * @param {string} color - 粒子颜色
   */
  burst(cx, cy, color = '#00ffa3') {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3;
      this._addParticle({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color,
      });
    }
    // 添加扩散光圈
    this.rings.push({
      x: cx,
      y: cy,
      radius: 5,
      maxRadius: 40,
      alpha: 0.8,
      color,
    });
  }

  /**
   * 死亡爆炸特效
   * @param {Array<{x,y}>} body - 蛇身像素坐标列表
   * @param {number} cellSize
   */
  explosion(body, cellSize) {
    const color = '#ff3b5c';
    for (const seg of body) {
      const cx = seg.x * cellSize + cellSize / 2;
      const cy = seg.y * cellSize + cellSize / 2;
      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        this._addParticle({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.015 + Math.random() * 0.015,
          size: 2 + Math.random() * 4,
          color: i % 2 === 0 ? color : '#ffb800',
        });
      }
    }
  }

  _addParticle(p) {
    if (this.particles.length >= MAX_PARTICLES) {
      this.particles.shift();
    }
    this.particles.push(p);
  }

  /** 更新粒子状态 */
  update() {
    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 更新光圈
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.radius += 2;
      r.alpha -= 0.04;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.rings.splice(i, 1);
      }
    }
  }

  /** 渲染粒子和光圈 */
  render(ctx) {
    // 渲染扩散光圈
    for (const r of this.rings) {
      ctx.save();
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = r.alpha;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 渲染粒子
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.rings = [];
  }
}
