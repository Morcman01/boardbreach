import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getBoardAccess, getTeamMembership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
){
    const userId = await getCurrentUserId();
    if(!userId){
        return NextResponse.json({error : "not authenticated"}, {status: 401});
    }

    const { id : boardId } = await params

    const access = await getBoardAccess(userId, boardId);
    if(!access){
        return NextResponse.json({error: "board not found"}, {status: 401});
    }

    //read only for guests
    if (access.membership.role === "GUEST") {
        return NextResponse.json(
        { error: "guests cannot create tasks" },
        { status: 403 }
        );
    }

    const body = await req.json();
    const { title, description, assigneeId } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    //assignee has to be on the same team 
    if(assigneeId){
        const assigneeMembership = await getTeamMembership(
            assigneeId, 
            access.board.teamId
        );

        if(!assigneeMembership){
            return NextResponse.json({error: "assignee isnot a member of the team"}, {status: 400});
        }
    }

    const task = await prisma.task.create({
        data: {
            title: title.trim(),
            description: description ?? null, boardId,
            createdById: userId,
            assigneeId: assigneeId ?? null,
        },
    });

    return NextResponse.json(task, {status: 201});
}



export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const userId = await getCurrentUserId();
    if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
    }

    const { id: boardId } = await params;

    const access = await getBoardAccess(userId, boardId);
    if(!access){
        return NextResponse.json({error: "board not found"}, {status: 404});
    }

    const tasks = await prisma.task.findMany({
        where: { boardId },
        include: {
            assignee: {select: {id: true, name: true}},
        },
        orderBy: {createdAt: "asc"},
    });

    return NextResponse.json(tasks)

}