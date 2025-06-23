import React from "react"
import { ProfileCard } from "./ProfileCard"
import peopleData from "../data/people.json"

export const PeopleGrid = () => {
  const people = peopleData

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map((person) => (
        <ProfileCard key={person.id} {...person} />
      ))}
    </div>
  )
}
