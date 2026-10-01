/* ==========================================================================
   ELEGANT BUTTERFLY & FLOATING PETAL CANVAS ENGINE
   ========================================================================== */

export class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.butterflies = [];
    this.petals = [];
    this.sparkles = [];
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize continuous small floating rose & lavender petals
    this.initContinuousPetals();

    this.isRunning = true;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initContinuousPetals() {
    this.petals = [];
    for (let i = 0; i < 16; i++) {
      this.petals.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.6 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        size: 5 + Math.random() * 5,
        color: i % 2 === 0 ? '#F3D6E4' : '#E6D2F5',
        opacity: 0.5 + Math.random() * 0.45
      });
    }
  }

  /* Trigger initial elegant butterfly burst when envelope opens */
  burstEnvelopeButterflies() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Elegant 5 butterflies
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i + (Math.random() - 0.5) * 0.4;
      const speed = 1.8 + Math.random() * 1.5;
      this.butterflies.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 16 + Math.random() * 8,
        wingAngle: Math.random() * Math.PI,
        wingSpeed: 0.12 + Math.random() * 0.06,
        colorPrimary: i % 2 === 0 ? '#D6C7EC' : '#E8D2F5',
        colorSecondary: i % 2 === 0 ? '#9B7EBD' : '#C6A9E8',
        goldAccent: '#D4AF37',
        opacity: 0.95,
        life: 0,
        maxLife: 350 + Math.random() * 100
      });
    }

    /* Subtle champagne sparkles */
    for (let i = 0; i < 8; i++) {
      this.sparkles.push({
        x: centerX + (Math.random() - 0.5) * 160,
        y: centerY + (Math.random() - 0.5) * 160,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1.2 + Math.random() * 1.5,
        alpha: Math.random() * 0.8,
        vAlpha: 0.015 + Math.random() * 0.015
      });
    }
  }

  /* Spawns a gentle single butterfly during scroll */
  spawnAmbientButterfly() {
    if (this.butterflies.length > 2) return;
    const fromLeft = Math.random() > 0.5;
    this.butterflies.push({
      x: fromLeft ? -30 : this.canvas.width + 30,
      y: this.canvas.height * (0.25 + Math.random() * 0.5),
      vx: fromLeft ? (1.2 + Math.random() * 0.8) : -(1.2 + Math.random() * 0.8),
      vy: (Math.random() - 0.5) * 0.8,
      size: 18 + Math.random() * 6,
      wingAngle: 0,
      wingSpeed: 0.1 + Math.random() * 0.05,
      colorPrimary: '#D6C7EC',
      colorSecondary: '#9B7EBD',
      goldAccent: '#D4AF37',
      opacity: 0.9,
      life: 0,
      maxLife: 380
    });
  }

  drawButterfly(b) {
    this.ctx.save();
    this.ctx.translate(b.x, b.y);
    const flightAngle = Math.atan2(b.vy, b.vx);
    this.ctx.rotate(flightAngle + Math.PI / 2);

    b.wingAngle += b.wingSpeed;
    const wingScale = 0.2 + Math.abs(Math.sin(b.wingAngle)) * 0.8;

    this.ctx.globalAlpha = b.opacity;

    // Helper to draw realistic lavender Monarch wing pair
    const drawWingPair = (direction) => {
      this.ctx.save();
      this.ctx.scale(direction * wingScale, 1);

      // Gradient Fill (Soft Lavender -> Deep Violet Outer Edge)
      const grad = this.ctx.createRadialGradient(0, 0, b.size * 0.1, -b.size * 0.8, -b.size * 0.4, b.size * 1.4);
      grad.addColorStop(0, '#F5EBFF');
      grad.addColorStop(0.4, b.colorPrimary);
      grad.addColorStop(0.85, b.colorSecondary);
      grad.addColorStop(1, '#3A1E4F');

      // Top Forewing
      this.ctx.beginPath();
      this.ctx.fillStyle = grad;
      this.ctx.moveTo(0, 0);
      this.ctx.bezierCurveTo(-b.size * 0.8, -b.size * 1.3, -b.size * 1.6, -b.size * 0.4, 0, b.size * 0.2);
      this.ctx.fill();

      // Outer Wing Black Edge & White Dots
      this.ctx.lineWidth = 1.2;
      this.ctx.strokeStyle = '#2B123C';
      this.ctx.stroke();

      // Bottom Hindwing
      this.ctx.beginPath();
      this.ctx.fillStyle = grad;
      this.ctx.moveTo(0, b.size * 0.1);
      this.ctx.bezierCurveTo(-b.size * 1.3, b.size * 0.3, -b.size * 1.1, b.size * 1.2, 0, b.size * 0.6);
      this.ctx.fill();
      this.ctx.stroke();

      // Gold Veins Filigree
      this.ctx.beginPath();
      this.ctx.strokeStyle = b.goldAccent;
      this.ctx.lineWidth = 0.9;
      this.ctx.moveTo(0, 0);
      this.ctx.quadraticCurveTo(-b.size * 0.6, -b.size * 0.6, -b.size * 1.2, -b.size * 0.7);
      this.ctx.moveTo(0, 0);
      this.ctx.quadraticCurveTo(-b.size * 0.5, b.size * 0.4, -b.size * 0.9, b.size * 0.8);
      this.ctx.stroke();

      // White Dots on Wing Margin
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(-b.size * 1.2, -b.size * 0.6, 0.9, 0, Math.PI * 2);
      this.ctx.arc(-b.size * 1.4, -b.size * 0.4, 0.9, 0, Math.PI * 2);
      this.ctx.arc(-b.size * 1.0, b.size * 0.7, 0.9, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    };

    // Draw Left & Right Wings
    drawWingPair(1);
    drawWingPair(-1);

    // Antennae
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#5A4072';
    this.ctx.lineWidth = 0.8;
    this.ctx.moveTo(0, -b.size * 0.2);
    this.ctx.quadraticCurveTo(-b.size * 0.3, -b.size * 0.7, -b.size * 0.4, -b.size * 0.8);
    this.ctx.moveTo(0, -b.size * 0.2);
    this.ctx.quadraticCurveTo(b.size * 0.3, -b.size * 0.7, b.size * 0.4, -b.size * 0.8);
    this.ctx.stroke();

    // Body Thorax
    this.ctx.beginPath();
    this.ctx.fillStyle = '#4A345E';
    this.ctx.ellipse(0, 0, 1.8, b.size * 0.35, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    this.ctx.globalAlpha = p.opacity;

    this.ctx.beginPath();
    this.ctx.fillStyle = p.color || '#F3D6E4';
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(-p.size, -p.size, p.size, -p.size, 0, p.size);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawSparkle(s) {
    this.ctx.save();
    this.ctx.globalAlpha = s.alpha;
    this.ctx.fillStyle = '#D4AF37';
    this.ctx.beginPath();
    this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update & Draw Butterflies
    for (let i = this.butterflies.length - 1; i >= 0; i--) {
      const b = this.butterflies[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vx += (Math.random() - 0.5) * 0.15;
      b.vy += (Math.random() - 0.5) * 0.15;
      b.life++;

      if (b.life > b.maxLife || b.x < -60 || b.x > this.canvas.width + 60 || b.y < -60 || b.y > this.canvas.height + 60) {
        this.butterflies.splice(i, 1);
      } else {
        this.drawButterfly(b);
      }
    }

    // Update & Draw Continuous Petals
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      p.x += p.vx + Math.sin(p.y * 0.015) * 0.4;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.y > this.canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }
      this.drawPetal(p);
    }

    // Update & Draw Sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha += s.vAlpha;
      if (s.alpha > 0.8 || s.alpha < 0) s.vAlpha = -s.vAlpha;

      if (s.x < 0 || s.x > this.canvas.width || s.y < 0 || s.y > this.canvas.height) {
        s.x = Math.random() * this.canvas.width;
        s.y = Math.random() * this.canvas.height;
      }
      this.drawSparkle(s);
    }

    requestAnimationFrame(this.animate);
  }
}
