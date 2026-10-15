import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(){
    const userId = await getCurrentUserId();

    if(!userId){
        return NextResponse.json(
            {error: "User not authenticated"},
            {status: 401}
        );
    }

    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {id: true, email: true, name: true}
    });

    if(!user){
        return NextResponse.json(
            {error: "User not found"},
            {status: 401}
        );
    }

    return NextResponse.json(user);
} 