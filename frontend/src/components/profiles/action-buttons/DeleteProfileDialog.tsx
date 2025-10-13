import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProfile } from "@/hooks/profiles/use-delete-profile";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useGetNonce } from "@/hooks/profiles/use-get-nonce";
import { generateSiweMessage } from "@/lib/utils/siwe";
import { useAccount, useSignMessage } from "wagmi";

interface DeleteProfileDialogProps {
  children: React.ReactNode;
}

export function DeleteProfileDialog({ children }: DeleteProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteProfile = useDeleteProfile();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: nonceData, isLoading: isLoadingNonce } = useGetNonce(address);

  const siweMessage = nonceData ? generateSiweMessage(nonceData) : "";

  const onConfirm = async () => {
    if (!siweMessage) {
      throw new Error("SIWE message not available");
    }

    const signature = await signMessageAsync({ message: siweMessage });
    await deleteProfile.mutateAsync({ signature });
    await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Profile</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            profile.
          </DialogDescription>
        </DialogHeader>
        {siweMessage && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Message to Sign</label>
            <div className="p-3 bg-gray-50 rounded-md text-sm font-mono break-all">
              {siweMessage}
            </div>
            <p className="text-xs text-gray-600">
              This message will be signed with your wallet to authenticate profile deletion.
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleteProfile.isPending || isLoadingNonce || !siweMessage}
          >
            {isLoadingNonce 
              ? "Loading..." 
              : deleteProfile.isPending 
                ? "Deleting..." 
                : "Delete"
            }
          </Button>
        </div>
        {deleteProfile.isError ? (
          <p className="text-sm text-red-600">
            {(deleteProfile.error as Error).message}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default DeleteProfileDialog;
