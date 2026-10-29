import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function NavBar(){
    const userId = await getCurrentUserId();

    return(
        <nav className="flex items-center justify-between p-4 border-b">
            <Link href="/teams" className="font-bold">BoardBreach</Link>
            {userId && <LogoutButton />}
        </nav>
    )
}