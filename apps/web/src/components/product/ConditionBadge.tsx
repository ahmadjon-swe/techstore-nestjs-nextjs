import { Badge } from '@/components/ui/Badge';

interface ConditionBadgeProps {
  condition: 'NEW' | 'USED';
  grade?: 'A' | 'B' | 'C' | null;
}

export function ConditionBadge({ condition, grade }: ConditionBadgeProps) {
  if (condition === 'NEW') return <Badge tone="new">New</Badge>;
  return <Badge tone="used">Used{grade ? ` · ${grade}` : ''}</Badge>;
}
