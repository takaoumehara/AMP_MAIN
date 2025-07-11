import React from 'react';
import { Button } from './ui/button';
import { BarChart3, Users } from 'lucide-react';

export type SkillMapViewMode = 'people' | 'skills';

interface SkillMapToggleProps {
  viewMode: SkillMapViewMode;
  onViewModeChange: (mode: SkillMapViewMode) => void;
  language: 'en' | 'ja';
}

const SkillMapToggle: React.FC<SkillMapToggleProps> = ({
  viewMode,
  onViewModeChange,
  language
}) => {
  const labels = {
    people: language === 'ja' ? '人材一覧' : 'People',
    skills: language === 'ja' ? 'スキルマップ' : 'Skill Map'
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={viewMode === 'people' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('people')}
        className="flex items-center space-x-2 h-8"
      >
        <Users className="h-4 w-4" />
        <span className="text-xs">{labels.people}</span>
      </Button>
      <Button
        variant={viewMode === 'skills' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('skills')}
        className="flex items-center space-x-2 h-8"
      >
        <BarChart3 className="h-4 w-4" />
        <span className="text-xs">{labels.skills}</span>
      </Button>
    </div>
  );
};

export default SkillMapToggle; 