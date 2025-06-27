import { ProfileCard } from "./ProfileCard"

interface PeopleGridProps {
  onCardClick: (index: number) => void;
  people: any[];
  language?: 'en' | 'ja';
}

export const PeopleGrid = ({ onCardClick, people, language = 'en' }: PeopleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map((person, idx) => (
        <div key={person.id} onClick={() => onCardClick(idx)} className="cursor-pointer">
          <ProfileCard {...person} language={language} />
        </div>
      ))}
    </div>
  )
}

// this is takao
