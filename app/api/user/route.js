import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(request) {
  try {
    // Check if request has a body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      console.error('Empty request body received');
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { firebaseUser } = requestData;
    
    if (!firebaseUser || !firebaseUser.uid) {
      console.error('Invalid user data received:', firebaseUser);
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 400 }
      );
    }

    console.log('Checking/creating user for UID:', firebaseUser.uid);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        firebaseUserId: firebaseUser.uid,
      },
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.id);
      return NextResponse.json({ user: existingUser });
    }

    // Create new user
    const email = firebaseUser.email;
    const name = firebaseUser.displayName || "User";

    if (!email) {
      console.error('No email found for user:', firebaseUser.uid);
      return NextResponse.json(
        { error: 'No email found for user' },
        { status: 400 }
      );
    }

    console.log('Creating new user with email:', email);

    try {
      // Use upsert to handle both firebaseUserId and update
      const newUser = await db.user.upsert({
        where: {
          firebaseUserId: firebaseUser.uid,
        },
        update: {
          name: name,
          imageUrl: firebaseUser.photoURL || "",
          // Don't update email to avoid conflicts
        },
        create: {
          firebaseUserId: firebaseUser.uid,
          name: name,
          imageUrl: firebaseUser.photoURL || "",
          email: email,
        },
      });

      console.log('User created/updated successfully:', newUser.id);
      return NextResponse.json({ user: newUser });
    } catch (upsertError) {
      // If upsert fails due to email constraint, try to find by email
      if (upsertError.code === 'P2002') {
        console.log('Unique constraint error, checking by email...');
        
        // Check if a user with this email exists but different firebaseUserId
        const userByEmail = await db.user.findUnique({
          where: { email: email }
        });
        
        if (userByEmail && userByEmail.firebaseUserId !== firebaseUser.uid) {
          // Update the existing user's firebaseUserId
          const updatedUser = await db.user.update({
            where: { email: email },
            data: {
              firebaseUserId: firebaseUser.uid,
              name: name,
              imageUrl: firebaseUser.photoURL || "",
            }
          });
          console.log('Updated existing user with new firebaseUserId:', updatedUser.id);
          return NextResponse.json({ user: updatedUser });
        }
      }
      throw upsertError;
    }
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in user API:", error.code, error.message);
    }
    
    // Final fallback: try to retrieve user by firebaseUserId
    if (error.code === 'P2002' && requestData?.firebaseUser?.uid) {
      try {
        const existingUser = await db.user.findUnique({
          where: {
            firebaseUserId: requestData.firebaseUser.uid,
          },
        });
        if (existingUser) {
          console.log('Found existing user in final fallback:', existingUser.id);
          return NextResponse.json({ user: existingUser });
        }
      } catch (retryError) {
        console.error('Final fallback failed:', retryError.message);
      }
    }
    
    return NextResponse.json(
      { error: `Failed to create/check user: ${error.message}` },
      { status: 500 }
    );
  }
}