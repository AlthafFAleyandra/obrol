import { ME_ID, type Conversation, type Member, type Message, type User } from '@/types'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export interface ContactSeed {
  id: string
  name: string
  email: string
  bio: string
  online: boolean
  lastSeenMinAgo: number
}

export const CONTACTS: ContactSeed[] = [
  { id: 'u_rina', name: 'Rina Maharani', email: 'rina.maharani@obrol.id', bio: 'Suka kopi dan buku fiksi.', online: true, lastSeenMinAgo: 0 },
  { id: 'u_budi', name: 'Budi Santoso', email: 'budi.santoso@obrol.id', bio: 'Anak kos, pecinta nasi goreng.', online: true, lastSeenMinAgo: 0 },
  { id: 'u_siti', name: 'Siti Nurhaliza', email: 'siti.nur@obrol.id', bio: 'Desainer grafis lepas.', online: false, lastSeenMinAgo: 47 },
  { id: 'u_agus', name: 'Agus Pratama', email: 'agus.pratama@obrol.id', bio: 'Main futsal tiap Jumat.', online: true, lastSeenMinAgo: 0 },
  { id: 'u_dewi', name: 'Dewi Lestari', email: 'dewi.lestari@obrol.id', bio: 'Lagi belajar bikin kue.', online: false, lastSeenMinAgo: 190 },
  { id: 'u_fajar', name: 'Fajar Nugroho', email: 'fajar.nugroho@obrol.id', bio: 'Developer, begadang adalah hobi.', online: true, lastSeenMinAgo: 0 },
  { id: 'u_putri', name: 'Putri Ayu', email: 'putri.ayu@obrol.id', bio: 'Mahasiswa tingkat akhir. Doakan skripsiku.', online: false, lastSeenMinAgo: 1500 },
  { id: 'u_rizky', name: 'Rizky Ramadhan', email: 'rizky.ramadhan@obrol.id', bio: 'Fotografer amatir.', online: true, lastSeenMinAgo: 0 },
  { id: 'u_maya', name: 'Maya Anggraini', email: 'maya.anggraini@obrol.id', bio: 'Jalan-jalan dulu, kerja belakangan.', online: false, lastSeenMinAgo: 320 },
  { id: 'u_hendra', name: 'Hendra Wijaya', email: 'hendra.wijaya@obrol.id', bio: 'Bapak dua anak, penggemar sepeda.', online: true, lastSeenMinAgo: 0 },
  { id: 'u_nadia', name: 'Nadia Safitri', email: 'nadia.safitri@obrol.id', bio: 'Pecinta kucing nomor satu.', online: false, lastSeenMinAgo: 12 },
  { id: 'u_yoga', name: 'Yoga Permana', email: 'yoga.permana@obrol.id', bio: 'Gitaris akhir pekan.', online: true, lastSeenMinAgo: 0 },
]

/** [pengirim ('me' atau id kontak), menit lalu, isi] */
type Line = [string, number, string]

interface DmSeed {
  contact: string
  /** Jumlah pesan terakhir dari kontak yang belum dibaca pengguna. */
  unread?: number
  /** Pesan terakhir pengguna belum dibaca kontak. */
  lastUnreadByContact?: boolean
  lines: Line[]
}

