import { NextResponse } from 'next/server'
import path from 'path'
import { readFileSync } from 'fs'

export async function GET() {
  try {
    const swPath = path.join(process.cwd(), 'public', 'sw.js')
    const swContent = readFileSync(swPath, 'utf-8')
    
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Service-Worker-Allowed': '/',
      },
    })
  } catch (error) {
    console.error('Error serving service worker:', error)
    return new NextResponse('Service Worker not found', { status: 404 })
  }
}
