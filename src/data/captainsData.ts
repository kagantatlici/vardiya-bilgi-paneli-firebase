export interface Captain {
  id: number;
  sicilNo: string;
  isim: string;
  aisMobNo: string;
  aktifEhliyetler: string[];
  tumEhliyetler: {
    istanbul: boolean;
    canakkale: boolean;
    hpasa: boolean;
    kepez: boolean;
    izmir: boolean;
    mersin: boolean;
    zonguldak: boolean;
  };
  melbusat: {
    pantolon: string;
    gomlek: string;
    tshirt: string;
    yelek: string;
    polar: string;
    mont: string;
    ayakkabi: string;
  };
  durum: "Aktif" | "Pasif";
}

export const realCaptainsData: Captain[] = [
  {
    id: 1, sicilNo: "51793", isim: "Harun DOKUZ (BK)", aisMobNo: "972410883",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 2, sicilNo: "51043", isim: "Osman ORHAL (BKV)", aisMobNo: "972410768",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 3, sicilNo: "51739", isim: "Kıvanç ERGÖNÜL", aisMobNo: "972410763",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 4, sicilNo: "51806", isim: "Yavuz ENGİNER", aisMobNo: "972410780",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 5, sicilNo: "50886", isim: "Tamer AZGIN", aisMobNo: "972410778",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 6, sicilNo: "50974", isim: "Berker İRİCİOĞLU", aisMobNo: "972410776",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 7, sicilNo: "52216", isim: "Selim KANDEMİRLİ", aisMobNo: "972410769",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 8, sicilNo: "52820", isim: "Sami ASLAN", aisMobNo: "972410765",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 9, sicilNo: "52361", isim: "Cihan BASA", aisMobNo: "972410757",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 10, sicilNo: "52818", isim: "Ahmet DURAK", aisMobNo: "972410753",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 11, sicilNo: "52953", isim: "Turgut KAYA", aisMobNo: "972410779",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 12, sicilNo: "52806", isim: "Alphan TÜRKANIK", aisMobNo: "972410820",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 13, sicilNo: "52958", isim: "Selahattin KUT", aisMobNo: "972410700",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 14, sicilNo: "53675", isim: "Kağan TATLICI", aisMobNo: "972410786",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 15, sicilNo: "53196", isim: "Serhat YALÇIN", aisMobNo: "972410847",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 16, sicilNo: "52187", isim: "Uğraş AKYOL", aisMobNo: "972410741",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 17, sicilNo: "52942", isim: "Taylan GÜLER", aisMobNo: "972410864",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 18, sicilNo: "53677", isim: "Aytaç BAHADIR", aisMobNo: "",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 19, sicilNo: "53759", isim: "M.Kemal ONUR", aisMobNo: "972410689",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 20, sicilNo: "53752", isim: "Dilek ALTAY", aisMobNo: "972410706",
    aktifEhliyetler: ["İst"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 21, sicilNo: "53857", isim: "Gökmen ALTUNDOĞAN", aisMobNo: "972410903",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 22, sicilNo: "53891", isim: "Mustafa TÜRKOĞLU", aisMobNo: "",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 23, sicilNo: "50978", isim: "Rahmi Alpaslan SOYUER", aisMobNo: "",
    aktifEhliyetler: ["İst", "Çkl"], durum: "Aktif",
    tumEhliyetler: { istanbul: true, canakkale: true, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 24, sicilNo: "", isim: "", aisMobNo: "",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 25, sicilNo: "", isim: "", aisMobNo: "",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 26, sicilNo: "", isim: "", aisMobNo: "",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 27, sicilNo: "", isim: "", aisMobNo: "",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  },
  {
    id: 28, sicilNo: "", isim: "", aisMobNo: "",
    aktifEhliyetler: [], durum: "Pasif",
    tumEhliyetler: { istanbul: false, canakkale: false, hpasa: false, kepez: false, izmir: false, mersin: false, zonguldak: false },
    melbusat: { pantolon: "", gomlek: "", tshirt: "", yelek: "", polar: "", mont: "", ayakkabi: "" }
  }
];