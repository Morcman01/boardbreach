import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest){
    const userId = await getCurrentUserId();

    if(!userId){
        return  NextResponse.json(
            {error: "User not authenticated"},
            {status: 401}
        );
    }

    const body = await req.json();
    const { name } = body;

    if(!name || typeof name !== "string" || name.trim().length === 0){
        return NextResponse.json(
            {error: "Team name is required"},
            {status: 400}
        );
    }


    const team = await prisma.team.create({
        data: {
            name: name.trim(),
            ownerId: userId,
            members: {
                create: {
                    userId: userId,
                    role: "OWNER",
                },
            },
        },
        include: {
            members: true,
        },
    });

    return NextResponse.json(
        {team, status: 201}
    );
}

export async function GET(){
    const userId = await getCurrentUserId();

    if(!userId){
        return  NextResponse.json(
            {error: "User not authenticated"},
            {status: 401}
        );
    }

    const teams = await prisma.team.findMany({
        where: {
            members: {
                some: {userId},
            },
        },
        include: {
            members: true,
        },
    });

    return NextResponse.json(teams)
}