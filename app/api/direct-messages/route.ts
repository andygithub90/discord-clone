import { NextResponse } from "next/server";
import { DirectMessage } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("ConversationId ID missing", { status: 400 });
    }

    let messages: DirectMessage[] = [];

    if (cursor) {
      /*
      使用 Prisma 查詢消息（messages）數據。讓我們來解釋這段代碼的每個部分：

      messages = await db.message.findMany({ ... }): 這一行代碼使用 Prisma 的 findMany 方法來查詢消息（messages）數據，並將結果儲存在 messages 變數中。

      take: MESSAGES_BATCH: 這個部分指定要取回的消息的數量，MESSAGES_BATCH 可能是一個事先定義好的常數，用於控制每次查詢的消息數量。

      skip: 1: 此部分指定跳過（不包括）查詢結果中的前一條消息。在分頁查詢中，這個選項可用於獲取下一批消息。

      cursor: { id: cursor }: 這裡使用了游標分頁（cursor-based pagination）的概念。id 指定了遊標字段，cursor 是一個游標值，它指示從哪條消息開始查詢下一批消息。通常，遊標是根據消息的唯一標識（例如 id）來指定的。

      where: { channelId }: 這個部分指定查詢的條件，它要求查找消息所在的 channelId 符合指定的值。這意味著我們僅查找具有特定 channelId 值的消息。

      總結，這段代碼的目的是查詢一批消息，並且使用分頁概念控制每次查詢的消息數量，同時確保我們僅查找特定 channelId 的消息。游標則用於定位下一批要查詢的消息，以實現分頁功能。
      */
      // Cursor-based pagination: https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // 如果沒有 cursor
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    // 如果 messages 的長度等於 MESSAGES_BATCH ，表示 messages 後面還有訊息，則將 nextCursor 指針指向 messages 的最後一則訊息的 id ，如果 messages.length < MESSAGES_BATCH 則表示已經到了 messages 的底部
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("[DIRECT_MESSAGE_GET]", error);
    return new NextResponse("Unternal Error", { status: 500 });
  }
}
