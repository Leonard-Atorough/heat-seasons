import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";

export default function ProfilePage() {
  const [userName, setUserName] = useState("");
  const context = useAuth();

  useEffect(() => {
    if (context.user) {
      setUserName(context.user.name);
    }
  }, [context.user]);

  return (
    <div>
      <h1>Profile Page</h1>
      <p>This is the profile page. User details and settings will go here.</p>
      <p>User Name: {userName}</p>
    </div>
  );
}
