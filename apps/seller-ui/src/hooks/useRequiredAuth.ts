import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRequireAuth = () => {
  const router = useRouter();
  const { seller, isLoading, switchShop, isSwitchingShop } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.replace("/login");
    }
  }, [seller, isLoading, router]);

  return { seller, isLoading, switchShop, isSwitchingShop };
};

export default useRequireAuth;
