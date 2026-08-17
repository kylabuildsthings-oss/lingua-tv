import { DEFAULT_LANGUAGES } from './languages'
import type { DefaultTeacher } from '../types'

function interleaveByLanguage(teachers: DefaultTeacher[]): DefaultTeacher[] {
  const buckets = new Map<DefaultTeacher['language'], DefaultTeacher[]>()
  for (const teacher of teachers) {
    const list = buckets.get(teacher.language) ?? []
    list.push(teacher)
    buckets.set(teacher.language, list)
  }

  const result: DefaultTeacher[] = []
  let added = true
  while (added) {
    added = false
    for (const language of DEFAULT_LANGUAGES) {
      const next = buckets.get(language.id)?.shift()
      if (next) {
        result.push(next)
        added = true
      }
    }
  }
  return result
}

const TEACHERS_BY_LANGUAGE: DefaultTeacher[] = [
  { handle: '@laurasonthecall', name: "Laura's on the Call", language: 'french' },
  { handle: '@maryamgadery', name: 'Maryam Gadery', language: 'french' },
  { handle: '@liannajn', name: 'Lianna JN', language: 'french' },
  { handle: '@nauhailaa', name: 'Nauhaila Kajjout', language: 'french' },
  { handle: '@mademoisellesoso', name: 'Mademoiselle Soso', language: 'french' },
  { handle: '@colasbim', name: 'Colas Bim', language: 'french' },
  { handle: '@assane_ndye', name: 'Assane', language: 'french' },
  { handle: '@maximeelim', name: 'Maxime Lim', language: 'french' },
  { handle: '@minigouzou', name: 'Gouzou', language: 'french' },
  { handle: '@chinezou', name: 'Chinezou', language: 'french' },

  { handle: '@chinese-at-dawn', name: 'Chinese at Dawn', language: 'mandarin' },
  { handle: '@learnchinesewithcoco', name: 'Learn Chinese with Coco', language: 'mandarin' },
  { handle: '@shuoshuochinese', name: 'Shuoshuo Chinese', language: 'mandarin' },
  { handle: '@stellatuan.chinese', name: 'Nail Chinese With Stella', language: 'mandarin' },
  { handle: '@ninjennyland', name: 'Ninjenny Land', language: 'mandarin' },
  { handle: '@ritachinese', name: "Rita's Mandarin", language: 'mandarin' },
  { handle: '@mandarincorner2', name: 'Mandarin Corner', language: 'mandarin' },
  { handle: '@panghuyvette', name: 'Yvette', language: 'mandarin' },
  { handle: '@realfakepod', name: 'Real Fake Pod', language: 'mandarin' },
  { handle: '@lalachinese', name: 'Lala Chinese', language: 'mandarin' },

  { handle: '@estasricapodcast8484', name: 'Estas Ricas Podcast', language: 'spanish' },
  { handle: '@minixxrld', name: 'Mini World', language: 'spanish' },
  { handle: '@myabarberi', name: 'Mya Barberi', language: 'spanish' },
  { handle: '@hadita.fresita', name: 'Hadita Fresita', language: 'spanish' },
  { handle: '@marceholistica', name: 'Marce Holistica', language: 'spanish' },
  { handle: '@dreamaulol', name: 'Dreamau', language: 'spanish' },
  { handle: '@laleonstudio', name: 'La Leon Studio', language: 'spanish' },

  { handle: '@choisusu', name: 'Choi Susu', language: 'korean' },
  { handle: '@easykorean-p9u', name: 'Easy Korean', language: 'korean' },
  { handle: '@didikoreanpodcast', name: "Didi's Culture Podcast", language: 'korean' },
  { handle: '@sdbd_kr', name: 'SDBD Korean Podcast', language: 'korean' },
  { handle: '@koreanmorning', name: 'Real Korean with Morning', language: 'korean' },
  { handle: '@speakkoreanwithjuhee', name: 'Speak Korean with Juhee', language: 'korean' },
  { handle: '@studykoreanwithsol', name: 'Study Korean with Sol', language: 'korean' },
  { handle: '@minjiteacheskorean', name: 'Minji Teaches Korean', language: 'korean' },

  { handle: '@larabrenner', name: 'Lara Brenner', language: 'portuguese' },
  { handle: '@luanacarolina.s', name: 'Luana Carolina', language: 'portuguese' },
  { handle: '@maitresselinea', name: 'Maitres Selinea', language: 'portuguese' },
  { handle: '@mochileiroricky', name: 'Mochileiroricky', language: 'portuguese' },
  { handle: '@desfrutandoavida', name: 'Desfrutandoavida', language: 'portuguese' },
  { handle: '@historiasdejulia', name: 'Julia Leivas', language: 'portuguese' },
  { handle: '@jessicaafiorin', name: 'Jessica Fiorin', language: 'portuguese' },
  { handle: '@bemclara', name: 'Clara do Vale', language: 'portuguese' },
  { handle: '@teachyourselfportuguese', name: 'Teach Yourself Portuguese', language: 'portuguese' },
  { handle: '@oarthurmiller', name: 'Arthur Miller', language: 'portuguese' },

  { handle: '@sayayariart1586', name: 'Saya Yari', language: 'farsi' },
  { handle: '@artmin1', name: 'Artmin1', language: 'farsi' },
  { handle: '@farzanehaff', name: 'Farzaneh Aff', language: 'farsi' },
  { handle: '@gisoodiba', name: 'Gisoodiba', language: 'farsi' },
  { handle: '@sarahaghighat', name: 'Sara Haghighat', language: 'farsi' },
  { handle: '@mobitalk_', name: 'Mobi Talk', language: 'farsi' },
  { handle: '@itsshide', name: 'Itsshide', language: 'farsi' },
  { handle: '@shirinmirkhanart', name: 'Shirin Mikhan Art', language: 'farsi' },
]

export const DEFAULT_TEACHERS = interleaveByLanguage(TEACHERS_BY_LANGUAGE)
