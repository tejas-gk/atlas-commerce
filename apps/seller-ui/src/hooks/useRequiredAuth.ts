import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRequireAuth = () => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  // Auth redirect disabled for UI development — re-enable when backend is running
  // useEffect(() => {
  //   if (!isLoading && !seller) {
  //     router.replace("/login");
  //   }
  // }, [seller, isLoading, router]);

  return { seller, isLoading };
};

export default useRequireAuth;
