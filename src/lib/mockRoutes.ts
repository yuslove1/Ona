export interface RouteOption {
  id: string;
  mode: string;
  duration: string;
  cost: string;
  stressLevel: 'Low Stress' | 'Medium Stress' | 'High Stress';
  recommended?: boolean;
  icon: 'bus' | 'car' | 'bike';
}

export const mockRoutes: RouteOption[] = [
  {
    id: '1',
    mode: 'Bus Rapid Transit',
    duration: '45 min',
    cost: '₦500',
    stressLevel: 'Low Stress',
    recommended: true,
    icon: 'bus',
  },
  {
    id: '2',
    mode: 'Private Car',
    duration: '30 min',
    cost: '₦1200',
    stressLevel: 'Medium Stress',
    icon: 'car',
  },
  {
    id: '3',
    mode: 'Motorcycle Ride',
    duration: '25 min',
    cost: '₦800',
    stressLevel: 'High Stress',
    icon: 'bike',
  },
];

export const lagosTips = [
  {
    id: '1',
    title: 'Avoid peak hours',
    description: 'Traffic can be heavy from 7-9 AM and 4-7 PM. Consider adjusting your travel times.',
    icon: 'cone',
  },
  {
    id: '2',
    title: 'Safety first',
    description: 'Always be aware of your surroundings, especially when using public transport at night.',
    icon: 'shield',
  },
  {
    id: '3',
    title: 'Local food stops',
    description: 'Explore street food vendors along your route for an authentic Lagos experience.',
    icon: 'food',
  },
];
