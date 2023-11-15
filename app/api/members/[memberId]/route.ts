import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    const server = await db.server.update({
      // 當前用戶的 id 匹配 server 的 profileId 則用戶是 admin, 只有 admin 有權限把成員從 server 踢掉
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        // delete server 的 members 的 id 匹配 params.memberId 的記錄
        members: {
          deleteMany: {
            id: params.memberId,
            // 但是 admin 沒辦法把自己踢掉，避免有人通過 api 踢掉 admin
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[MEMBER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    // 用 where 找到要 update 的 server ，然後用 data: { members: { update: { ... } } } 指定了要對 server 中的 members 屬性執行更新操作
    const server = await db.server.update({
      // where: { id: serverId, profileId: profile.id }: 這個 where 子句指定了要更新的目標記錄。您通過 id 和 profileId 兩個條件確定了要更新的記錄，這兩個條件組合起來應該可以唯一識別一個 server。
      where: {
        id: serverId,
        // server table 記錄的 profileId 是創建 server 的人，也就是 admin ，只有 admin 有權限修改其他人的 role
        profileId: profile.id,
      },
      // data: { members: { update: { ... } } }: 這部分指定了要對 server 中的 members 屬性執行更新操作。
      data: {
        members: {
          update: {
            where: {
              // 指定要更新的成員記錄的條件。您使用了 id 來確定要更新哪個成員
              id: params.memberId,
              // 確保 admin 只能修改別人的 role 不能修改自己的 role ，因為只有 admin 有權限可以修改別人的 role ，而且一個 server 一定要有一個 admin
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[MEMBERS_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
