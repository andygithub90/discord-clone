import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          // profileId: profile.id 查找當前使用者是不是這個 server 的 member
          // role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] } 這個使用者是不是 ADMIN 或 MODERATOR
          // 同時滿足這上面兩個條件，也就是上面是 "且" (AND) 的條件，才符合條件，符合條件才執行更新，也就是當前使用者是這個 server 的 ADMIN 或 MODERATOR 才符合條件
          some: {
            profileId: profile.id, // 查找當前使用者是不是這個 server 的 member
            // 只有 ADMIN 或 MODERATOR 可以 add new channel
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
