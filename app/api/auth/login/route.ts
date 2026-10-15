import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest){
    const body = await req.json();
    const {email, password} = body;

    // ~ basic input validation ~
    if(!email || !password){
        return NextResponse.json(
            {error: "Please enter email and password"},
            {status: 401}
        )
    }

    // ~ Find the user in the database ~
    const user = await prisma.user.findUnique({where: { email }});
    if(!user){
        return NextResponse.json(
            {error: "Invalid email or password"},
            {status: 401}
        )
    }

    // ~ Password check ~
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if(!passwordValid){
        return NextResponse.json(
            {error: "Invalid email or password"},
            {status: 401}
        );
    }

    // ~ sign a JWT ~
    const token = jwt.sign(
        {userId: user.id},
        process.env.JWT_SECRET!,
        {expiresIn: "7d"}
    );

    // ~ Set as httpOnly cookie ~
    const response = NextResponse.json(
        {id: user.id, email: user.email, name: user.name},
        {status: 200}
    );

    response.cookies.set("Token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
}