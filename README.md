# Getting Started

use next.js + shadcn: https://ui.shadcn.com/docs/installation/next

## Install next.js

```sh
npx create-next-app@latest . --typescript --tailwind --eslint
```

```sh
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the default import alias? … No
```

## Install shadcn-ui

```sh
npx shadcn-ui@latest init
```

```sh
✔ Would you like to use TypeScript (recommended)? … / yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Stone
✔ Where is your global CSS file? … app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Where is your tailwind.config.js located? … tailwind.config.js
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … yes
✔ Write configuration to components.json. Proceed? … yes
```

---

shadcn-ui 會幫你在 app/globals.css 建立一些預設的顏色，用的是 HSL 顏色表示法，可以參考 https://www.w3schools.com/colors/colors_hsl.asp

### Use cn function to merge class

shadcn-ui 會幫創建 lib/utils.ts 並 export cn funtion ， cn function 是用來合併 class 的， cn function 也可以根據條件來決定要不要合併 class  
example:

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const state = true;

export default function Home() {
  return (
    <div>
      <Button className={cn("bg-indigo-500", state && "bg-red-500")}>
        Click me
      </Button>
    </div>
  );
}
```

### Setup default height

把根元素的高度設為 100% ， 這樣子元素在用 % 作為高度的單位時才可以根據父元素的高度作為參考  
app/globals.css

```css
html,
body,
:root {
  height: 100%;
}
```

### asChild props

https://www.radix-ui.com/primitives/docs/guides/composition#composing-multiple-primitives  
當 asChild 設置為 true 時，Radix 將不會渲染默認的 DOM 元素，而是克隆該組件 props 和功能並傳給子元素。

# Authentication

## Create application in clerk.com

1. goto https://clerk.com/ and sign in -> click Add application -> enter Application name -> How will your users sign in? 選擇 Email address 和 Google -> click Create application
2. copy API Keys and paste in .env file -> click Continue in docs
3. 照著 https://clerk.com/docs/quickstarts/nextjs 操作，在 Build your own sign in and sign up pages 這個步驟時我們的路徑會不一樣，因為我們有 [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) ，也就是用括號()包起來的資料夾，我們 sign up page 會在 `app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx` ， sign in page 也是用同樣的操作，可以直接參考源代碼

# Dark Mode

1. install next-themes run command `npm i next-themes`
2. see https://ui.shadcn.com/docs/dark-mode/next
3. Wrap your root layout ， ThemeProvider 必須要在 `<body>` 裡面，因為 ThemeProvider 會添加 `<script>` ， `<script>` 標籤必須在 `<body>` 或 `<head>` 裡，如果 ThemeProvider 在 `<body>` 標籤外面會出現 Hydration failed ， Warning: Expected server HTML to contain a matching `<script>` in `<html>`. 警告：`<html>` 裡面有 `<script>`

# Setup database

## Create database use PlanetScale

1. goto https://planetscale.com/ and sign in
2. create database 前需要填寫信用卡資訊，填寫完之後才能創建資料庫，記得選免費的 hobby plan 不然會被收錢
3. 建立完資料庫後點擊 Connect -> click Create password -> Connect with 選擇 Prisma -> click .env tab 複製內容到 .env 貼上 -> click schema.prisma tab 複製內容到 prisma/schema.prisma 將原本的內容刪除後貼上

## Prisma

### Install and init prisma

1. install prisma, run command: `npm i -D prisma`
2. init prisma, run command: `npx prisma init`

### Run Commands everytime after modify schema.prisma

1. add schema to node_modules `npx prisma generate`
2. create schema collections into database `npx prisma db push`

### PrismaClient

1. install prisma client: `npm i @prisma/client`
2. export PrismaClient, see lib/db.ts

### Open prisma studio

`npx prisma studio`

### 如何 reset db

https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#reset-the-development-database  
`npx prisma migrate reset`  
注意：這個指令會移除整個 db

### Troubleshooting

#### Property is missing

在 db.server.create 的時候出現下面的錯誤訊息：  
Property 'createdAt' is missing in type '{ profileId: string; name: any; imageUrl: any; inviteCode: string; }' but required in type 'ServerUncheckedCreateInput'.  
少了 Property 'createdAt' ，因為我們忘了給 createdAt default value 所以 createdAt 變成必傳參數，到 prisma/schema.prisma 將 server model 的 createdAt 改成 `createdAt DateTime @default(now())` 後，使用 `npx prisma generate` 和 `npx prisma db push` 更新 types 和 db

#### not assignable to type 'ServerWhereUniqueInput'

在 db.server.create 的時候出現下面的錯誤訊息：  
Type '{ inviteCode: string; }' is not assignable to type 'ServerWhereUniqueInput'.  
類型 '{ inviteCode: string; }' 不能傳給類型 'ServerWhereUniqueInput'  
Prisma 的 update 方法的 where 子句需要提供能夠唯一識別要更新的記錄的資訊。因為 update 方法的目的是更新特定的記錄，而不是對多個記錄進行批量更新。只有提供了唯一識別的條件，Prisma 才能確切知道要更新哪一個記錄。  
也就是 server model 的 inviteCode 必須要是唯一識別，要在 prisma/schema.prisma 的 server model 的 inviteCode 加上 @unique ，`inviteCode String @unique`，限制 inviteCode 欄位的值是唯一的不能重複改完之後再 `npx prisma generate` 生成類別並 `npx prisma db push` 更新 db

# Upload image use uploadthing

## Setup uploadthing

1. goto https://uploadthing.com/ and sign in
2. click create app -> enter app name -> click Create App
3. click tab Api Keys on the left -> copy API key -> paste into .env file
4. see doc to setup package : https://docs.uploadthing.com/getting-started

## Setup uploadthing With Next.js App Router

1. see doc: https://docs.uploadthing.com/nextjs/appdir
2. see file: app/api/uploadthing/core.ts
3. see file: app/api/uploadthing/route.ts
4. see file: lib/uploadthing.ts
5. make /api/uploadthing routes public, use the publicRoutes option, see doc: https://clerk.com/docs/references/nextjs/auth-middleware#making-pages-public-using-public-routes  
   middleware.ts
   ```ts
   export default authMiddleware({
     publicRoutes: ["/api/uploadthing"],
   });
   ```
6. create upload file input, see file: components/file-upload.tsx

# Api route.ts

## Troubleshooting

### Cannot read properties of undefined

```sh
- error TypeError: Cannot read properties of undefined (reading 'headers')
```

出現上面的錯誤時可能的原因是 api 沒有 return response

# SocketIO

## Add a hook to connect socketIO and watch events

socketIO 發送事件文件: https://socket.io/docs/v3/emitting-events/

1. 盤點我們從 socketIO server 發送了那些事件

   1. pages/api/socket/messages/index.ts

      ```ts
      const channelKey = `chat:${channelId}:messages`;

      res?.socket?.server?.io?.emit(channelKey, message);
      ```

   2. pages/api/socket/messages/\[messageId\].ts

      ```ts
      const updateKey = `chat:${channelId}:messages:update`;

      res?.socket?.server?.io.emit(updateKey, message);
      ```

## Troubleshooting

### WebSocket 連線錯誤

#### 可能看到的錯誤訊息

1. 在 client console 出現錯誤訊息： websocket.js:43 WebSocket connection to 'ws://localhost:3000/api/socket/io?EIO=4&transport=websocket&sid=8SvASW9Es8H65JAdAAAG' failed
2. 在 server 上的 terminal 出現錯誤訊息：code: 'UND_ERR_INVALID_ARG' ，表示 WebSocket 連接失敗
3. 在 server 上的 terminal 出現錯誤訊息： Error handling upgrade request TypeError: fetch failed
4. 在 server 上的 terminal 出現錯誤訊息： Module not found: Can't resolve 'bufferutil' (重整頁面可能不會出現，要 restart server 客戶端再刷新一次才會在終端機看到)
5. 在 server 上的 terminal 出現錯誤訊息： Module not found: Can't resolve 'utf-8-validate' (重整頁面可能不會出現，要 restart server 客戶端再刷新一次才會在終端機看到)

#### Solutions

1. 不使用 websocket 改用 react query 用 polling 的方式每隔一秒輪詢伺服器  
    hooks/use-chat-query.tsx
   ```tsx
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
     useInfiniteQuery({
       queryKey: [queryKey],
       queryFn: fetchMessages,
       getNextPageParam: (lastPage) => lastPage?.nextCursor,
       refetchInterval: 1000, // polling server 每隔一秒輪詢伺服器，也就是每隔一秒對伺服器發送一個 request
     });
   ```
2. 解決 socketIO 的 websocket 的連線問題
   可以參考： https://github.com/vercel/next.js/issues/44273

   1. 修改 next.config.js

      ```js
      const nextConfig = {
        webpack: (config) => {
          config.externals.push({
            "utf-8-validate": "commonjs utf-8-validate",
            bufferutil: "commonjs bufferutil",
          });

          return config;
        },
      };
      ```

   2. 降低 next 的版本到 13.4.12 ，到 package.json 將 next 的版本改成 13.4.12 ，將 eslint-config-next 的版本改成 13.4.12
      ```json
      {
        "dependencies": {
          "eslint-config-next": "13.4.12",
          "next": "13.4.12"
        }
      }
      ```
   3. run `npm i`

# tanstack/react-query

## 相關文件

1. Manage cacheTime & staleTime: https://github.com/TanStack/query/discussions/3326

# Troubleshooting

1. Send get request but server response 500 error  
   Client side error message: GET http://localhost:3000/api/messages?channelId=84ccd0db-6f2f-4a46-a5ab-edf3e6f88091&cursor=8c034074-455c-46e7-886d-c55910d1aed2 500 (Internal Server Error)  
   Server side error message: error TypeError: Cannot read properties of undefined (reading 'headers')
   at eval (webpack-internal:///(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.js:265:61)  
   會出現這的原因是， app/api/messages/route.ts 沒有 return 正確的回應，確認有正確的返回值 `return NextResponse.json()` 問題應該能解決

# Implement video chat

## 創建 livekit 帳戶並配置相關設定

### 創建 livekit 帳戶

goto https://livekit.io/ -> 找到上方 navbar 點擊 Cloud -> 點擊 Get Started -> 創建一個帳戶 -> 點擊 Continue -> 在 App Name 輸入框輸入 app 名稱，這邊我先輸入 discord-tutorial -> 點擊 Continue -> 填寫一些資訊 -> 送出後就會到 livekit 的 dashboard

### Configuration

1. 在 livekit 的 dashboard 上方有個格式像網址的字串，類似 `discord-tutorial-snjaicrg.livekit.cloud` 在他旁邊有個複製按鈕，點下去會複製 websocket 的 url ，格式像 `wss://discord-tutorial-snjaicrg.livekit.cloud` ，把它貼到 .env 的 NEXT_PUBLIC_LIVEKIT_URL ，像是：`NEXT_PUBLIC_LIVEKIT_URL=wss://discord-tutorial-snjaicrg.livekit.cloud`
2. 在 dashboard 左側欄找到 Settings ，點擊 KEYS Tab ，點擊 Add New Key 按鈕，輸入關於這把 API KEY 的描述，點擊 Generate 按鈕之後，會跳出 API KEY 和 SECRET KEY ，把他們複製貼上到 .env 文件中，像是
   ```txt
   LIVEKIT_API_KEY=AP*******9d8
   LIVEKIT_API_SECRET=j6D*******1g92B
   ```
