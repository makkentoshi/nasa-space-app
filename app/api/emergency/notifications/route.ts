import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy initialize OpenAI to avoid build-time errors
let openai: OpenAI | null = null
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    })
  }
  return openai
}

interface EmergencyNotificationRequest {
  emergencyType: 'earthquake' | 'tsunami' | 'fire' | 'flood' | 'medical' | 'accident' | 'violence' | 'other'
  severity: 'extreme' | 'severe' | 'moderate' | 'minor'
  location: {
    lat: number
    lng: number
    address?: string
  }
  userInfo?: {
    name?: string
    phone?: string
    bloodType?: string
    medicalConditions?: string[]
    emergencyContacts?: Array<{ name: string; phone: string; relation: string }>
  }
  customPrompt?: string
  autoCallRescue?: boolean
  language?: 'en' | 'ru' | 'kk'
}

interface GPTResponse {
  notificationMessage: string
  emergencyInstructions: string[]
  safetyTips: string[]
  videoRecommendations: string[]
  rescueCallScript?: string
  estimatedResponseTime?: string
  nearestShelters?: string[]
}

// Emergency service phone numbers by country
const EMERGENCY_NUMBERS = {
  KZ: {
    fire: '101',
    police: '102',
    ambulance: '103',
    gas: '104',
    unified: '112'
  }
}

// Video instruction URLs by emergency type
const EMERGENCY_VIDEOS = {
  earthquake: [
    {
      title: 'Drop, Cover, and Hold On',
      url: 'https://www.youtube.com/watch?v=BLEPakj1YTY',
      duration: '2:30'
    },
    {
      title: 'Earthquake Safety Tips',
      url: 'https://www.youtube.com/watch?v=v59W-KL7Tsg',
      duration: '3:45'
    }
  ],
  tsunami: [
    {
      title: 'Tsunami Evacuation Procedures',
      url: 'https://www.youtube.com/watch?v=Wx9vPv-T51I',
      duration: '4:20'
    }
  ],
  fire: [
    {
      title: 'How to Escape a House Fire',
      url: 'https://www.youtube.com/watch?v=7w3CrZ12QOY',
      duration: '3:15'
    }
  ],
  flood: [
    {
      title: 'Flood Safety and Evacuation',
      url: 'https://www.youtube.com/watch?v=8v1vxHdw0ms',
      duration: '5:00'
    }
  ],
  medical: [
    {
      title: 'CPR and First Aid Basics',
      url: 'https://www.youtube.com/watch?v=RhEXKr5wKxE',
      duration: '10:25'
    }
  ]
}

