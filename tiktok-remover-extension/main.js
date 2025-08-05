// /main.js

// 确保在导入类之前检查重复注入
if (window.clearTokHasInitialized) {
  console.log('[ClearTok] Script already initialized. Skipping.');
} else {
  window.clearTokHasInitialized = true;


  (async () => {
    console.log('[ClearTok] Initializing...');

    try {
      // 1. 初始化模块
      const config = new ConfigManager();
      await config.init(); // 必须等待配置加载

      const state = new StateManager();
      const ui = new UIManager(config);
      
      // 注意：CommManager现在需要WorkflowManager，所以我们先创建Workflow的实例
      let comms; // 先声明
      const workflow = new WorkflowManager(config, ui, state, {
          // 提供一个临时的comms接口，因为workflow和comms相互依赖
          // 这是一种简化的依赖注入方式，避免循环引用问题
          sendMessage: (action, data) => comms.sendMessage(action, data)
      });
      
      comms = new CommManager(workflow, state);
      
      // 2. 启动通信监听
      comms.listen();

      // 3. 执行页面加载后的初始检查
      // 等待页面稍微稳定一下
      setTimeout(() => {
        workflow.runInitialChecks();
      }, 2000);

      console.log('[ClearTok] ✅ Initialization complete. Ready for commands.');
    
    } catch (error) {
        console.error('[ClearTok] 💥 Failed to initialize extension:', error);
    }

  })();
}