import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // API pública que não requer chave de autenticação
    const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', {
      next: {
        revalidate: 3600, // Revalida a cada hora para não sobrecarregar a API
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }

    const data = await response.json();
    const exchangeRate = data?.USDBRL?.bid;

    if (!exchangeRate) {
        throw new Error('Invalid data structure from exchange rate API');
    }

    return NextResponse.json({ rate: parseFloat(exchangeRate) });
  } catch (error: any) {
    console.error('Error fetching exchange rate:', error);
    return NextResponse.json(
      { message: 'Error fetching exchange rate', error: error.message },
      { status: 500 }
    );
  }
}
