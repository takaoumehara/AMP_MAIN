import React from "react"
import { ProfileCard } from "./ProfileCard"
import BlurFade from "./ui/blur-fade"

interface PeopleGridProps {
  onCardClick: (index: number) => void;
  people: any[];
  onTeamClick?: (teamName: string) => void;
  onSkillClick?: (skill: string) => void;
  onInterestClick?: (interest: string) => void;
}

// Memoized card component to prevent unnecessary re-renders
const MemoizedCardWrapper = React.memo(({ person, idx, onCardClick, onTeamClick, onSkillClick, onInterestClick }: { 
  person: any, 
  idx: number, 
  onCardClick: (idx: number) => void,
  onTeamClick?: (teamName: string) => void,
  onSkillClick?: (skill: string) => void,
  onInterestClick?: (interest: string) => void
}) => {
  // Calculate staggered delay based on row position, not absolute index
  // This keeps delays short and consistent regardless of scroll position
  const rowDelay = (idx % 4) * 0.02; // Max 0.06s delay within each row
  
  return (
    <BlurFade 
      key={person.id} 
      delay={rowDelay}
      duration={0.25}
      inView
      inViewMargin="-20px"
      yOffset={3}
      blur="3px"
    >
      <ProfileCard 
        name={person.name}
        role={person.role}
        avatar_initials={person.avatar_initials}
        avatar_color={person.avatar_color}
        profileImage={person.profileImage}
        skills={person.skills}
        hobbies={person.hobbies}
        team={person.team}
        recentActivity={person.recentActivity}
        github_enhanced={person.github_enhanced}
        onClick={() => onCardClick(idx)}
        onTeamClick={onTeamClick}
        onSkillClick={onSkillClick}
        onInterestClick={onInterestClick}
      />
    </BlurFade>
  );
});

export const PeopleGrid = ({ onCardClick, people, onTeamClick, onSkillClick, onInterestClick }: PeopleGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {people.map((person, idx) => (
        <MemoizedCardWrapper 
          key={person.id}
          person={person}
          idx={idx}
          onCardClick={onCardClick}
          onTeamClick={onTeamClick}
          onSkillClick={onSkillClick}
          onInterestClick={onInterestClick}
        />
      ))}
    </div>
  )
}

// this is takao
