import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getTeamMembership } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{id: string }>}
) {
    const userId = await getCurrentUserId();

     if(!userId){
        return  NextResponse.json(
            {error: "User not authenticated"},
            {status: 401}
        );
    }

    const { id: teamId } = await params;


    // ~ Checks for rights to add members into group ~
    const requesterMembership = await getTeamMembership(userId, teamId);
    if(
        !requesterMembership || (requesterMembership.role !== "OWNER" && requesterMembership.role !== "ADMIN")
    ){
        return NextResponse.json(
            {error: "Only team owner and admins may add members"},
            {status: 403}
        );
    }

    const body = await req.json()
    const { email, role } = body;

    if(!email){
        return NextResponse.json(
            {error: "email is required"},
            {status: 400}
        );
    }

    const validRoles = ["ADMIN", "MEMBER", "GUEST"];
    const memberRole = role && validRoles.includes(role) ? role : "MEMBER";


    // ~ Find user to add ~
    const userToAdd = await prisma.user.findUnique({ where: { email }});
    if(!userToAdd){return NextResponse.json(
        {error : "No user found with that email"},
        {status: 404}
    );}

    // ~ Check if the user is already a member ~
    const existing = await getTeamMembership(userToAdd.id, teamId);
    if(existing){
        return NextResponse.json(
            {error: "User is already part of this team"},
            {status: 409}
        )
    }

    const membership = await prisma.teamMember.create({
        data:{
            userId: userToAdd.id, teamId,
            role: memberRole,
        },
        include:{
            user:{
                select: {
                    id: true,
                    email: true,
                    name: true,
                }
            }
        }
    });

    return NextResponse.json(membership, {status: 201});
}