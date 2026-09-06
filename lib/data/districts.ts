export const districts = [
  'All Districts',
  'Dhanbad',
  'Ranchi',
  'Jamshedpur',
  'Bokaro',
  'Hazaribagh',
  'Palamu',
  'Latehar',
  'Lohardaga',
  'Gumla',
  'Saraikela',
] as const

export type District = (typeof districts)[number]
