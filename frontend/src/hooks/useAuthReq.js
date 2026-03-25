import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import api from "../lib/axios";

let isInterceptorRegistered = false;

function useAuthReq() {
  const { isSignedIn, getToken, isLoaded } = useAuth();
  // include the token to the request headers
  useEffect(() => {

    const interceptor = api.interceptors.request.use(async (config) => {
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;  //never use double quotes only backticks
        }
      }
      return config;
    });

    return () => 
      api.interceptors.request.eject(interceptor);
  }, [isSignedIn, getToken]);

  return { isSignedIn, isClerkLoaded: isLoaded };
}

export default useAuthReq;