3. 最後 .env 文件會增加下列這些 key-value
   ```txt
   LIVEKIT_API_KEY=AP*****o9d8
   LIVEKIT_API_SECRET=j6*****92B
   NEXT_PUBLIC_LIVEKIT_URL=wss://dis*****icrg.livekit.cloud
   ```

### Get start

到 https://docs.livekit.io/realtime/ LiveKit Docs 找到 Quickstarts for every platform
， 點擊 Next.js 13 按鈕

1. Install LiveKit SDK `npm install livekit-server-sdk livekit-client @livekit/components-react @livekit/components-styles --save`
2. 第二步驟的 Configuration 我們已經做過了跳過
3. Create token endpoint ，在專案目錄下創建 `app/api/livekit/route.ts` 並貼上以下內容

```ts
import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");
  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username });

  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: at.toJwt() });
}
```
4. create media room at `components/media-room.tsx`, see `components/media-room.tsx` file
5. 在 `app/(main)/(routes)/servers/[serverId]/channels/[channelId]/page.tsx` 引入 `<MediaRoom />`
6. 在前台點擊 CHANNELS 旁邊的 "+" 號， Channel Type 選擇 Audio 或 Video ，進入該 channel 可以測試音訊通話和視訊通話

# Deployment
我們不能部署到 vercel 因為 vercel 是 serverless 的，因為我們有用 websocket 所以我們不能用 serverless 的服務，所以我們改部署到 https://railway.app/
1. 到 https://railway.app/ 用創建一個帳戶
2. 登入後點擊 New Project -> 點擊 Deploy from GitHub repo -> 點擊 Configure GitHub App -> 選擇 All repositories -> 點擊 Install & Authorize -> 重整頁面再點擊 Deploy from GitHub repo 就會看到 github 帳戶底下的專案 -> 點擊你要部署的專案 -> 點擊 Add variables -> 點擊 Raw Editor -> 找到專案的 .env 文件並複製裡面的所有內容 -> 點擊 Update Variables