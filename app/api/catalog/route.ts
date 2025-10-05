import { NextResponse } from 'next/server';

// Mock catalog data for survival guides and videos
const catalogItems = [
  {
    id: 'earthquake-guide',
    title: 'Earthquake Safety Guide',
    type: 'guide',
    category: 'earthquake',
    description: 'Complete guide for earthquake preparedness and response',
    thumbnail: '/alerts/earthquake.svg',
    content: 'Detailed earthquake safety instructions...',
    source: 'Red Cross',
    url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html'
  },
  {
    id: 'fire-safety',
    title: 'Fire Safety Guide',
    type: 'guide',
    category: 'fire',
    description: 'Fire prevention and evacuation procedures',
    thumbnail: '/alerts/fire.svg',
    content: 'Fire safety instructions...',
    source: 'FEMA',
    url: 'https://www.ready.gov/fires'
  },
  {
    id: 'flood-preparedness',
    title: 'Flood Preparedness',
    type: 'guide',
    category: 'flood',
    description: 'How to prepare for and respond to floods',
    thumbnail: '/alerts/flood.svg',
    content: 'Flood safety instructions...',
    source: 'Red Cross',
    url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html'
  },
  {
    id: 'tsunami-warning',
    title: 'Tsunami Warning Signs',
    type: 'video',
    category: 'tsunami',
    description: 'Recognize tsunami warning signs and evacuate safely',
    thumbnail: '/alerts/tsunami.svg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    source: 'USGS',
    url: 'https://www.usgs.gov/natural-hazards/tsunami'
  },
  {
    id: 'first-aid-basics',
    title: 'First Aid Basics',
    type: 'guide',
    category: 'medical',
    description: 'Essential first aid techniques for emergencies',
    thumbnail: '/alerts/medical.svg',
    content: 'First aid instructions...',
    source: 'Red Cross',
    url: 'https://www.redcross.org/take-a-class/first-aid'
  },
  {
    id: 'emergency-kit',
    title: 'Emergency Kit Essentials',
    type: 'guide',
    category: 'general',
    description: 'What to pack in your emergency survival kit',
    thumbnail: '/alerts/emergency.svg',
    content: 'Emergency kit checklist...',
    source: 'FEMA',
    url: 'https://www.ready.gov/kit'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    let filtered = catalogItems;

    if (category && category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (type && type !== 'all') {
      filtered = filtered.filter(item => item.type === type);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.type || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, type, category' },
        { status: 400 }
      );
    }

    // In a real app, this would save to a database
    const newItem = {
      id: `custom-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Catalog item created successfully'
    });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create catalog item' },
      { status: 500 }
    );
  }
}
