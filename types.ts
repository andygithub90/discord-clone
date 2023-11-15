import { Member, Profile, Server } from "@prisma/client";

// 創建一個 Server 關聯到 Member 的 type ，一個 Server 有多個 Member ，一個 Member 有一個 Profile
export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

/*
这段 TypeScript 代码定义了一个名为 NextApiResponseServerIo 的自定义类型（type），用于描述一个 Next.js API 响应对象（NextApiResponse）扩展了与 Socket.IO 相关的属性。

让我们逐步解释这段代码：

import 语句导入了以下模块：

Server as NetServer 从 "net" 模块导入，这是 Node.js 的核心模块，用于处理网络操作。
Socket 从 "net" 模块导入，这是表示网络套接字的类型。
NextApiResponse 从 "next" 模块导入，这是 Next.js 中用于处理 API 响应的类型。
Server as ServerIOServer 从 "socket.io" 模块导入，这是 Socket.IO 服务器的类型。
然后，定义了一个自定义类型 NextApiResponseServerIo。这个类型扩展了 NextApiResponse，并添加了一个名为 socket 的属性，该属性的类型是一个对象，包含了多个嵌套属性：

socket 属性是一个 Socket 类型的对象，表示网络套接字。
server 属性是一个 NetServer 类型的对象，表示一个网络服务器。
io 属性是一个 ServerIOServer 类型的对象，表示 Socket.IO 服务器。
这个自定义类型 NextApiResponseServerIo 的目的是描述一个具有特定结构的响应对象，其中包含了与 Socket.IO 服务器相关的属性。通过这个类型，你可以在代码中明确指定一个 Next.js API 响应对象的结构，包括与 Socket.IO 集成的信息。这有助于类型检查和代码提示，以确保在使用这个特定类型的响应对象时，开发人员了解其结构和属性。
*/
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as ServerIOServer } from "socket.io";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIOServer;
    };
  };
};