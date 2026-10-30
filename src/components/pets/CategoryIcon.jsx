import { Bird, Cat, Dog, PawPrint } from 'lucide-react';

const ICONS = { all: PawPrint, dogs: Dog, cats: Cat, birds: Bird };

export default function CategoryIcon({ category, ...props }) {
  const Icon = ICONS[category] ?? PawPrint;
  return <Icon {...props} />;
}
