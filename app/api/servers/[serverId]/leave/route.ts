import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        // server.profileId 不能是 profile.id 因為創建 server 的人也就是 ADMIN 不能離開 server
        profileId: {
          not: profile.id,
        },
        // 非 ADMIN 的 member 才可以離開 channel
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server)
  } catch (error) {
    console.log("[SERVER_ID_LEAVE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
