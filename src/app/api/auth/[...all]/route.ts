import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const { GET, POST } = handler;

export async function PUT(request: Request) {
  return handler.PUT?.(request) || new Response('Method not allowed', { status: 405 });
}

export async function PATCH(request: Request) {
  return handler.PATCH?.(request) || new Response('Method not allowed', { status: 405 });
}

export async function DELETE(request: Request) {
  return handler.DELETE?.(request) || new Response('Method not allowed', { status: 405 });
}