const DMS: DmSeed[] = [
  {
    contact: 'u_rina',
    unread: 2,
    lines: [
      ['me', 2 * 24 * 60 + 130, 'Rin, buku yang kemarin kamu rekomendasiin judulnya apa ya?'],
      ['u_rina', 2 * 24 * 60 + 126, 'Laut Bercerita, Leila S. Chudori. Bagus banget, siap-siap nangis.'],
      ['me', 2 * 24 * 60 + 120, 'Oke, nanti kucari di toko buku. Makasih ya!'],
      ['u_rina', 95, 'Eh, jadi ke toko buku hari ini nggak?'],
      ['me', 90, 'Jadi dong, habis maghrib aja gimana?'],
      ['u_rina', 88, 'Siap, aku jemput ya'],
      ['u_rina', 12, 'Aku udah di depan kosmu nih'],
      ['u_rina', 11, 'Jangan lama-lama ya, parkirnya sempit'],
    ],
  },
  {
    contact: 'u_budi',
    lines: [
      ['u_budi', 300, 'Bro, nasi goreng depan gang masih buka nggak ya?'],
      ['me', 295, 'Biasanya sampai jam 11 malam sih'],
      ['u_budi', 294, 'Mantap, aku meluncur'],
      ['me', 290, 'Titip satu dong, pedas level 2'],
      ['u_budi', 289, 'Gas, nanti kuantar ke kamar'],
      ['me', 40, 'Bud, makasih nasi gorengnya tadi. Besok giliran aku traktir.'],
    ],
  },
  {
    contact: 'u_siti',
    lastUnreadByContact: true,
    lines: [
      ['u_siti', 3 * 24 * 60, 'Kak, desain poster kemarin sudah kukirim lewat email ya'],
      ['me', 3 * 24 * 60 - 20, 'Udah masuk, keren banget warnanya!'],
      ['u_siti', 3 * 24 * 60 - 25, 'Syukurlah kalau cocok. Kalau ada revisi kabari aja.'],
      ['me', 200, 'Sit, ada revisi kecil: logonya digeser sedikit ke kiri bisa?'],
    ],
  },
  {
    contact: 'u_agus',
    unread: 1,
    lines: [
      ['me', 1000, 'Gus, Jumat ini jadi futsal?'],
      ['u_agus', 990, 'Jadi dong. Lapangan sudah kupesan jam 8 malam.'],
      ['me', 985, 'Oke, aku bawa bola sendiri'],
      ['u_agus', 25, 'Jangan lupa transfer patungan lapangan ya, 30 ribu per orang'],
    ],
  },
  {
    contact: 'u_dewi',
    lines: [
      ['u_dewi', 5 * 24 * 60, 'Aku bikin brownies kukus, mau cobain?'],
      ['me', 5 * 24 * 60 - 10, 'Mau banget! Kapan bisa diambil?'],
      ['u_dewi', 5 * 24 * 60 - 12, 'Besok siang aku antar ke kantormu ya'],
      ['me', 4 * 24 * 60 + 600, 'Browniesnya enak parah, serius. Bikin lagi dong!'],
      ['u_dewi', 4 * 24 * 60 + 590, 'Hehe, siap. Resepnya gampang kok, nanti kukirim.'],
    ],
  },
  {
    contact: 'u_fajar',
    unread: 3,
    lines: [
      ['me', 700, 'Jar, bug di halaman login udah kamu cek?'],
      ['u_fajar', 650, 'Udah, ternyata salah validasi email. Aku fix sekarang.'],
      ['me', 640, 'Mantap, kabari kalau sudah di-merge'],
      ['u_fajar', 60, 'Sudah merge ya, tolong kamu review juga'],
      ['u_fajar', 58, 'Kalau ada komentar, tulis di PR aja'],
      ['u_fajar', 20, 'Btw besok standup jam 9 ya, jangan telat'],
    ],
  },
  {
    contact: 'u_putri',
    lines: [
      ['u_putri', 2 * 24 * 60 + 30, 'Bab 3 skripsiku akhirnya kelar!'],
      ['me', 2 * 24 * 60 + 25, 'Selamat Put! Tinggal bab 4 dan 5 ya, semangat'],
      ['u_putri', 2 * 24 * 60 + 22, 'Doain dosen pembimbingnya nggak sibuk terus 😅'],
      ['me', 2 * 24 * 60 + 20, 'Aamiin. Kalau butuh teman revisi, kabari aja.'],
    ],
  },
  {
    contact: 'u_rizky',
    lines: [
      ['u_rizky', 180, 'Foto-foto acara kemarin sudah aku edit semua'],
      ['me', 170, 'Wah cepat banget. Boleh lihat?'],
      ['u_rizky', 165, 'Nanti kukirim lewat drive, ukurannya gede soalnya'],
      ['me', 160, 'Oke, tunggu ya. Hasil yang close-up pasti bagus.'],
    ],
  },
]

interface GroupSeed {
  id: string
  name: string
  admin: string
  members: string[]
  unread: number
  lines: Line[]
}

