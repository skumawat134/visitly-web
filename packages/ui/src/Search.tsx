import { Search as LucidSearch } from 'lucide-react'
import React from 'react'

export const Search = ( {className, size } :{className : string,  size : number}) => {
  return (
     <LucidSearch className={className} size={size} />
  )
}
