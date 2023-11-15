import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

// https://nextjs.org/docs/pages/building-your-application/routing/api-routes#custom-config
// bodyParser is automatically enabled. If you want to consume the body as a Stream or with raw-body, you can set this to false.
export const config = {
  api: {
    bodyParser: false,
  },
};

/*
这段 TypeScript 代码定义了一个函数 ioHandler，该函数处理 Next.js API 请求并与 Socket.IO 集成。让我们逐步解释这段代码：

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {：这行代码定义了一个名为 ioHandler 的函数，它接受两个参数，req 和 res，分别表示 Next.js API 请求对象和自定义的 NextApiResponseServerIo 类型的响应对象。这个函数处理请求和响应。

if (!res.socket.server.io) {：这是一个条件语句，检查 res 响应对象的 socket 属性中的 server 对象是否具有 io 属性。如果 io 属性不存在，说明尚未初始化 Socket.IO 服务器。

const path = "/api/socket/io";：这行代码定义了一个名为 path 的变量，它包含了 Socket.IO 服务器的路径，通常是 "/api/socket/io"。

const httpServer: NetServer = res.socket.server as any;：这行代码将 res.socket.server 强制类型转换为 NetServer 类型，并将其分配给名为 httpServer 的变量。这是因为 Socket.IO 需要与 HTTP 服务器集成，因此需要将 httpServer 传递给 Socket.IO。

const io = new ServerIO(httpServer, { path: path, addTrailingSlash: false });：这行代码创建了一个 Socket.IO 服务器对象 io，使用 ServerIO 构造函数。它将 httpServer 作为第一个参数传递，表示要将 Socket.IO 附加到该 HTTP 服务器上。还传递了一个配置对象，其中指定了路径（path）和是否添加尾部斜杠（addTrailingSlash）等选项。

res.socket.server.io = io;：一旦创建了 Socket.IO 服务器，将它赋值给 res 响应对象的 socket 属性的 server 属性的 io 属性。这是为了将初始化后的 Socket.IO 服务器与响应对象关联，以便在后续请求中可以使用它。

res.end();：最后，通过 res.end() 终止响应。在这种情况下，不会返回任何具体的响应数据，只是表示请求处理完毕。

总结：这段代码的作用是初始化一个 Socket.IO 服务器，将其与响应对象关联，以便在后续请求中使用 Socket.IO 进行实时通信。如果尚未初始化 Socket.IO 服务器，它会创建一个并将其与响应对象关联，否则将不执行任何操作。
*/
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
