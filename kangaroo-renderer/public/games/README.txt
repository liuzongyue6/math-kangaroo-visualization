小游戏是静态 HTML，放到本目录后在代码里登记即可：

1. 新建子文件夹，例如：
   public/games/number-puzzle/index.html
   （同目录放 *.js / *.css / 图片等依赖）

2. 游戏内部资源必须用相对路径（./app.js、./assets/x.png），
   不要写以 / 开头的绝对路径，否则在 GitHub Pages 子路径下会 404。

3. 在 src/ui/games/gamesContent.ts 的 GAMES 数组里加一条：
   {
     id: 'number-puzzle',
     title: '数字小游戏',
     description: '适合小朋友的互动练习',
     fileSrc: '/games/number-puzzle/index.html',
   }

4. 保存后刷新网页，「小游戏」Tab 里就会出现该条目，用 iframe 内嵌播放。
