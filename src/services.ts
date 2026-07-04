import { Service } from './types';

export const services: Service[] = [
  {
    id: 'attestation',
    prefix: 'A',
    nameTu: 'Tasdik İşlemleri',
    nameEn: 'Attestation Procedures',
    assignedCounter: 1,
    iconName: 'FileCheck'
  },
  {
    id: 'citizenship',
    prefix: 'CT',
    nameTu: 'Vatandaşlık İşlemleri',
    nameEn: 'Citizenship Procedures',
    assignedCounter: 2,
    iconName: 'UserCheck'
  },
  {
    id: 'notice',
    prefix: 'N',
    nameTu: 'Tebligat İşlemleri',
    nameEn: 'Service of Notice Procedures',
    assignedCounter: 3,
    iconName: 'Mail'
  },
  {
    id: 'marriage',
    prefix: 'M',
    nameTu: 'Evlilik Kayıt İşlemleri',
    nameEn: 'Marriage Registration Procedures',
    assignedCounter: 4,
    iconName: 'Heart'
  },
  {
    id: 'birth',
    prefix: 'B',
    nameTu: 'Doğum Kayıt Belgesi',
    nameEn: 'Birth Registration Certificate Procedures',
    assignedCounter: 5,
    iconName: 'Baby'
  },
  {
    id: 'passport',
    prefix: 'P',
    nameTu: 'Pasaport İşlemleri',
    nameEn: 'Passport Services',
    assignedCounter: 6,
    iconName: 'BookOpen'
  },
  {
    id: 'id',
    prefix: 'ID',
    nameTu: 'Kimlik İşlemleri',
    nameEn: 'ID Procedures',
    assignedCounter: 7,
    iconName: 'Contact'
  },
  {
    id: 'notary',
    prefix: 'NT',
    nameTu: 'Noter İşlemleri',
    nameEn: 'Notary Procedures',
    assignedCounter: 8,
    iconName: 'FileText'
  },
  {
    id: 'cashier',
    prefix: 'C',
    nameTu: 'Vezne',
    nameEn: 'Cashier',
    assignedCounter: 9,
    iconName: 'Coins'
  }
];
