import { NextRequest, NextResponse } from 'next/server';
import { ocrAdapter } from '@/lib/ocr/adapter';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    // Process through OCR adapter
    const ocrResult = await ocrAdapter.processDocument(file.name, file.type);

    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        size: file.size,
        type: file.type,
        ocrResult,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Document upload processing failed' },
      { status: 500 }
    );
  }
}
