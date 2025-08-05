// /modules/state.js

class StateManager {
    constructor() {
      this.isPaused = false;
      this.isRunning = false;
      this.removedCount = 0;
      this.totalReposts = 0;
      this.startTime = null;
      this.currentVideoInfo = { title: '', author: '', url: '' };
    }
  
    start() {
      this.isRunning = true;
      this.isPaused = false;
      this.removedCount = 0;
      this.totalReposts = 0;
      this.startTime = Date.now();
      console.log('[ClearTok] StateManager: Process started.');
    }
  
    stop() {
      this.isRunning = false;
      console.log('[ClearTok] StateManager: Process stopped.');
    }
  
    pause() {
      if (this.isRunning) {
        this.isPaused = true;
        console.log('[ClearTok] StateManager: Process paused.');
      }
    }
  
    resume() {
      if (this.isRunning) {
        this.isPaused = false;
        console.log('[ClearTok] StateManager: Process resumed.');
      }
    }
    
    reset() {
        this.isPaused = false;
        this.isRunning = false;
        this.removedCount = 0;
        this.totalReposts = 0;
        this.startTime = null;
        this.currentVideoInfo = { title: '', author: '', url: '' };
        console.log('[ClearTok] StateManager: State has been reset.');
    }
  
    incrementRemovedCount() {
      this.removedCount++;
    }
  
    setTotal(count) {
      this.totalReposts = count;
    }
    
    setCurrentVideoInfo({ title, author, url }) {
        this.currentVideoInfo = { title, author, url };
    }
    
    getDuration() {
        if (!this.startTime) return { total: 0, minutes: 0, seconds: 0 };
        const totalDuration = Date.now() - this.startTime;
        const minutes = Math.floor(totalDuration / 60000);
        const seconds = Math.floor((totalDuration % 60000) / 1000);
        return { total: totalDuration, minutes, seconds };
    }
  }