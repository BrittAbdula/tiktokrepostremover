// /modules/workflow.js

class WorkflowManager {
    /**
     * @param {ConfigManager} config
     * @param {UIManager} ui
     * @param {StateManager} state
     * @param {CommManager} comms
     */
    constructor(config, ui, state, comms) {
        this.config = config;
        this.ui = ui;
        this.state = state;
        this.comms = comms;
    }

    /**
   * 一个可以被暂停的、有感知能力的睡眠函数
   * @param {number} ms - 总计要等待的毫秒数
   */
    async pausableSleep(ms) {
        const step = 100; // 每100ms检查一次暂停状态
        let elapsed = 0;

        while (elapsed < ms) {
            // 核心：在每次“打盹”前，都检查暂停状态
            await this.checkPauseState();

            // 如果在暂停期间，checkPauseState会卡住，直到isPaused变为false

            // 如果脚本被停止，则直接退出
            if (!this.state.isRunning) {
                return;
            }

            await this.ui.sleep(step); // 使用“愚笨”的短时睡眠
            elapsed += step;
        }
    }

    reset() {
        this.state.reset();
        console.log('[ClearTok Workflow] Workflow state has been reset.');
    }

    /**
     * 主启动函数
     */
    async start() {
        if (this.state.isRunning) {
            console.warn('[ClearTok] Process is already running.');
            return;
        }
        this.state.start();
        this.comms.sendMessage('statusUpdate', { status: 'Starting removal process...' });

        try {
            // 流程编排
            if (!await this.step_navigateToProfile()) return;
            if (!await this.step_switchToRepostsTabAndScroll()) return;
            if (this.state.totalReposts === 0) {
                this.comms.sendMessage('noRepostsFound', { duration: this.state.getDuration() });
                this.finishProcess('No reposts found to remove.');
                return;
            }
            if (!await this.step_openFirstVideo()) return;

            await this.step_processVideoQueue();

            this.finishProcess('All reposts have been processed.');

            // 完成后自动导航到repost页面查看结果
            await this.step_navigateToRepostsTab();

        } catch (error) {
            this.handleError('An unexpected error occurred in the main workflow.', error);
        }
    }

    /**
     * 执行初始检查，例如登录状态
     */
    async runInitialChecks() {
        try {
            const profileLink = this.ui.findElement('loginStatus.profileLink');
            if (!profileLink || !profileLink.getAttribute('href')?.includes('/@')) {
                this.comms.sendMessage('loginStatusUpdate', { isLoggedIn: false });
                return;
            }

            const href = profileLink.getAttribute('href');
            const usernamePart = href.split('/@')[1];
            const isLoggedIn = usernamePart && usernamePart.trim().length > 0;
            const hasAvatar = this.ui.findElement('loginStatus.avatarImage', profileLink) !== null;

            this.comms.sendMessage('loginStatusUpdate', {
                isLoggedIn: isLoggedIn,
                username: isLoggedIn ? usernamePart.trim() : null,
                hasUserAvatar: hasAvatar,
            });
            console.log('[ClearTok] Login status checked:', { isLoggedIn });

        } catch (error) {
            console.error('[ClearTok] Error checking login status:', error);
            this.comms.sendMessage('loginStatusUpdate', { isLoggedIn: false, error: error.message });
        }
    }


    // --- 工作流步骤 ---

    async step_navigateToProfile() {
        this.comms.sendMessage('statusUpdate', { status: 'Navigating to your profile...' });
        const success = await this.ui.click('navigation.profileButton');
        if (!success) {
            this.handleError("Failed to navigate to profile. Are you logged in?");
            return false;
        }
        await this.ui.sleep(3000); // 等待页面加载
        return true;
    }

    async step_navigateToRepostsTab() {
        this.comms.sendMessage('statusUpdate', { status: 'Navigating to Reposts tab...' });
        //   let repostTab = this.ui.findElement('navigation.repostTab');
        let repostTab = await this.ui.waitForElement('navigation.repostTab', 10000);
        if (!repostTab) {
            repostTab = this.ui.findByText('navigation.repostTabFallback', 'Reposts');
        }
        if (repostTab) {
            repostTab.click();
            await this.ui.sleep(2000); // 等待内容加载
            this.comms.sendMessage('statusUpdate', { status: 'On reposts tab, showing results.' });
            return true;
        }
        this.comms.sendMessage('statusUpdate', { status: 'Could not find Reposts tab.' });
        return false;
    }

    async step_switchToRepostsTabAndScroll() {
        this.comms.sendMessage('statusUpdate', { status: 'Looking for Reposts tab...' });
        if (!await this.step_navigateToRepostsTab()) {
            this.handleError("Could not find or click the 'Reposts' tab.");
            return false;
        }

        this.comms.sendMessage('statusUpdate', { status: 'Scrolling to load all reposts...' });
        const totalFound = await this.ui.autoScrollToBottom('video.containers', (progress) => {
            this.comms.sendMessage('updateProgress', {
                current: 0,
                total: progress,
                status: `Loaded ${progress} reposts so far...`
            });
        });

        this.state.setTotal(totalFound);
        this.comms.sendMessage('updateProgress', { current: 0, total: this.state.totalReposts });
        this.comms.sendMessage('statusUpdate', { status: `Found ${this.state.totalReposts} reposts.` });
        console.log(`[ClearTok] Found ${this.state.totalReposts} total reposts.`);
        return true;
    }

