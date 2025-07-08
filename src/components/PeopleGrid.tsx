import { ProfileCard } from "./ProfileCard"
import BlurFade from "./ui/blur-fade"

interface PeopleGridProps {
  onCardClick: (index: number) => void;
  people: any[];
}

export const PeopleGrid = ({ onCardClick, people }: PeopleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map((person, idx) => (
        <BlurFade key={person.id} delay={0.1 + idx * 0.05} inView>
          <ProfileCard 
            name={person.name}
            role={person.role}
            avatar_initials={person.avatar_initials}
            avatar_color={person.avatar_color}
            profileImage={person.profileImage}
            skills={person.skills}
            onClick={() => onCardClick(idx)}
          />
        </BlurFade>
      ))}
    </div>
  )
}

// this is takao
