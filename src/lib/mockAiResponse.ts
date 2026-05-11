export interface AiInsight {
  id: string;
  type: 'summary' | 'reason' | 'tips' | 'stress';
  title: string;
  content: string | string[]; // string for summary, array for lists
  icon: 'bulb' | 'target' | 'location' | 'star';
  timestamp: string;
}

export const mockAiResponse: AiInsight[] = [
  {
    id: '1',
    type: 'summary',
    title: 'Route Summary',
    content: "Your recommended route prioritizes avoiding major traffic bottlenecks around the Third Mainland Bridge during peak hours, guiding you through local roads with minimal congestion. It's a balanced choice for speed and comfort.",
    icon: 'bulb',
    timestamp: 'Just now',
  },
  {
    id: '2',
    type: 'reason',
    title: 'Why this Route?',
    content: [
      "**Traffic Prediction:** Real-time data shows significant congestion on the main expressway. This route intelligently diverts you through less-trafficked inner roads.",
      "**Safety Zones:** The selected path avoids known construction areas and has a higher safety rating based on recent incidents.",
      "**Time Efficiency:** While slightly longer in distance, this route is projected to save you an estimated 20-30 minutes during typical morning rush hours, getting you to your destination faster than direct routes."
    ],
    icon: 'target',
    timestamp: '2 minutes ago',
  },
  {
    id: '3',
    type: 'tips',
    title: 'Local Tips for Your Journey',
    content: [
      "Consider downloading offline maps, as some parts of the route may have intermittent network coverage.",
      "If you have time, explore the local markets in Ikeja – they offer a vibrant experience.",
      "For a quick snack, look out for 'Akara' sellers near bus stops; they're a local favourite."
    ],
    icon: 'location',
    timestamp: '5 minutes ago',
  },
  {
    id: '4',
    type: 'stress',
    title: 'Understanding Your Stress Score',
    content: [
      "**Fewer Intersections:** The route minimizes complex junctions, reducing decision fatigue.",
      "**Smoother Flow:** Predicted traffic patterns suggest a more consistent pace, with less stop-and-go driving.",
      "**Clearer Signage:** We've selected roads with generally better navigational cues to reduce uncertainty. This allows for a more relaxed and predictable journey through Lagos."
    ],
    icon: 'star',
    timestamp: '10 minutes ago',
  },
];
