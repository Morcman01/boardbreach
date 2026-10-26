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

export async function getBoardAccess(userId: string, boardId: string){
    const board = await prisma.board.findUnique({where: {id:boardId}});
    if(!board) return null;

    const membership = await getTeamMembership(userId, board.teamId);
    if(!membership) return null;

    return{board, membership};
}

export async function getTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return null;

  const access = await getBoardAccess(userId, task.boardId);
  if (!access) return null;

  return { task, ...access };
}