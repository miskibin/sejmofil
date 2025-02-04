const PHOTOS = [
  'psejm1.jpg',
  'sejm3.jpg',
  'sejm.jpg',
  'tusk_test2.jpg',
  'tusk_test3.jpg',
  'tusk_test4.jpg',
  'tusk_test5.jpg',
  'tusk_test6.jpg',
  'tusk_test7.jpg',
  'tusk_test8.jpg',
  'tusk_test9.jpg',
  'tusk_test.jpg',
]

export function getRandomPhoto(number: string): string {
  const randomIndex = Math.floor(Number(number) % PHOTOS.length)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sejm_test/${PHOTOS[randomIndex]}`
}
