import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { saveUploadedFile, queueDocumentForProcessing, getDocumentStatus } from '@/lib/ocr';

// POST /api/upload - Upload files for OCR processing
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No files provided' },
                { status: 400 }
            );
        }

        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: `Invalid file type: ${file.type}` },
                    { status: 400 }
                );
            }
        }

        // Process each file
        const uploadedDocs = [];
        for (const file of files) {
            const doc = await saveUploadedFile(session.sellerId, file);

            // Queue for OCR processing
            await queueDocumentForProcessing(doc.id);

            uploadedDocs.push(doc);
        }

        return NextResponse.json({
            success: true,
            data: uploadedDocs,
            message: `${uploadedDocs.length} file(s) uploaded and queued for processing`,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}

// GET /api/upload?documentId=xxx - Get document status
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const documentId = request.nextUrl.searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'Document ID required' },
                { status: 400 }
            );
        }

        const status = await getDocumentStatus(documentId);

        if (!status) {
            return NextResponse.json(
                { success: false, error: 'Document not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: status,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Get document status error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get document status' },
            { status: 500 }
        );
    }
}
