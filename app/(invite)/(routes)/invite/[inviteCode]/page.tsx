import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn;
  }

  if (!params.inviteCode) {
    return redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      // 找出這個 inviteCode 是哪個 server 的 inviteCode
      inviteCode: params.inviteCode,
      // 查找用了這個 inviteCode 的人是不是已加入 server 的 member
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // 如果用 inviteCode 的人已經是 server 的 member ，把他導向到 match inviteCode 的 server
  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  // 如果用 inviteCode 的人不是 server 的 member ，幫這個人在匹配 inviteCode 的 server 創建屬於他的 member 記錄
  const server = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
};

export default InviteCodePage;
