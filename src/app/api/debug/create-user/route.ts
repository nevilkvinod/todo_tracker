import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * SECURITY NOTE: 
 * This route is strictly for development and debugging purposes only.
 * It manually provisions a test user and should be completely removed 
 * before deploying this application to a production environment to 
 * prevent unauthorized account generation.
 */
export async function GET() {
  try {
    const email = "test@gmail.com";
    
    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, upgrade them to MANAGER so the dashboard works
      const upgradedUser = await prisma.user.update({
        where: { email },
        data: { role: 'MANAGER' }
      });
      return NextResponse.json(
        { message: "User existed and was upgraded to MANAGER.", user: upgradedUser },
        { status: 200 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Create the test user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: "Test User",
        password: hashedPassword,
        role: "MANAGER",
      },
      // Exclude the password from the returned result for safety
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      }
    });

    return NextResponse.json(
      { 
        message: "Test user created successfully", 
        user: newUser 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Debug Error - Creating User:", error);
    
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the test user." },
      { status: 500 }
    );
  }
}