    async step_openFirstVideo() {
        this.comms.sendMessage('statusUpdate', { status: 'Opening the first repost...' });
        const success = await this.ui.click('video.containers');
        if (!success) {
            this.handleError("No reposted videos found on the page to click.");
            return false;
        }
        await this.ui.sleep(3000); // 等待视频播放器加载
        return true;
    }

    async step_processVideoQueue() {
        for (let i = 0; i < this.state.totalReposts; i++) {
            await this.checkPauseState();
            if (!this.state.isRunning) break;

            const currentIndex = i + 1;
            this.comms.sendMessage('statusUpdate', { status: `Processing repost ${currentIndex} of ${this.state.totalReposts}...` });

            // 提取视频信息
            const videoInfo = this.getVideoInfo();
            this.state.setCurrentVideoInfo(videoInfo);
            this.comms.sendMessage('updateProgress', {
                current: currentIndex,
                total: this.state.totalReposts,
                ...videoInfo
            });

            // 查找并点击“取消转发”按钮
            const repostButton = this.ui.findElement('video.repostButton');
            if (repostButton && this.isVideoReposted(repostButton)) {
                  repostButton.click();
                this.state.incrementRemovedCount();
                this.comms.sendMessage('videoRemoved', { index: currentIndex, ...videoInfo });
                console.log(`[ClearTok] Removed repost #${currentIndex}`);
                await this.pausableSleep(this.getRandomDelay(1000, 2000));
            } else {
                this.comms.sendMessage('videoSkipped', { index: currentIndex, reason: 'Not a repost or button not found', ...videoInfo });
                console.log(`[ClearTok] Skipped video #${currentIndex}`);
            }

            // 移至下一个视频
            if (currentIndex < this.state.totalReposts) {
                const nextButton = this.ui.findElement('video.nextButton');
                if (nextButton && !nextButton.disabled) {
                    nextButton.click();
                    await this.pausableSleep(this.getRandomDelay(800, 2400));
                } else {
                    console.warn('[ClearTok] Next button not found or disabled. Ending process.');
                    break;
                }
            }
        }
        // 关闭视频播放器
        const closeButton = this.ui.findElement('video.closeButton');
        if (closeButton) closeButton.click();
        else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await this.ui.sleep(1000);
    }

    // --- 辅助函数 ---

    getVideoInfo() {
        try {
            const videoInfo = {
                title: '',
                url: window.location.href,
                author: ''
            };

            // 使用配置的选择器获取视频标题
            const titleElement = this.ui.findElement('video.title');
            if (titleElement && titleElement.textContent.trim()) {
                videoInfo.title = titleElement.textContent.trim();
            }

            // 使用配置的选择器获取作者信息
            const authorElement = this.ui.findElement('video.author');
            if (authorElement && authorElement.textContent.trim()) {
                let authorText = authorElement.textContent.trim();
                // Clean up author text
                if (!authorText.startsWith('@')) {
                    authorText = '@' + authorText;
                }
                videoInfo.author = authorText;
            }

            // Fallback: try to extract from URL
            if (!videoInfo.author && videoInfo.url.includes('/@')) {
                const urlParts = videoInfo.url.split('/@');
                if (urlParts.length > 1) {
                    const authorPart = urlParts[1].split('/')[0];
                    if (authorPart) {
                        videoInfo.author = '@' + authorPart;
                    }
                }
            }

            // Fallback: try to extract from video ID in URL
            if (!videoInfo.title && videoInfo.url.includes('/video/')) {
                const videoId = videoInfo.url.split('/video/')[1]?.split('?')[0];
                if (videoId) {
                    videoInfo.title = `Video ${videoId.substring(0, 8)}...`;
                }
            }

            // Truncate long titles
            if (videoInfo.title.length > 50) {
                videoInfo.title = videoInfo.title.substring(0, 50) + '...';
            }

            // Default values if nothing found
            if (!videoInfo.title) {
                videoInfo.title = 'Untitled video';
            }
            if (!videoInfo.author) {
                videoInfo.author = '@unknown';
            }

            return videoInfo;
        } catch (error) {
            console.log('[ClearTok] Error getting video info:', error);
            return {
                title: 'Unknown video',
                url: window.location.href,
                author: '@unknown'
            };
        }
    }

    isVideoReposted(repostButton) {
        // 这个逻辑比较复杂，保持原样
        const isPressed = repostButton.getAttribute(this.config.get('repostStatus.pressedAttribute')) === 'true';
        const hasActiveColor = window.getComputedStyle(repostButton).color !== 'rgb(255, 255, 255)';
        const hasFilledIcon = this.ui.findElement('repostStatus.svgFillSelector', repostButton) !== null;
        return isPressed || hasActiveColor || hasFilledIcon;
    }

    async checkPauseState() {
        while (this.state.isPaused && this.state.isRunning) {
            await this.ui.sleep(500);
        }
    }

    getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    handleError(message, error = '') {
        this.state.stop();
        this.comms.sendMessage('error', { message, error: error.toString() });
        console.error(`[ClearTok] SCRIPT STOPPED: ${message}`, error);
    }

    finishProcess(message) {
        this.state.stop();
        this.comms.sendMessage('complete', {
            removedCount: this.state.removedCount,
            totalCount: this.state.totalReposts,
            duration: this.state.getDuration()
        });
        console.log(`[ClearTok] SCRIPT FINISHED: ${message}`);
    }
}