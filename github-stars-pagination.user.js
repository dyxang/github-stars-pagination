// ==UserScript==
// @name         GitHub Stars Pagination
// @name:zh-CN   GitHub Stars 分页导航
// @namespace    https://github.com/
// @version      14.0.0
// @description  Add clickable page number navigation to GitHub Stars pages
// @description:zh-CN  为 GitHub 标星页面在 Previous 和 Next 按钮之间添加可点击的页码导航
// @author       GitHub Community
// @match        https://github.com/*?tab=stars*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    

    
    let retryCount = 0;
    const MAX_RETRIES = 15;
    const RETRY_INTERVAL = 500;
    const STARS_PER_PAGE = 30;
    const MAX_PAGES = 15;
    const REQUEST_DELAY = 800;
    
    let isLoading = false;
    let pages = {};
    let username = '';
    let isUpdating = false;
    let currentPage = 1;
    let lastStarsContent = '';
    
    function getUsername() {
        if (username) return username;
        const pathParts = window.location.pathname.split('/');
        username = pathParts[1] || 'unknown';
        return username;
    }
    
    function getCacheKey() {
        return `githubStarsPages_${getUsername()}`;
    }
    
    function getSessionKey() {
        return `githubStarsCurrentPage_${getUsername()}`;
    }
    

    
    function clearCache() {
        try {
            localStorage.removeItem(getCacheKey());
            localStorage.removeItem(getCacheKey() + '_timestamp');
            pages = {};

        } catch (e) {
            console.error('❌ Error clearing cache:', e);
        }
    }
    
    function getCacheTimestampKey() {
        return getCacheKey() + '_timestamp';
    }
    
    function isCacheExpired() {
        try {
            const timestamp = localStorage.getItem(getCacheTimestampKey());
            if (!timestamp) return true;
            
            const now = Date.now();
            const cacheTime = parseInt(timestamp, 10);
            const cacheAge = now - cacheTime;
            const HOUR = 60 * 60 * 1000;
            const CACHE_EXPIRY = 24 * HOUR; // 24小时缓存过期
            
            return cacheAge > CACHE_EXPIRY;
        } catch (e) {
            console.error('❌ Error checking cache expiry:', e);
            return true;
        }
    }
    
    function storePages() {
        try {
            localStorage.setItem(getCacheKey(), JSON.stringify(pages));
            localStorage.setItem(getCacheTimestampKey(), Date.now().toString());

        } catch (e) {
            console.error('❌ Error storing pages:', e);
        }
    }
    
    function loadPages() {
        try {
            if (isCacheExpired()) {

                clearCache();
                return;
            }
            
            const stored = localStorage.getItem(getCacheKey());
            if (stored) {
                pages = JSON.parse(stored);

            }
        } catch (e) {
            console.error('❌ Error loading pages:', e);
            pages = {};
        }
    }
    
    function clearSession() {
        try {
            sessionStorage.removeItem(getSessionKey());
            currentPage = 1;

        } catch (e) {
            console.error('❌ Error clearing session:', e);
        }
    }
    
    function loadCurrentPage() {
        try {
            const stored = sessionStorage.getItem(getSessionKey());
            if (stored) {
                currentPage = parseInt(stored, 10);

            }
        } catch (e) {
            console.error('❌ Error loading current page:', e);
        }
    }
    
    function storeCurrentPage(page) {
        try {
            sessionStorage.setItem(getSessionKey(), page.toString());
            currentPage = page;

        } catch (e) {
            console.error('❌ Error storing current page:', e);
        }
    }
    
    function getTotalStars() {
        try {
            const starsLink = Array.from(document.querySelectorAll('a')).find(a => 
                a.textContent && a.textContent.includes('Stars') && !a.textContent.includes('Starred')
            );
            
            if (starsLink) {

                const text = starsLink.textContent;
                const numbers = text.match(/\d+/g);
                if (numbers && numbers.length > 0) {
                    const totalStars = parseInt(numbers[0].replace(/,/g, ''), 10);

                    return totalStars;
                }
            }
            
            const allText = document.body.textContent;
            const starMatches = allText.match(/Stars[^\d]*?(\d+(?:,\d+)*)/);
            if (starMatches && starMatches[1]) {
                const countStr = starMatches[1].replace(/,/g, '');
                const totalStars = parseInt(countStr, 10);

                return totalStars;
            }
            
            return null;
        } catch (e) {
            console.error('❌ Error getting total stars:', e);
            return null;
        }
    }
    
    function calculateTotalPages(totalStars) {
        if (!totalStars || totalStars < 1) {
            return 0;
        }
        return Math.ceil(totalStars / STARS_PER_PAGE);
    }
    
    function findPaginationContainer() {
        try {
            const previousBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                el.textContent.trim() === 'Previous'
            );
            const nextBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                el.textContent.trim() === 'Next'
            );
            

            
            if (previousBtn) {
                let parent = previousBtn.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                    if (parent.querySelector('button') || parent.querySelector('a')) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return previousBtn.parentElement;
            } else if (nextBtn) {
                let parent = nextBtn.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                    if (parent.querySelector('button') || parent.querySelector('a')) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return nextBtn.parentElement;
            }
            
            return null;
        } catch (e) {
            console.error('❌ Error finding pagination container:', e);
            return null;
        }
    }
    
    function getCurrentPage() {
        return currentPage;
    }
    
    function extractAfterFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('after');
        } catch (e) {
            return null;
        }
    }
    
    async function preloadPages() {
        if (isLoading) {

            return false;
        }
        
        isLoading = true;

        
        try {
            const currentUrl = window.location.href;
            let nextUrl = currentUrl;
            
            if (!pages['1']) {
                pages['1'] = '';
                storePages();
            }
            
            let loadedPages = Object.keys(pages).length;
            
            while (loadedPages < MAX_PAGES) {

                
                try {
                    const response = await fetch(nextUrl, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'text/html'
                        }
                    });
                    
                    if (!response.ok) {
                        console.error('❌ Failed to fetch page:', response.status);
                        break;
                    }
                    
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    const nextBtn = Array.from(doc.querySelectorAll('button, a')).find(el => 
                        el.textContent.trim() === 'Next'
                    );
                    
                    if (!nextBtn) {

                        break;
                    }
                    
                    const after = extractAfterFromUrl(nextBtn.href);
                    if (after) {
                        loadedPages++;
                        pages[loadedPages] = after;
                        nextUrl = nextBtn.href;

                        storePages();
                    } else {

                        break;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
                    
                } catch (e) {
                    console.error('❌ Error preloading page:', e);
                    break;
                }
            }
            

            return true;
            
        } catch (e) {
            console.error('❌ Error in preloadPages:', e);
            return false;
        } finally {
            isLoading = false;
            updatePagination();
        }
    }
    
    function createLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = '正在加载页码...';
        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            padding: 0 16px;
            color: var(--color-fg-muted, #57606a);
            font-size: 14px;
            font-weight: 500;
        `;
        return indicator;
    }
    
    function createPageButton(page, currentPage) {
        const btn = document.createElement('a');
        btn.textContent = page;
        
        if (page === 1) {
            btn.href = window.location.pathname + '?tab=stars';
        } else {
            const after = pages[page];
            if (after) {
                btn.href = window.location.pathname + `?tab=stars&after=${after}`;
            } else {
                btn.href = '#';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
        }
        
        // 与原生按钮样式一致
        btn.style.cssText = `
            padding: 5px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            font-family: "Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            transition: all 0.15s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 31.6px;
            min-width: 32px;
            margin: 0 4px;
            box-shadow: none;
            border: 1px solid transparent;
            box-sizing: border-box;
        `;
        
        if (page === currentPage) {
            // 活跃状态与原生按钮一致
            btn.style.background = 'var(--color-accent-emphasis, #0969da)';
            btn.style.color = 'white';
            btn.style.cursor = 'default';
        } else {
            // 非活跃状态与原生按钮一致
            btn.style.background = 'var(--color-bg-secondary, #f6f8fa)';
            btn.style.color = 'var(--color-fg-default, #1f2328)';
            btn.style.borderColor = 'var(--color-border-default, #d0d7de)';
            
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'var(--color-bg-tertiary, #f3f4f6)';
                this.style.borderColor = 'var(--color-border-muted, #d0d7de)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.background = 'var(--color-bg-secondary, #f6f8fa)';
                this.style.borderColor = 'var(--color-border-default, #d0d7de)';
            });
            
            // 添加点击事件监听器，确保页码状态更新
            btn.addEventListener('click', function(e) {
                // 存储当前页码
                storeCurrentPage(page);
                // 延迟更新分页，等待AJAX加载完成
                setTimeout(updatePagination, 500);
            });
        }
        
        return btn;
    }
    
    function createEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.cssText = `
            padding: 0 10px;
            color: var(--color-fg-muted, #57606a);
            font-size: 14px;
            font-weight: 500;
        `;
        return ellipsis;
    }
    
    function createRefreshButton() {
        const btn = document.createElement('button');
        btn.textContent = '刷新缓存';
        btn.style.cssText = `
            padding: 5px 10px;
            border: 1px solid var(--color-border-default, #d0d7de);
            border-radius: 6px;
            background: var(--color-bg-default, #ffffff);
            color: var(--color-fg-default, #1f2328);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            margin-left: 10px;
        `;
        
        btn.addEventListener('click', async function() {

            clearCache();
            clearSession();
            
            const existingInfo = document.querySelector('.custom-stars-page-info');
            if (existingInfo) {
                existingInfo.remove();
            }
            
            await init();
        });
        
        return btn;
    }
    
    function createPageInfo(totalStars, totalPages, currentPage) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 0;
            color: var(--color-fg-muted, #57606a);
            font-size: 14px;
            font-weight: 500;
            background: transparent;
            border-radius: 0;
            box-shadow: none;
            transition: all 0.2s ease;
        `;
        
        if (isLoading) {
            const loadingIndicator = createLoadingIndicator();
            container.appendChild(loadingIndicator);
            return container;
        }
        
        const numPages = Object.keys(pages).length;

        
        const pageText = document.createElement('span');
        const displayTotal = totalPages > 0 ? Math.min(totalPages, numPages) : numPages;
        pageText.textContent = `第 ${currentPage} 页 / 共 ${displayTotal} 页`;
        pageText.style.cssText = `
            white-space: nowrap;
            font-weight: 600;
            color: var(--color-fg-default, #1f2328);
        `;
        container.appendChild(pageText);
        
        if (numPages > 1) {
            const pageButtonsContainer = document.createElement('div');
            pageButtonsContainer.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 4px;
            `;
            
            if (numPages <= 7) {

                for (let i = 1; i <= numPages; i++) {
                    const pageBtn = createPageButton(i, currentPage);
                    pageButtonsContainer.appendChild(pageBtn);
                }
            } else {

                pageButtonsContainer.appendChild(createPageButton(1, currentPage));
                
                if (currentPage > 3) {
                    pageButtonsContainer.appendChild(createEllipsis());
                }
                
                const start = Math.max(2, currentPage - 2);
                const end = Math.min(numPages - 1, currentPage + 2);
                

                
                for (let i = start; i <= end; i++) {
                    const pageBtn = createPageButton(i, currentPage);
                    pageButtonsContainer.appendChild(pageBtn);
                }
                
                if (currentPage < numPages - 2) {
                    pageButtonsContainer.appendChild(createEllipsis());
                }
                
                pageButtonsContainer.appendChild(createPageButton(numPages, currentPage));
            }
            
            container.appendChild(pageButtonsContainer);
        }
        
        return container;
    }
    
    async function insertPageInfo() {
        try {

            
            loadPages();
            loadCurrentPage();
            
            const paginationContainer = findPaginationContainer();
            if (!paginationContainer) {

                return false;
            }
            

            
            const existingInfo = document.querySelector('.custom-stars-page-info');
            if (existingInfo) {

                existingInfo.remove();
            }
            
            const currentPage = getCurrentPage();

            
            const totalStars = getTotalStars();
            const totalPages = totalStars ? calculateTotalPages(totalStars) : 0;

            
            const pageInfo = createPageInfo(totalStars, totalPages, currentPage);
            pageInfo.className = 'custom-stars-page-info';
            
            const previousBtn = Array.from(paginationContainer.children).find(el => 
                el.textContent.trim() === 'Previous'
            );
            const nextBtn = Array.from(paginationContainer.children).find(el => 
                el.textContent.trim() === 'Next'
            );
            

            
            if (previousBtn && nextBtn) {

                paginationContainer.insertBefore(pageInfo, nextBtn);
            } else if (nextBtn) {

                paginationContainer.insertBefore(pageInfo, nextBtn);
            } else if (previousBtn) {

                paginationContainer.insertBefore(pageInfo, previousBtn.nextSibling);
            } else {

                paginationContainer.appendChild(pageInfo);
            }
            

            
            if (Object.keys(pages).length < 2 && !isLoading) {

                setTimeout(preloadPages, 1000);
            }
            
            return true;
        } catch (e) {
            console.error('❌ Error inserting page info:', e);
            return false;
        }
    }
    
    async function init() {
        try {

            
            loadPages();
            loadCurrentPage();
            
            const success = await insertPageInfo();
            
            if (success) {

                retryCount = 0;
            } else {

                scheduleRetry();
            }
        } catch (e) {
            console.error('❌ Error in init:', e);
            scheduleRetry();
        }
    }
    
    function scheduleRetry() {
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(init, RETRY_INTERVAL);
        } else {

        }
    }
    
    function updatePagination() {
        if (isUpdating) {

            return;
        }
        
        isUpdating = true;

        
        const existingInfo = document.querySelector('.custom-stars-page-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        retryCount = 0;
        loadPages();
        loadCurrentPage();
        
        init().finally(() => {
            isUpdating = false;
        });
    }
    
    function detectPageChange() {
        const starsContainer = document.querySelector('[data-testid="stars-list"]') || 
                             document.querySelector('.js-stars-container') ||
                             document.querySelector('.col-10');
        
        if (starsContainer) {
            const currentContent = starsContainer.textContent;
            if (currentContent !== lastStarsContent) {

                lastStarsContent = currentContent;
                
                const nextBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                    el.textContent.trim() === 'Next'
                );
                
                if (nextBtn) {
                    const after = extractAfterFromUrl(nextBtn.href);
                    if (after) {
                        for (let pageNum in pages) {
                            if (pages[pageNum] === after) {
                                const page = parseInt(pageNum, 10);

                                storeCurrentPage(page);
                                updatePagination();
                                return;
                            }
                        }
                    } else {
                        // 如果没有 after 参数，可能是第一页

                        storeCurrentPage(1);
                        updatePagination();
                        return;
                    }
                }
            }
        }
    }
    
    function setupNetworkMonitor() {
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            // 检查是否是 stars 页面的请求
            if (url.includes('tab=stars') || (typeof url === 'string' && url.includes('/stars'))) {
                const after = extractAfterFromUrl(url);
                if (after) {
                    for (let pageNum in pages) {
                        if (pages[pageNum] === after) {
                            const page = parseInt(pageNum, 10);

                            storeCurrentPage(page);
                            setTimeout(updatePagination, 300);
                            break;
                        }
                    }
                } else {
                    // 如果没有 after 参数，可能是第一页

                    storeCurrentPage(1);
                    setTimeout(updatePagination, 300);
                }
            }
            return originalFetch.apply(this, arguments);
        };
        
        // 监听 XMLHttpRequest 请求
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (url.includes('tab=stars') || (typeof url === 'string' && url.includes('/stars'))) {
                const after = extractAfterFromUrl(url);
                if (after) {
                    for (let pageNum in pages) {
                        if (pages[pageNum] === after) {
                            const page = parseInt(pageNum, 10);

                            storeCurrentPage(page);
                            setTimeout(updatePagination, 300);
                            break;
                        }
                    }
                } else {
                    // 如果没有 after 参数，可能是第一页

                    storeCurrentPage(1);
                    setTimeout(updatePagination, 300);
                }
            }
            return originalXhrOpen.apply(this, arguments);
        };
    }
    
    loadPages();
    loadCurrentPage();
    setTimeout(init, 500);
    
    const observer = new MutationObserver(function(mutations) {
        try {
            const existingInfo = document.querySelector('.custom-stars-page-info');
            if (!existingInfo) {
                const paginationContainer = findPaginationContainer();
                if (paginationContainer) {

                    retryCount = 0;
                    loadPages();
                    loadCurrentPage();
                    init();
                }
            }
            
            detectPageChange();
        } catch (e) {
            console.error('❌ Error in MutationObserver:', e);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    window.addEventListener('popstate', function() {

        updatePagination();
    });
    
    let lastUrl = location.href;
    
    function checkUrlChange() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;

            updatePagination();
        }
    }
    
    setInterval(checkUrlChange, 500);
    setInterval(detectPageChange, 300);
    
    setupNetworkMonitor();
    
    // 注册Tampermonkey菜单命令
    GM_registerMenuCommand('清除缓存', async function() {

        clearCache();
        clearSession();
        
        const existingInfo = document.querySelector('.custom-stars-page-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        await init();
    });
    
})();
