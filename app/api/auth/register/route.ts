import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name } = body;

  // ~ basic input validation ~
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password, and name are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // ~ check for duplicate email ~
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "a user with this email already exists" },
      { status: 409 }
    );
  }

  // ~ hash password ~
  const passwordHash = await bcrypt.hash(password, 10);

  // ~ create user entry ~
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  // ~ return json response ~
  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name },
    { status: 201 }
  );
}