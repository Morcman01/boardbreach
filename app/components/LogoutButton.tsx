"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";

export default function LogoutButton(){
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleLogout(){
        setError("");
        try{
            const res = await fetch("/api/auth/logout", { method: "POST" });

            if(!res.ok){
                setError("Could not log out");
                return;
            }
              
            router.push("/login");
            router.refresh(); 
            
        }catch{
            setError("Could not log out");
        }
    }

    return (
    <>
        <button onClick={handleLogout} className="text-sm text-white-600 hover:underline">
        Log out
        </button>
        {error && <p role="alert" className="text-sm text-white-600">{error}</p>}
    </>
    
  );
}