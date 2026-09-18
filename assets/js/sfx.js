
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const sfx = {
  ctx: null,
  masterGain: null,
  volume: 1,
  muted: false,
  init(){
    if(!this.ctx){
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
  },
  setVolume(v){ this.volume = Math.max(0, Math.min(1, v)); if(this.masterGain) this.masterGain.gain.setValueAtTime(this.muted?0:this.volume, this.ctx.currentTime); },
  toggleMute(){ this.muted = !this.muted; if(this.masterGain) this.masterGain.gain.setValueAtTime(this.muted?0:this.volume, this.ctx.currentTime); return this.muted; },
  setMuted(flag){ this.muted = !!flag; if(this.masterGain) this.masterGain.gain.setValueAtTime(this.muted?0:this.volume, this.ctx.currentTime); },
  play(name, opts={}){
    try{ this.init(); }catch(e){ return; }
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const connectToMaster = node => { if(this.masterGain) node.connect(this.masterGain); else node.connect(ctx.destination); };

    if(name==='ping'){ // paddle hit
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(600, now); g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.18, now+0.01); g.gain.exponentialRampToValueAtTime(0.0001, now+0.22);
      o.connect(g); connectToMaster(g); o.start(now); o.stop(now+0.23);
    }else if(name==='score'){
      const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain();
      o1.type='triangle'; o2.type='sine'; o1.frequency.setValueAtTime(300, now); o2.frequency.setValueAtTime(420, now);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.22, now+0.01); g.gain.exponentialRampToValueAtTime(0.0001, now+0.4);
      o1.connect(g); o2.connect(g); connectToMaster(g); o1.start(now); o2.start(now); o1.stop(now+0.42); o2.stop(now+0.42);
    }else if(name==='hit'){ // generic hit (tetris line, flappy hit)
      const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(180, now);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.15, now+0.01); g.gain.exponentialRampToValueAtTime(0.0001, now+0.28);
      o.connect(g); connectToMaster(g); o.start(now); o.stop(now+0.3);
    }else if(name==='pop'){ // small pop (merge/collect)
      const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(880, now);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.12, now+0.005); g.gain.exponentialRampToValueAtTime(0.0001, now+0.14);
      o.connect(g); connectToMaster(g); o.start(now); o.stop(now+0.16);
    }else if(name==='jump'){ // platformer jump
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(800, now+0.15);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.15, now+0.01); g.gain.exponentialRampToValueAtTime(0.0001, now+0.2);
      o.connect(g); connectToMaster(g); o.start(now); o.stop(now+0.22);
    }else if(name==='coin'){ // coin collect
      const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain();
      o1.type='sine'; o2.type='sine'; o1.frequency.setValueAtTime(988, now); o2.frequency.setValueAtTime(1319, now+0.08);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.18, now+0.01); g.gain.exponentialRampToValueAtTime(0.0001, now+0.25);
      o1.connect(g); o2.connect(g); connectToMaster(g); o1.start(now); o2.start(now+0.08); o1.stop(now+0.12); o2.stop(now+0.27);
    }
  }
};
export default sfx;




