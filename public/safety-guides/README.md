# International Emergency Safety Guides

This folder contains PDF guides from official international organizations for emergency preparedness and first aid.

## Official Sources

### Red Cross / Red Crescent
- **First Aid Guide**: https://www.ifrc.org/document/first-aid-training-manual
- **Emergency Preparedness**: https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html
- **Disaster Response**: https://www.ifrc.org/our-work/disasters-climate-and-crises

### FEMA (Federal Emergency Management Agency)
- **Emergency Response Guide**: https://www.fema.gov/emergency-managers/national-preparedness/frameworks/response
- **First Aid Basics**: https://www.fema.gov/pdf/library/f&web.pdf
- **Family Emergency Plan**: https://www.ready.gov/sites/default/files/2020-03/ready_family-emergency-plan.pdf

### WHO (World Health Organization)
- **First Aid Manual**: https://www.who.int/publications/i/item/9789241549356
- **Emergency Medical Teams**: https://www.who.int/emergencies/emergency-medical-teams

### UN OCHA (Office for the Coordination of Humanitarian Affairs)
- **Emergency Response Handbook**: https://www.unocha.org/publication/emergency-response-handbook

## Specific Emergency Types

### Earthquake
- USGS Earthquake Safety: https://www.usgs.gov/natural-hazards/earthquake-hazards/science/earthquake-safety
- Red Cross Earthquake Guide: https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html

### Tsunami
- NOAA Tsunami Safety: https://www.tsunami.gov/
- UNESCO IOC Tsunami Ready: https://www.ioc-cd.org/index.php?option=com_content&view=article&id=14&Itemid=9

### Wildfire
- Ready.gov Wildfire: https://www.ready.gov/wildfires
- Cal Fire Safety Guide: https://www.readyforwildfire.org/

### Flood
- FEMA Flood Safety: https://www.fema.gov/flood
- Red Cross Flood Guide: https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html

### Hurricane/Cyclone
- NOAA Hurricane Safety: https://www.noaa.gov/education/resource-collections/weather-atmosphere/hurricane-safety
- Ready.gov Hurricane: https://www.ready.gov/hurricanes

## First Aid Guides

### CPR and Basic Life Support
- American Heart Association: https://cpr.heart.org/
- European Resuscitation Council: https://www.erc.edu/

### Bleeding Control
- Stop the Bleed: https://www.stopthebleed.org/
- WHO Trauma Care: https://www.who.int/publications/i/item/9789241548212

### Burns
- WHO Burns Management: https://www.who.int/violence_injury_prevention/other_injury/burns/en/

### Fractures and Injuries
- Red Cross First Aid App: https://www.redcross.org/get-help/how-to-prepare-for-emergencies/mobile-apps.html

## Mobile Apps

- Red Cross First Aid
- FEMA App
- WHO First Aid
- ICE (In Case of Emergency)

## Usage in Application

These guides are referenced in:
- `/app/api/catalog/route.ts` - Catalog API
- `/app/emergency/chat/page.tsx` - Emergency AI Assistant
- `/app/chatgpt/page.tsx` - Emergency ChatGPT

## Download Instructions

To add actual PDF files:
1. Download PDFs from official sources above
2. Place them in this `/public/safety-guides/` folder
3. Name them descriptively: `red-cross-first-aid.pdf`, `fema-earthquake-guide.pdf`, etc.
4. Update the catalog API to serve these files

## Legal Note

All guides are from official international organizations and are provided for educational and emergency preparedness purposes. Always verify the source and date of any emergency information.
