import { NextResponse } from 'next/server';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    Name?: string;
    Email?: string;
    Plan?: string;
    Address?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get('offset');
    const pageSize = searchParams.get('pageSize') || '100';
    const email = searchParams.get('email'); 
    const plan = searchParams.get('plan'); 

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

    if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_NAME) {
      return NextResponse.json(
        { error: "Missing Airtable configuration" },
        { status: 500 }
      );
    }

    let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?pageSize=${pageSize}`;
    
    let filterConditions = [];
    if (email) {
      filterConditions.push(`{Email}="${email}"`);
    }
    if (plan) {
      filterConditions.push(`{Plan}="${plan}"`);
    }
    
    if (filterConditions.length > 0) {
      const filterString = filterConditions.join(',');
      url += `&filterByFormula=AND(${filterString})`;
    }
    
    if (offset) {
      url += `&offset=${offset}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch data from Airtable' },
        { status: response.status }
      );
    }

    const data: AirtableResponse = await response.json();
    
    const userData = data.records.map((record: AirtableRecord) => ({
      id: record.id,
      createdTime: record.createdTime,
      name: record.fields.Name || null,
      email: record.fields.Email || null,
      plan: record.fields.Plan || null,
      address: record.fields.Address || null,
    }));

    return NextResponse.json({
      success: true,
      count: userData.length,
      totalRecords: data.records.length,
      hasMore: !!data.offset,
      nextOffset: data.offset || null,
      filters: {
        email: email || null,
        plan: plan || null
      },
      data: userData
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}