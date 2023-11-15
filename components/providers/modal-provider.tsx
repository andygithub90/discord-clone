"use client";

import { useEffect, useState } from "react";

import { EditServerModal } from "@/components/modals/edit-server-modal";
import { InviteMoal } from "@/components/modals/invite-modal";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { MembersModel } from "@/components/modals/members-model";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { DeleteServerModel } from "@/components/modals/delete-server-modal";
import { DeleteChannelModel } from "@/components/modals/delete-channel-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { MessageFileModal } from "@/components/modals/message-file-model";
import { DeleteMessageModal } from "@/components/modals/delete-message-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InviteMoal />
      <EditServerModal />
      <MembersModel />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModel />
      <DeleteChannelModel />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </>
  );
};
