export class Facture {
  id?: any;
  reference?: string;
  vendeur?: string;
  date_facturation?: Date;
  date_echeance?: Date;
  etat_facture?: string;
  etat_echeance?: boolean;
  total_ht?: number;
  total_chiffres?: number;
  total_lettres?: string;
  total_devise?: number;
}