const GROUPS: GroupSeed[] = [
  {
    id: 'g_keluarga',
    name: 'Keluarga Besar',
    admin: 'u_hendra',
    members: ['u_hendra', 'u_dewi', 'u_maya', 'u_budi'],
    unread: 2,
    lines: [
      ['u_hendra', 4 * 24 * 60, 'Assalamualaikum, minggu depan kumpul di rumah nenek ya'],
      ['u_dewi', 4 * 24 * 60 - 5, 'Waalaikumsalam, aku bawa kue'],
      ['me', 4 * 24 * 60 - 12, 'Siap, aku ikut. Ada yang perlu dibawakan lagi?'],
      ['u_maya', 4 * 24 * 60 - 30, 'Aku bawa buah aja deh'],
      ['u_hendra', 4 * 24 * 60 - 40, 'Mantap. Berkumpul jam 10 pagi, jangan telat.'],
      ['u_budi', 360, 'Ada yang mau nebeng dari terminal?'],
      ['u_maya', 340, 'Aku mau Bud, kabari jamnya ya'],
      ['u_hendra', 35, 'Jangan lupa bawa baju ganti, kita nginap semalam'],
      ['u_dewi', 30, 'Oke Mas, nanti aku siapkan'],
    ],
  },
  {
    id: 'g_futsal',
    name: 'Futsal Jumat',
    admin: 'u_agus',
    members: ['u_agus', 'u_yoga', 'u_rizky', 'u_fajar', 'u_budi'],
    unread: 0,
    lines: [
      ['u_agus', 1500, 'Lapangan jam 8 malam, konfirmasi siapa saja yang ikut'],
      ['u_yoga', 1495, 'Ikut!'],
      ['u_rizky', 1490, 'Ikut, tapi mungkin telat 15 menit'],
      ['me', 1485, 'Ikut juga. Rompi merah siapa yang bawa?'],
      ['u_budi', 1480, 'Aku bawa rompi dan bola cadangan'],
      ['u_fajar', 1470, 'Aku skip dulu minggu ini, lembur'],
      ['u_agus', 1465, 'Oke, berarti kita berlima. Cukup untuk 2 lawan 2 plus kiper.'],
    ],
  },
  {
    id: 'g_desain',
    name: 'Tim Proyek Desain',
    admin: 'me',
    members: ['u_siti', 'u_nadia', 'u_fajar', 'u_putri'],
    unread: 4,
    lines: [
      ['me', 2 * 24 * 60, 'Teman-teman, deadline presentasi klien hari Rabu ya'],
      ['u_siti', 2 * 24 * 60 - 10, 'Mockup halaman utama sudah 80 persen'],
      ['u_nadia', 2 * 24 * 60 - 15, 'Aku bagian ilustrasi, kirim besok pagi'],
      ['u_fajar', 2 * 24 * 60 - 18, 'Prototype klikable bisa kuselesaikan lusa'],
      ['me', 2 * 24 * 60 - 25, 'Bagus, nanti kita review bareng Selasa sore'],
      ['u_siti', 150, 'Warna aksen yang baru kayaknya lebih hangat, setuju?'],
      ['u_nadia', 140, 'Setuju, lebih enak dilihat'],
      ['u_fajar', 120, 'Kontrasnya sudah kucek, lolos standar aksesibilitas'],
      ['u_putri', 100, 'Aku bagian copywriting, draf teks kukirim sore ini'],
    ],
  },
]

export interface SeedState {
  users: Record<string, User>
  conversations: Record<string, Conversation>
  members: Member[]
  messages: Record<string, Message[]>
  presence: Record<string, boolean>
}

export function buildSeed(now: number): SeedState {
  const users: Record<string, User> = {}
  const presence: Record<string, boolean> = {}
  for (const c of CONTACTS) {
    users[c.id] = {
      id: c.id,
      displayName: c.name,
      email: c.email,
      bio: c.bio,
      lastSeenAt: now - c.lastSeenMinAgo * MIN,
    }
    presence[c.id] = c.online
  }

  const conversations: Record<string, Conversation> = {}
  const members: Member[] = []
  const messages: Record<string, Message[]> = {}

  const addConversation = (
    conv: Omit<Conversation, 'lastMessageAt'>,
    participants: { userId: string; role: 'admin' | 'member' }[],
    lines: Line[],
    unread: number,
    lastUnreadByContact: boolean,
  ) => {
    const list: Message[] = lines
      .map(([from, minAgo, body], i): Message => ({
        id: `${conv.id}_m${i}`,
        conversationId: conv.id,
        senderId: from === 'me' ? ME_ID : from,
        body,
        createdAt: now - minAgo * MIN,
        status: 'sent',
      }))
      .sort((a, b) => a.createdAt - b.createdAt)
    messages[conv.id] = list
    const last = list[list.length - 1]
    conversations[conv.id] = { ...conv, lastMessageAt: last.createdAt }

    const incoming = list.filter((m) => m.senderId !== ME_ID)
    const myReadAt =
      unread > 0 && incoming.length >= unread
        ? incoming[incoming.length - unread].createdAt - 1
        : last.createdAt
    const lastMine = [...list].reverse().find((m) => m.senderId === ME_ID)

    for (const p of participants) {
      let lastReadAt = last.createdAt
      if (p.userId === ME_ID) lastReadAt = myReadAt
      else if (lastUnreadByContact && lastMine) lastReadAt = lastMine.createdAt - 1
      members.push({ conversationId: conv.id, userId: p.userId, role: p.role, lastReadAt })
    }
  }

  for (const dm of DMS) {
    addConversation(
      { id: `c_${dm.contact}`, type: 'direct', createdBy: ME_ID },
      [
        { userId: ME_ID, role: 'member' },
        { userId: dm.contact, role: 'member' },
      ],
      dm.lines,
      dm.unread ?? 0,
      dm.lastUnreadByContact ?? false,
    )
  }

  for (const g of GROUPS) {
    const adminId = g.admin === 'me' ? ME_ID : g.admin
    const participants = [
      { userId: ME_ID, role: adminId === ME_ID ? ('admin' as const) : ('member' as const) },
      ...g.members.map((id) => ({ userId: id, role: id === adminId ? ('admin' as const) : ('member' as const) })),
    ]
    addConversation(
      { id: g.id, type: 'group', name: g.name, createdBy: adminId },
      participants,
      g.lines,
      g.unread,
      false,
    )
  }

  return { users, conversations, members, messages, presence }
}

export { DAY, HOUR, MIN }
