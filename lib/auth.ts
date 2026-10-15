import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

interface TokenPayload{
    userId: string;
}

export async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("Token")?.value;

    if (!token){
        return null;
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
        return payload.userId;
    } catch {
        return null;
    }
}

export async function getTeamMembership(userId: string, teamId: string){
    return prisma.teamMember.findUnique({
        where:{
            userId_teamId:{
                userId,
                teamId,
            },
        },
    });
}