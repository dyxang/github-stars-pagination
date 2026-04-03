# GitHub Stars Pagination

A UserScript that adds clickable page number navigation to GitHub Stars pages

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.4.3-blue.svg)](https://github.com/)

[中文](#github-标星分页导航)

## Features

- Adds clickable page numbers between "Previous" and "Next" buttons
- Auto-updates navigation when page changes
- Preloads pages for faster navigation
- Includes cache clearing in Tampermonkey menu

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Install the script: [github-stars-pagination.user.js](github-stars-pagination.user.js)
3. Go to any GitHub stars page (e.g., `https://github.com/your-username?tab=stars`)

## How It Works

1. Detects when you're on a GitHub stars page
2. Finds the pagination container
3. Preloads page information
4. Stores data in localStorage for 24 hours
5. Adds styled page number buttons
6. Updates navigation when page changes

## Configuration

Configurable constants at the top of the script:

```javascript
const STARS_PER_PAGE = 30;      // Items per page
const MAX_PAGES = 15;           // Maximum pages to preload
const REQUEST_DELAY = 800;      // Delay between requests (ms)
const CACHE_EXPIRY = 24 * HOUR; // Cache duration
```

## Troubleshooting

If pagination doesn't appear:
1. Refresh the page
2. Clear cache via Tampermonkey menu
3. Ensure you're on a valid stars page (`?tab=stars`)
4. Check browser console for errors

## License

[MIT](LICENSE)

---

# GitHub 标星分页导航

为 GitHub 标星页面添加可点击页码导航的用户脚本

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-14.0.0-blue.svg)](https://github.com/)

[English](#github-stars-pagination)

## 功能

- 在 "Previous" 和 "Next" 按钮之间添加可点击页码
- 页面变化时自动更新导航
- 预加载页面以加快导航速度
- 在 Tampermonkey 菜单中包含清除缓存选项

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 安装脚本：[github-stars-pagination.user.js](github-stars-pagination.user.js)
3. 打开任何 GitHub 标星页面（例如：`https://github.com/your-username?tab=stars`）


## 工作原理

1. 检测你何时访问 GitHub 标星页面
2. 找到分页容器
3. 预加载页面信息
4. 将数据存储在 localStorage 中24小时
5. 添加样式化的页码按钮
6. 页面变化时更新导航

## 配置

脚本顶部的可配置常量：

```javascript
const STARS_PER_PAGE = 30;      // 每页项目数
const MAX_PAGES = 15;           // 最大预加载页数
const REQUEST_DELAY = 800;      // 请求之间的延迟（毫秒）
const CACHE_EXPIRY = 24 * HOUR; // 缓存持续时间
```

## 故障排除

如果分页没有显示：
1. 刷新页面
2. 通过 Tampermonkey 菜单清除缓存
3. 确保你在有效的标星页面上（`?tab=stars`）
4. 检查浏览器控制台是否有错误


## 许可证

[MIT](LICENSE)
