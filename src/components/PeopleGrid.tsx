import { ProfileCard } from "./ProfileCard"
import BlurFade from "./ui/blur-fade"

interface PeopleGridProps {
  onCardClick: (index: number) => void;
  people: any[];
  language?: 'en' | 'ja';
}

export const PeopleGrid = ({ onCardClick, people, language = 'en' }: PeopleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map((person, idx) => (
        <BlurFade key={person.id} delay={0.1 + idx * 0.05} inView>
          <div onClick={() => onCardClick(idx)} className="cursor-pointer">
            <ProfileCard {...person} language={language} />
          </div>
        </BlurFade>
      ))}
    </div>
  )
}

// this is takao
