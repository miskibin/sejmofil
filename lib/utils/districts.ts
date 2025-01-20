// Map of district names by their numbers
const districtNames: Record<string, string> = {
  '1': 'Legnica',
  '2': 'Wałbrzych',
  '3': 'Wrocław',
  '4': 'Bydgoszcz',
  '5': 'Toruń',
  '6': 'Lublin',
  '7': 'Chełm',
  '8': 'Zielona Góra',
  '9': 'Łódź',
  '10': 'Piotrków Trybunalski',
  '11': 'Sieradz',
  '12': 'Chrzanów',
  '13': 'Kraków',
  '14': 'Nowy Sącz',
  '15': 'Tarnów',
  '16': 'Płock',
  '17': 'Radom',
  '18': 'Siedlce',
  '19': 'Warszawa',
  '20': 'Warszawa',
  '21': 'Opole',
  '22': 'Krosno',
  '23': 'Rzeszów',
  '24': 'Białystok',
  '25': 'Gdańsk',
  '26': 'Słupsk',
  '27': 'Bielsko-Biała',
  '28': 'Częstochowa',
  '29': 'Gliwice',
  '30': 'Rybnik',
  '31': 'Katowice',
  '32': 'Sosnowiec',
  '33': 'Kielce',
  '34': 'Elbląg',
  '35': 'Olsztyn',
  '36': 'Kalisz',
  '37': 'Konin',
  '38': 'Piła',
  '39': 'Poznań',
  '40': 'Koszalin',
  '41': 'Szczecin',
}

const postalCodeMapping: Record<string, string> = {
  // Warsaw and surrounding (00-04)
  '00': '19', // Warszawa
  '01': '19', // Warszawa
  '02': '19', // Warszawa
  '03': '19', // Warszawa
  '04': '19', // Warszawa

  // Warsaw metropolitan area (05)
  '05': '20', // Warszawa (metropolitan)

  // North-eastern Warsaw region (06-07)
  '06': '18', // Siedlce
  '07': '18', // Siedlce

  // Eastern Warsaw region (08)
  '08': '18', // Siedlce

  // Płock region (09)
  '09': '16', // Płock

  // Olsztyn region (10-14)
  '10': '35', // Olsztyn
  '11': '35', // Olsztyn
  '12': '35', // Olsztyn
  '13': '34', // Elbląg
  '14': '34', // Elbląg

  // Białystok region (15-19)
  '15': '24', // Białystok
  '16': '24', // Białystok
  '17': '24', // Białystok
  '18': '24', // Białystok
  '19': '24', // Białystok

  // Lublin region (20-24)
  '20': '6', // Lublin
  '21': '6', // Lublin
  '22': '7', // Chełm
  '23': '6', // Lublin
  '24': '6', // Lublin

  // Kielce region (25-29)
  '25': '33', // Kielce
  '26': '33', // Kielce
  '27': '33', // Kielce
  '28': '33', // Kielce
  '29': '33', // Kielce

  // Kraków region (30-34)
  '30': '13', // Kraków
  '31': '13', // Kraków
  '32': '12', // Chrzanów
  '33': '15', // Tarnów
  '34': '14', // Nowy Sącz

  // Rzeszów region (35-39)
  '35': '23', // Rzeszów
  '36': '23', // Rzeszów
  '37': '22', // Krosno
  '38': '22', // Krosno
  '39': '23', // Rzeszów

  // Upper Silesia region (40-44)
  '40': '31', // Katowice
  '41': '31', // Katowice
  '42': '28', // Częstochowa
  '43': '27', // Bielsko-Biała
  '44': '30', // Rybnik

  // Opole region (45-49)
  '45': '21', // Opole
  '46': '21', // Opole
  '47': '21', // Opole
  '48': '21', // Opole
  '49': '21', // Opole

  // Wrocław region (50-59)
  '50': '3', // Wrocław
  '51': '3', // Wrocław
  '52': '3', // Wrocław
  '53': '3', // Wrocław
  '54': '3', // Wrocław
  '55': '3', // Wrocław
  '56': '3', // Wrocław
  '57': '2', // Wałbrzych
  '58': '2', // Wałbrzych
  '59': '1', // Legnica

  // Poznań region (60-64)
  '60': '39', // Poznań
  '61': '39', // Poznań
  '62': '37', // Konin
  '63': '36', // Kalisz
  '64': '38', // Piła

  // Zielona Góra region (65-69)
  '65': '8', // Zielona Góra
  '66': '8', // Zielona Góra
  '67': '8', // Zielona Góra
  '68': '8', // Zielona Góra
  '69': '8', // Zielona Góra

  // Szczecin region (70-74)
  '70': '41', // Szczecin
  '71': '41', // Szczecin
  '72': '41', // Szczecin
  '73': '41', // Szczecin
  '74': '41', // Szczecin

  // Koszalin region (75-78)
  '75': '40', // Koszalin
  '76': '40', // Koszalin
  '77': '40', // Koszalin
  '78': '40', // Koszalin

  // Gdańsk region (80-84)
  '80': '25', // Gdańsk
  '81': '26', // Słupsk
  '82': '25', // Gdańsk
  '83': '26', // Słupsk
  '84': '26', // Słupsk

  // Bydgoszcz region (85-89)
  '85': '4', // Bydgoszcz
  '86': '4', // Bydgoszcz
  '87': '5', // Toruń
  '88': '4', // Bydgoszcz
  '89': '4', // Bydgoszcz

  // Łódź region (90-99)
  '90': '9', // Łódź
  '91': '9', // Łódź
  '92': '9', // Łódź
  '93': '9', // Łódź
  '94': '9', // Łódź
  '95': '9', // Łódź
  '96': '10', // Piotrków Trybunalski
  '97': '10', // Piotrków Trybunalski
  '98': '11', // Sieradz
  '99': '11', // Sieradz
}

export function getDistrictFromPostalCode(postalCode: string): string | null {
  if (postalCode.length < 2) {
    return null
  }
  const prefix = postalCode.slice(0, 2)
  const districtNumber = postalCodeMapping[prefix]
  if (!districtNumber) {
    return null
  }
  return districtNames[districtNumber] || null
}

export { districtNames }
