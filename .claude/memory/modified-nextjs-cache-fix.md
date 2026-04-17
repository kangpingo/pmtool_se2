---
name: nextjs-sidebar-header-cache-fix
description: 修改 Header/Sidebar 后需清除 .next 缓存并重启
type: feedback
---

修改 `components/Header.tsx` 或 `components/Sidebar.tsx` 后，Next.js 可能保留旧缓存，导致引用缺失组件或样式异常。

**解决方法：**
```bash
pkill -f "next dev"    # 停止开发服务器
rm -rf .next            # 删除缓存目录
npm run dev             # 重启
```

**Why:** Next.js App Router 对动态导入和客户端组件有较强的缓存机制，直接重启服务器可能不够。

**How to apply:** 每次修改 Header.tsx 或 Sidebar.tsx 后执行上述操作。
