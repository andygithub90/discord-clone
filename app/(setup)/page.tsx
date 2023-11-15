import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = async () => {
  const profile = await initialProfile();

  const server = await db.server.findFirst({
    where: {
      members: {
        // https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#some
        // 使用 some 过滤操作符时，查询会检查关系字段中的每个记录，以查看是否至少有一个记录满足指定的条件。如果没有记录满足条件，查询结果可能为空。
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`)
  }

  return <InitialModal/>;
};

export default SetupPage;
