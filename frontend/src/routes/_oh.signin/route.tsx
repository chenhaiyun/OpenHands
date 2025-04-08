import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "react-oidc-context";

export default function SigninCallback() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    // If we're not already being redirected
    if (!auth.activeNavigator && !auth.isLoading) {
      // Redirect to home page
      navigate("/", { replace: true });
    }
  }, [auth.activeNavigator, auth.isLoading]);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="loader text-gray-300" />
    </div>
  );
}
