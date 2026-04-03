# GitHub Stars Pagination | GitHub 标星分页导航

> A UserScript that adds clickable page number navigation to GitHub Stars pages | 一个为 GitHub 标星页面添加可点击页码导航的用户脚本

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-14.0.0-blue.svg)](https://github.com/)

## English | 中文

### Features | 功能特性

- ✨ Adds clickable page number buttons between "Previous" and "Next" buttons | 在 "Previous" 和 "Next" 按钮之间添加可点击的页码按钮
- 📊 Displays current page and total pages information | 显示当前页和总页数信息
- 💾 Smart caching with 24-hour expiration | 智能缓存，24小时过期
- 🔄 Page change detection and automatic update | 页面变化检测和自动更新
- 🎨 Styled to match GitHub's native UI | 样式与 GitHub 原生 UI 一致
- ⚡ Preloads pages for faster navigation | 预加载页面以实现更快的导航
- 🔧 Built-in cache clearing via Tampermonkey menu | 通过 Tampermonkey 菜单内置清除缓存功能

### Installation | 安装方法

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) extension for your browser | 为你的浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 扩展

2. Click here to install the script: [github-stars-pagination.user.js](github-stars-pagination.user.js) | 点击这里安装脚本：[github-stars-pagination.user.js](github-stars-pagination.user.js)

3. Visit any GitHub user's stars page (e.g., `https://github.com/your-username?tab=stars`) | 访问任何 GitHub 用户的标星页面（例如：`https://github.com/your-username?tab=stars`）

### Usage | 使用方法

1. Navigate to any GitHub stars page | 导航到任何 GitHub 标星页面
2. The script will automatically add page number navigation | 脚本会自动添加页码导航
3. Click on any page number to jump directly to that page | 点击任何页码直接跳转到该页面
4. Use Tampermonkey menu to clear cache if needed | 如需要，使用 Tampermonkey 菜单清除缓存

### How It Works | 工作原理

The script works by: | 脚本的工作原理：

1. Detecting the GitHub stars page URL pattern | 检测 GitHub 标星页面的 URL 模式
2. Finding the pagination container with "Previous" and "Next" buttons | 查找带有 "Previous" 和 "Next" 按钮的分页容器
3. Preloading page information by fetching subsequent pages | 通过获取后续页面预加载页面信息
4. Storing page cursors in localStorage for 24 hours | 将页面游标存储在 localStorage 中，有效期 24 小时
5. Inserting styled page number buttons between navigation buttons | 在导航按钮之间插入样式化的页码按钮
6. Monitoring page changes and updating navigation accordingly | 监控页面变化并相应更新导航

### Configuration | 配置

The script has several configurable constants at the top: | 脚本顶部有几个可配置的常量：

```javascript
const STARS_PER_PAGE = 30;      // Items per page | 每页项目数
const MAX_PAGES = 15;           // Maximum pages to preload | 最大预加载页数
const REQUEST_DELAY = 800;      // Delay between requests (ms) | 请求之间的延迟（毫秒）
const CACHE_EXPIRY = 24 * HOUR; // Cache duration | 缓存持续时间
```

### Troubleshooting | 故障排除

If the pagination doesn't appear: | 如果分页没有出现：

1. Refresh the page | 刷新页面
2. Clear the cache via Tampermonkey menu | 通过 Tampermonkey 菜单清除缓存
3. Make sure you're on a valid stars page URL (`?tab=stars`) | 确保你在有效的标星页面 URL 上（`?tab=stars`）
4. Check browser console for errors | 检查浏览器控制台是否有错误

### Contributing | 贡献

Contributions, issues, and feature requests are welcome! | 欢迎贡献、提交问题和功能请求！

### License | 许可证

[MIT](LICENSE)
