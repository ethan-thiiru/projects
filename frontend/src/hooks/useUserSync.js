import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { syncUser } from "../lib/api";

// the best way to implement this is by using webhooks
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const { mutate: syncUserMutation, isPending, isSuccess, isError } = useMutation({ 
    mutationFn: syncUser,
    retry: 2,
   });

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    const name = user?.fullName || user?.firstName;
    const imageUrl = user?.imageUrl;
    
    if (isSignedIn && user && email && name && imageUrl && !isPending && !isSuccess && !isError) {
      syncUserMutation({
        email,
        name,
        imageUrl,
      });
    }
  }, [isSignedIn, user, syncUserMutation, isPending, isSuccess, isError]);

  return { isSynced: isSuccess, syncError: isError };
}

export default useUserSync;