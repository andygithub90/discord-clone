import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Member, Message, Profile } from "@prisma/client";

import { useSocket } from "@/components/providers/socket-provider";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    // socketIO Emitting events: https://socket.io/docs/v3/emitting-events/
    // socket watch updateKey 事件，如果收到 updateKey 事件可以在第二個參數的 callback function 的參數拿到 socket 送來的資料
    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      console.log("hooks/use-chat-socket.ts queryKey: ", queryKey);
      // https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientsetquerydata
      queryClient.setQueryData([queryKey], (oldData: any) => {
        console.log(
          "hooks/use-chat-socket.ts updateKey queryClient oldData: ",
          oldData
        );
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        // 遍歷 oldData.pages 找到匹配 id 的 message 並替換掉他
        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            }),
          };
        });

        return { ...oldData, pages: newData };
      });
    });

    // socket watch addKey 事件，如果收到 addKey 事件可以在第二個參數的 callback function 的參數拿到 socket 送來的資料
    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      // https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientsetquerydata
      queryClient.setQueryData([queryKey], (oldData: any) => {
        console.log(
          "hooks/use-chat-socket.ts addKey queryClient oldData: ",
          oldData
        );
        // 如果沒有 oldData 就新增一條 message
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
