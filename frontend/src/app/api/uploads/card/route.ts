import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Note: This temporary upload endpoint stores files on the server's /tmp storage.
// On serverless hosts, this may be ephemeral. Prefer a proper storage service for production.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const id = crypto.randomBytes(8).toString('hex');
  const uploadsDir = '/tmp/typenad_uploads';
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${id}.png`);
  await writeFile(filePath, buffer);

  const host = req.headers.get('host') ?? 'localhost:3000';
  const base = process.env.NEXT_PUBLIC_APP_URL || `http://${host}`;
  const url = `${base}/api/uploads/card/${id}`;

  return NextResponse.json({ url });
}
