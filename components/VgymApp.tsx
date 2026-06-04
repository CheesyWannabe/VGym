"use client";

import { useState } from "react";
import { UserData } from "@/lib/constants";
import Onboarding from "./Onboarding";
import Dashboard from "./Dashboard";

export default function VgymApp() {
  const [userData, setUserData] = useState<UserData | null>(null);

  return (
    <>
      {!userData ? (
        <Onboarding onComplete={setUserData} />
      ) : (
        <Dashboard userData={userData} setUserData={setUserData} />
      )}
    </>
  );
}
