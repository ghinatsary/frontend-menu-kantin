import { NextRequest, NextResponse } from 'next/server';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const targetBaseUrl = request.headers.get('x-target-base-url');

  if (!targetBaseUrl || !/^https?:\/\//.test(targetBaseUrl)) {
    return NextResponse.json(
      { status: 'error', message: 'Target backend URL tidak valid' },
      { status: 400 }
    );
  }

  const { path = [] } = await context.params;
  const targetUrl = new URL(path.join('/'), `${targetBaseUrl.replace(/\/+$/, '')}/`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: METHODS_WITH_BODY.has(request.method) ? await request.text() : undefined,
    cache: 'no-store',
  });

  const responseBody = await response.text();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'application/json',
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, context);
}