// Official Emergency Instruction Sources
const OFFICIAL_EMERGENCY_SOURCES = {
  international: {
    redCross: {
      name: 'International Red Cross',
      baseUrl: 'https://www.redcross.org',
      resources: {
        earthquake: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html',
        fire: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/fire.html',
        flood: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html',
        tsunami: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/tsunami.html'
      }
    },
    fema: {
      name: 'FEMA (Federal Emergency Management Agency)',
      baseUrl: 'https://www.fema.gov',
      resources: {
        earthquake: 'https://www.ready.gov/earthquakes',
        fire: 'https://www.ready.gov/wildfires',
        flood: 'https://www.ready.gov/floods',
        tsunami: 'https://www.ready.gov/tsunamis'
      }
    },
    who: {
      name: 'World Health Organization',
      baseUrl: 'https://www.who.int',
      resources: {
        medical: 'https://www.who.int/news-room/fact-sheets/detail/emergency-care',
        firstAid: 'https://www.who.int/activities/improving-the-quality-of-health-services'
      }
    },
    usgs: {
      name: 'USGS Earthquake Hazards Program',
      baseUrl: 'https://www.usgs.gov/programs/earthquake-hazards',
      resources: {
        earthquake: 'https://www.usgs.gov/faqs/what-should-i-do-during-earthquake',
        tsunami: 'https://www.tsunami.gov/'
      }
    }
  },
  kazakhstan: {
    emergencyMinistry: {
      name: 'Ministry of Emergency Situations of Kazakhstan',
      baseUrl: 'https://emer.gov.kz',
      hotline: '112',
      resources: {
        general: 'https://emer.gov.kz/ru',
        earthquake: 'https://emer.gov.kz/ru/page/pamatka-pri-zemletrasenii',
        fire: 'https://emer.gov.kz/ru/page/pravila-pozharnoy-bezopasnosti',
        flood: 'https://emer.gov.kz/ru/page/dejstviya-pri-pavodke'
      }
    },
    healthMinistry: {
      name: 'Ministry of Health of Kazakhstan',
      baseUrl: 'https://www.gov.kz/memleket/entities/dsm',
      ambulance: '103'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmergencyNotificationRequest = await request.json()
    
    const {
      emergencyType,
      severity,
      location,
      userInfo,
      customPrompt,
      autoCallRescue = false,
      language = 'en'
    } = body

    // Validate required fields
    if (!emergencyType || !severity || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: emergencyType, severity, location' },
        { status: 400 }
      )
    }

    // Build GPT prompt
    const systemPrompt = `You are an emergency response AI assistant specialized in providing critical safety information and coordinating emergency services. Your role is to:
1. Provide clear, actionable emergency instructions
2. Prioritize human safety above all else
3. Give specific, step-by-step guidance
4. Include location-specific information when available
5. Recommend appropriate emergency services to contact
6. Provide estimated response times
7. Suggest nearby shelters or safe locations

Respond in ${language === 'ru' ? 'Russian' : language === 'kk' ? 'Kazakh' : 'English'}.`

    const userPrompt = customPrompt || `
EMERGENCY SITUATION:
Type: ${emergencyType}
Severity: ${severity}
Location: ${location.address || `${location.lat}, ${location.lng}`}

${userInfo?.name ? `Person: ${userInfo.name}` : ''}
${userInfo?.bloodType ? `Blood Type: ${userInfo.bloodType}` : ''}
${userInfo?.medicalConditions ? `Medical Conditions: ${userInfo.medicalConditions.join(', ')}` : ''}

Please provide:
1. Immediate emergency notification message (urgent, concise, under 160 characters for SMS)
2. Step-by-step emergency instructions (5-7 specific actions)
3. Critical safety tips specific to this emergency type
4. Estimated emergency response time for this location
5. Types of nearby shelters or safe locations to look for
${autoCallRescue ? '6. Script for calling emergency services (what to say to dispatcher)' : ''}

Format your response as JSON with these exact keys:
{
  "notificationMessage": "urgent SMS message",
  "emergencyInstructions": ["step 1", "step 2", ...],
  "safetyTips": ["tip 1", "tip 2", ...],
  "estimatedResponseTime": "X-Y minutes",
  "nearestShelters": ["shelter type 1", "shelter type 2", ...],
  ${autoCallRescue ? '"rescueCallScript": "what to tell dispatcher"' : ''}
}
`

    // Call OpenAI GPT-4
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const gptResponseText = completion.choices[0]?.message?.content
    if (!gptResponseText) {
      throw new Error('No response from GPT')
    }

    const gptResponse: GPTResponse = JSON.parse(gptResponseText)

    // Add video recommendations
    const videos = EMERGENCY_VIDEOS[emergencyType as keyof typeof EMERGENCY_VIDEOS] || []
    gptResponse.videoRecommendations = videos.map(v => `${v.title} (${v.duration}): ${v.url}`)

    // Get official instruction sources
    const officialInstructions = {
      redCross: OFFICIAL_EMERGENCY_SOURCES.international.redCross.resources[emergencyType as keyof typeof OFFICIAL_EMERGENCY_SOURCES.international.redCross.resources],
      fema: OFFICIAL_EMERGENCY_SOURCES.international.fema.resources[emergencyType as keyof typeof OFFICIAL_EMERGENCY_SOURCES.international.fema.resources],
      usgs: emergencyType === 'earthquake' || emergencyType === 'tsunami' ? OFFICIAL_EMERGENCY_SOURCES.international.usgs.resources[emergencyType] : undefined,
      kazakhstan: OFFICIAL_EMERGENCY_SOURCES.kazakhstan.emergencyMinistry.resources[emergencyType as keyof typeof OFFICIAL_EMERGENCY_SOURCES.kazakhstan.emergencyMinistry.resources] || OFFICIAL_EMERGENCY_SOURCES.kazakhstan.emergencyMinistry.resources.general
    }

    // Build emergency contacts notification
    const emergencyContacts = userInfo?.emergencyContacts || []
    const contactsNotification = emergencyContacts.map(contact => ({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
      message: `EMERGENCY: ${userInfo?.name || 'Contact'} needs help. ${emergencyType} emergency at ${location.address || 'their location'}. Severity: ${severity}. Please respond immediately.`
    }))

    // Prepare rescue call information
    const rescueCallInfo = autoCallRescue ? {
      phoneNumber: EMERGENCY_NUMBERS.KZ.unified,
      script: gptResponse.rescueCallScript || `This is an emergency. ${emergencyType} at ${location.address || `coordinates ${location.lat}, ${location.lng}`}. Severity: ${severity}. ${userInfo?.medicalConditions ? `Medical conditions: ${userInfo.medicalConditions.join(', ')}.` : ''} Please send help immediately.`,
      alternativeNumbers: EMERGENCY_NUMBERS.KZ
    } : null

    // Prepare location sharing links
    const locationLinks = {
      googleMaps: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
      whatsapp: `https://wa.me/?text=Emergency%20Location:%20https://www.google.com/maps?q=${location.lat},${location.lng}`,
      sms: `sms:?body=Emergency%20Location:%20https://www.google.com/maps?q=${location.lat},${location.lng}`
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      emergency: {
        type: emergencyType,
        severity: severity,
        location: location
      },
      gptResponse: gptResponse,
      videos: videos,
      officialInstructions: officialInstructions,
      emergencyContacts: contactsNotification,
      rescueCallInfo: rescueCallInfo,
      locationSharing: locationLinks,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens,
        processingTime: Date.now()
      }
    })

  } catch (error) {
    console.error('Emergency notification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process emergency notification',
        details: error instanceof Error ? error.message : 'Unknown error',
        // Provide fallback emergency instructions
        fallback: {
          notificationMessage: 'EMERGENCY: Immediate assistance required. Location shared with contacts.',
          emergencyInstructions: [
            'Call emergency services immediately (112)',
            'Stay calm and assess the situation',
            'Move to a safe location if possible',
            'Do not put yourself in danger',
            'Wait for professional help to arrive'
          ],
          emergencyNumbers: EMERGENCY_NUMBERS.KZ
        }
      },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving emergency notification settings/history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    // In production, fetch from database
    // For now, return configuration options

    return NextResponse.json({
      success: true,
      emergencyTypes: [
        'earthquake',
        'tsunami',
        'fire',
        'flood',
        'medical',
        'accident',
        'violence',
        'other'
      ],
      severityLevels: ['extreme', 'severe', 'moderate', 'minor'],
      supportedLanguages: ['en', 'ru', 'kk'],
      emergencyNumbers: EMERGENCY_NUMBERS.KZ,
      availableVideos: EMERGENCY_VIDEOS,
      officialSources: OFFICIAL_EMERGENCY_SOURCES,
      features: {
        gptCustomization: true,
        autoCallRescue: true,
        contactNotification: true,
        locationSharing: true,
        videoInstructions: true,
        multiLanguage: true,
        officialInstructions: true
      }
    })
  } catch (error) {
    console.error('Error fetching notification config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}
