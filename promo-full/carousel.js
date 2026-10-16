// Independent, visibility-aware clocks. No catch-up loops after suspension.
(() => {
 class PromoCarousel {
  constructor({root,count,interval,onChange}) {
   this.root=root;this.count=count;this.interval=interval;this.onChange=onChange;this.index=0;this.elapsed=0;this.last=null;this.frame=null;this.destroyed=false;this.generation=0;this.reasons=new Set(['offscreen']);this.abort=new AbortController();this.motion=matchMedia('(prefers-reduced-motion: reduce)');
   const listen=(target,event,fn)=>target.addEventListener(event,fn,{signal:this.abort.signal});
   const zone=node=>node instanceof Element&&root.contains(node)&&!!node.closest('[data-carousel-hover]');
   listen(root,'pointerover',e=>{if(e.pointerType==='mouse')this.pause('hover',zone(e.target));});listen(root,'pointerout',e=>{if(e.pointerType==='mouse')this.pause('hover',zone(e.relatedTarget));});
   const focus=()=>{if(!this.destroyed)this.pause('focus',!!root.querySelector(':focus-visible'));};
   listen(root,'focusin',()=>queueMicrotask(focus));listen(root,'focusout',()=>queueMicrotask(focus));listen(root,'pointerdown',()=>this.pause('focus',false));listen(root,'keydown',()=>queueMicrotask(focus));
   listen(document,'visibilitychange',()=>{this.pause('hidden',document.hidden);this.pause('motion',this.motion.matches);});listen(this.motion,'change',()=>this.pause('motion',this.motion.matches));
   listen(window,'pagehide',e=>{if(e.persisted)this.pause('page',true);else this.destroy();});listen(window,'pageshow',e=>{if(e.persisted)this.pause('page',false);});
   this.observer=new IntersectionObserver(entries=>{const entry=entries[0];this.pause('offscreen',!entry.isIntersecting||entry.intersectionRect.height<=0||entry.intersectionRect.width<=0);},{threshold:.001});this.observer.observe(root.querySelector('[data-carousel-swipe]')||root);
   this.pause('hidden',document.hidden);this.pause('motion',this.motion.matches);this.go(0);
  }
  progress(){return Math.min(1,this.elapsed/this.interval);}
  paint(){this.root.dataset.carouselIndex=String(this.index);this.root.dataset.carouselPaused=String(this.reasons.size>0);this.root.querySelectorAll('[data-carousel-progress]').forEach((el,i)=>el.style.setProperty('--progress',i===this.index?this.progress():0));}
  pause(reason,paused){if(this.destroyed)return;if(this.last!==null){this.elapsed=Math.min(this.interval,this.elapsed+performance.now()-this.last);this.last=null;}if(paused)this.reasons.add(reason);else this.reasons.delete(reason);this.paint();this.schedule();}
  schedule(){if(this.frame!==null){cancelAnimationFrame(this.frame);this.frame=null;}if(this.destroyed||this.reasons.size||this.count<2){this.last=null;return;}this.last=performance.now();this.frame=requestAnimationFrame(now=>this.tick(now));}
  tick(now){this.frame=null;if(this.destroyed||this.reasons.size){this.last=null;return;}this.elapsed+=Math.max(0,now-this.last);this.last=now;if(this.elapsed>=this.interval){this.go(this.index+1);return;}this.paint();this.frame=requestAnimationFrame(time=>this.tick(time));}
  go(index){if(this.destroyed)return Promise.resolve();this.index=(index+this.count)%this.count;this.elapsed=0;this.last=null;const token=++this.generation;this.pause('loading',true);const render=Promise.resolve(this.onChange(this.index)).then(()=>{if(!this.destroyed&&token===this.generation)this.pause('loading',false);}).catch(()=>{if(!this.destroyed&&token===this.generation){this.root.dataset.carouselError='true';this.pause('loading',false);this.pause('error',true);}});this.paint();return render;}
  next(direction=1){this.go(this.index+direction);}
  refresh(){this.paint();}
  snapshot(){return {index:this.index,elapsed:this.elapsed,progress:this.progress(),reasons:[...this.reasons],scheduled:this.frame!==null,destroyed:this.destroyed};}
  destroy(){if(this.destroyed)return;this.destroyed=true;if(this.frame!==null)cancelAnimationFrame(this.frame);this.frame=null;this.last=null;this.abort.abort();this.observer.disconnect();}
 }
 window.PromoCarousel=PromoCarousel;
})();
