// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');

    let products = await getProducts();

    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Unable to load products. Please try again.' },
      { status: 500 }
    );
  }
}