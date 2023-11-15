import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChannelType } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { db } from "@/lib/db";

interface ChannelPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelIdPage = async ({ params }: ChannelPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  // 當使用者加入一個 server 時， model member 會插入一筆這個 profile 加入哪個 server 的記錄，所以我們想要識別一個 member 我們需要 profile 和 serverId 兩個條件，來找出是這個 server 同時是當前使用者的 member ，使用者加入一個 server 的邏輯可以看 app/(invite)/(routes)/invite/[inviteCode]/page.tsx
  // 一個 profile 可以有多個 member ，因為一個使用者可以是多個 server 的 member ，所以 member.serverId 和 member.profileId 在 model member 中都會是可以重複的，沒辦法使用 unique constrain ，只有在同時滿足 member.serverId 和 member.profileId 兩個條件的時候這條紀錄才是唯一的，有點像是用 member.serverId 和 member.profileId 組合成一個唯一鍵
  // 這邊不能用 findUnique 因為 findUnique 只能用在有 unique constrain 的 field ，因為 model member 會有重複的 serverId 和 profileId，所以 member.serverId 和 member.profileId 都沒辦法使用 unique constrain ，所以這邊不能用 findUnique 方法
  // 就算用唯一複合鍵也沒辦法使用 findUnique ，參考： https://www.prisma.io/docs/concepts/components/prisma-client/composite-types#considerations-when-using-composite-types
  const member = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={true} />
      )}
    </div>
  );
};

export default ChannelIdPage;
