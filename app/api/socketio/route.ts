import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ 
    status: "Socket.io endpoint ready",
    message: "Use Socket.io client to connect to this endpoint"
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export async function POST(req: NextRequest) {
  return new Response(JSON.stringify({ 
    message: "Socket.io endpoint active"
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  })
}
