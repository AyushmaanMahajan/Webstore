// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/sheets';

export const revalidate = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to load product.' },
      { status: 500 }
    );
  }
}
