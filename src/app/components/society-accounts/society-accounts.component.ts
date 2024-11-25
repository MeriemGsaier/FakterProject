import { Component, Injectable, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Bankaccount } from "src/app/models/bankaccount.model";
import { BankaccountService } from "src/app/services/bankaccount.service";
import { MatTableDataSource } from "@angular/material/table";
import Swal from "sweetalert2";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { ValidatorService } from "angular-iban";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { BankaccountDevise } from "src/app/models/bankaccount-devise.model";
import { DeviseService } from "src/app/services/devise.service";
import { Subject } from "rxjs";
import { FactureService } from "src/app/services/facture.service";

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = $localize`Première page`;
  itemsPerPageLabel = $localize`Items par page:`;
  lastPageLabel = $localize`Dernière page`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = "Page suivante";
  previousPageLabel = "Page précédente";

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return $localize`Page 1 de 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return $localize`Page ${page + 1} de ${amountPages}`;
  }
}

@Component({
  selector: "app-society-accounts",
  templateUrl: "./society-accounts.component.html",
  styleUrls: ["./society-accounts.component.scss"],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
})
export class SocietyAccountsComponent implements OnInit {
  displayedColumns: string[] = [
    "numcompte",
    "rib",
    "nombanque",
    "bic",
    "iban",
    "nomdevise",
    "actions",
  ];

  dataSource = new MatTableDataSource<BankaccountDevise>();

  currentBankAccount: BankaccountDevise = {
    num_compte: undefined,
    rib: undefined,
    bic: "",
    iban: "",
    archive: false,
    nom_banque: "",
    nom_devise: "",
  };

  bankAccForm: FormGroup = new FormGroup({
    rib: new FormControl(""),
    bic: new FormControl(""),
    iban: new FormControl(""),
    nomBanque: new FormControl(""),
    numCompte : new FormControl("")
  });

  submitted = false;
  errorUpdateAccount = false;
  errorMsg = "";

  disabelModif: boolean = false;
  message = "";
  bankaccounts?: BankaccountDevise[];
  currentIndex = -1;
  search: boolean = false;
  private roles: string[] = [];
  isLoggedIn = false;
  showObserverBoard = true;
  paginator?: MatPaginator;

  devises = [
    {
      nom: "",
      devise: "",
    },
  ];

  getDevises() {
    this.deviseService.getAllDevises().subscribe({
      next: (data) => {
        // console.log(data);
        this.devises = data.map((data: any) => {
          return {
            nom: data.nom,
            devise: data.devise,
          };
        });
        // console.log(this.devises);
      },
    });
  }

  constructor(
    private BankaccountService: BankaccountService,
    private factureService: FactureService,
    private formBuilder: FormBuilder,
    private tokenStorageService: TokenStorageService,
    private deviseService: DeviseService,
  ) {}

  @ViewChild(MatPaginator, { static: false }) set matPaginator(
    paginator: MatPaginator
  ) {
    this.paginator = paginator;

    if (this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  ngOnInit(): void {
    this.getDevises();
    this.fetchBankAccounts();
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roles = user.role;
      this.showObserverBoard = this.roles.includes("Observateur");
    }
    this.bankAccForm = this.formBuilder.group({
      rib: ["", [Validators.required, Validators.pattern("^[a-zA-Z0-9]+$")]],
      bic: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9]+$"),
          Validators.minLength(8),
          Validators.maxLength(11),
        ],
      ],
      iban: [Validators.required, ValidatorService.validateIban],
      nomBanque: [
        "",
        [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")],
      ],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.bankAccForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.bankAccForm.invalid) {
      return;
    }
  }
  onReset(): void {
    this.submitted = false;
    this.bankAccForm.reset();
  }

  fetchBankAccounts(): void {
    this.BankaccountService.getAll().subscribe({
      next: (data) => {
        this.bankaccounts = data;
        this.bankaccounts = data.filter((elm) => elm.archive == false);
        this.dataSource.data = this.bankaccounts;
        // console.log(data);
      },
      error: (e) => {
        console.error(e);
        Swal.fire({
          title: "Echec d'affichage des comptes bancaires !",
          text: "Une erreur est survenue lors du chargement de la liste des comptes bancaires.",
          icon: "warning",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      },
    });
  }
  refreshList(): void {
    this.fetchBankAccounts();
    this.currentBankAccount = {};
    this.currentIndex = -1;
  }
  setActiveBankAccount(bankaccount: BankaccountDevise, index: number): void {
    this.currentBankAccount = bankaccount;
    this.currentIndex = index;
    this.disabelModif = true;
  }

  archiveBankAccount(body: Bankaccount) {
    body.archive = true;
    this.BankaccountService.update(body.num_compte, body).subscribe({
      next: (res) => {
        // console.log(res);
        Swal.fire({
          title: "Compte bancaire archivé avec succés !",
          icon: "success",
          confirmButtonColor: "#00c292",
        }).then((result) => {
          if (result.isConfirmed) {
            this.refreshList();
          }
        });
      },
    });
  }

  updateBankAccount(): void {
    this.BankaccountService.update(
      this.currentBankAccount.num_compte,
      this.currentBankAccount
    ).subscribe({
      next: (res) => {
        // console.log(res);
        this.disabelModif = false;
        Swal.fire({
          title: "Le compte bancaire est mis à jour avec succés ! ",
          icon: "success",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      },
      error: (e) => {
        console.error(e);
        this.errorUpdateAccount = true;
        this.errorMsg =
          "Une erreur est survenue lors de la mise à jour du compte bancaire !";
      },
    });
  }

  deleteBankAccount(bankaccount: BankaccountDevise): void {
    this.factureService.getAccount(bankaccount.num_compte).subscribe({
      next: (res: any) => {
        // console.log(res);
        if (res.status == 201) {
          Swal.fire({
            title: "Êtes-vous sûr de le supprimer ? ",
            text: "Vous ne serez pas capable de le récupérer !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#00c292",
            cancelButtonColor: "#e46a76",
            confirmButtonText: "Oui",
            cancelButtonText: "Annuler",
          }).then((result) => {
            if (result.isConfirmed) {
              this.BankaccountService.delete(bankaccount.num_compte).subscribe({
                next: (res) => {
                  // console.log(res);
                  this.message = res.message
                    ? res.message
                    : "This bank account was deleted successfully!";
                  this.refreshList();
                },
                error: (e) => console.error(e),
              });
            }
          });
        } else {
          Swal.fire({
            title: "Echec de supression !",
            text: "Vous ne pouvez pas supprimer ce compte bancaire car il appartient à une facture existante. Vous pouvez opter pour l'archivage !",
            icon: "warning",
            confirmButtonColor: "#00c292",
            confirmButtonText: "Ok",
          });
        }
      },
    });
  }

  filterData($event: any) {
    $event.target.value.trim();
    $event.target.value.toLowerCase();
    this.dataSource.filter = $event.target.value;
  }

  annuler(): void {
    this.disabelModif = false;
  }
}
