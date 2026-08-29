export interface AdminProfile {
  id: string;
  name: string;
  districtId: string; // "all" for kabupaten, or district id like "manyar", "sidayu", etc.
  regionLabel: string;
  email: string;
  role: "Kabupaten" | "Kecamatan" | "Puskesmas";
  initials: string;
  avatarBg: string;
}

export const ADMIN_PROFILES: AdminProfile[] = [
  {
    id: "admin-dinkes",
    name: "Nizam Setiawan",
    districtId: "all",
    regionLabel: "Kabupaten Gresik",
    email: "nizamsetiawan15@gmail.com",
    role: "Kabupaten",
    initials: "NS",
    avatarBg: "#071e49",
  },
  {
    id: "admin-manyar",
    name: "Daffa A. Pratama",
    districtId: "manyar",
    regionLabel: "Kec. Manyar",
    email: "daffa.manyar@gresik.go.id",
    role: "Kecamatan",
    initials: "DA",
    avatarBg: "#1a73e8",
  },
  {
    id: "admin-sidayu",
    name: "Anwar S. Maulana",
    districtId: "sidayu",
    regionLabel: "Kec. Sidayu",
    email: "anwar.sidayu@gresik.go.id",
    role: "Kecamatan",
    initials: "AS",
    avatarBg: "#2bb34d",
  },
  {
    id: "admin-bawean",
    name: "Nurul H. Bawean",
    districtId: "sangkapura",
    regionLabel: "Kec. Sangkapura (Bawean)",
    email: "nurul.bawean@gresik.go.id",
    role: "Kecamatan",
    initials: "NH",
    avatarBg: "#d1b06c",
  },
  {
    id: "admin-kebomas",
    name: "Rizky Firmansyah",
    districtId: "kebomas",
    regionLabel: "Kec. Kebomas",
    email: "rizky.kebomas@gresik.go.id",
    role: "Kecamatan",
    initials: "RF",
    avatarBg: "#f68a22",
  },
  {
    id: "admin-duduksampeyan",
    name: "Siti Rahmawati",
    districtId: "duduksampeyan",
    regionLabel: "Kec. Duduksampeyan",
    email: "siti.duduk@gresik.go.id",
    role: "Kecamatan",
    initials: "SR",
    avatarBg: "#8b5cf6",
  },
  {
    id: "admin-bungah",
    name: "Ahmad Fauzi",
    districtId: "bungah",
    regionLabel: "Kec. Bungah",
    email: "fauzi.bungah@gresik.go.id",
    role: "Kecamatan",
    initials: "AF",
    avatarBg: "#059669",
  },
];
