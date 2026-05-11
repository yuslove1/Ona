import { lagosTips } from '@/lib/mockRoutes';
import { Shield, Utensils, Cone } from 'lucide-react';

export default function LagosTips() {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'cone': return <Cone className="w-5 h-5 text-lime-600" />;
      case 'shield': return <Shield className="w-5 h-5 text-lime-600" />;
      case 'food': return <Utensils className="w-5 h-5 text-lime-600" />;
      default: return <Cone className="w-5 h-5 text-lime-600" />;
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Lagos Tips for Your Journey</h2>
      <div className="space-y-3">
        {lagosTips.map((tip) => (
          <div key={tip.id} className="bg-gray-100 rounded-2xl p-4 flex gap-4 items-start">
            <div className="bg-white p-2 rounded-full shrink-0">
              {getIcon(tip.icon)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{tip.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
