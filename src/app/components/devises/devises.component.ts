import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Datedevise } from "src/app/models/datedevise.model";
import { Devise } from "src/app/models/devise.model";
import { MatTableDataSource } from "@angular/material/table";
import { TokenStorageService } from "src/app/services/token-storage.service";
import Swal from "sweetalert2";
import { MatPaginator } from "@angular/material/paginator";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { DeviseService } from "src/app/services/devise.service";
import { DatedeviseService } from "src/app/services/datedevise.service";
import { LigneDevise } from "src/app/models/ligne-devise.model";
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr, 'fr');

@Component({
  selector: "app-devises",
  templateUrl: "./devises.component.html",
  styleUrls: ["./devises.component.scss"],
})
export class DevisesComponent implements OnInit {
  searchTerm: any;
  search: boolean = false;
  displayedColumns: string[] = ["nom", "devise", "valeur", "date", "actions"];
  dataSource = new MatTableDataSource<LigneDevise>();

  updateDeviseForm: FormGroup = new FormGroup({
    valeur: new FormControl(""),
    date: new FormControl(""),
    nom: new FormControl(""),
    devise: new FormControl(""),
  });

  currentDevise: Devise = {
    nom: "",
    devise: "",
  };
  currentDateDevise: Datedevise = {
    id: undefined,
    date: new Date(),
    valeur: undefined,
  };
  currentLigneDevise: LigneDevise = {
    nom: "",
    devise: "",
    dates: {
      id: undefined,
      date: new Date(),
      valeur: undefined,
    },
  };
  message = "";
  devises?: LigneDevise[];
  currentIndex = -1;
  disabelModif: boolean = false;
  private roles: string[] = [];
  isLoggedIn = false;
  showObserverBoard = true;
  paginator?: MatPaginator;
  submitted = false;

  constructor(
    private deviseService: DeviseService,
    private dateDeviseService: DatedeviseService,
    private tokenStorageService: TokenStorageService,
    private formBuilder: FormBuilder
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
    this.fetchDevises();
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roles = user.role;
      this.showObserverBoard = this.roles.includes("Observateur");
    }

    this.updateDeviseForm = this.formBuilder.group({
      date: ["", Validators.required],
      valeur: ["", Validators.required],
      nom: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]+$/)],
      ],
      devise: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]+$/)],
      ],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.updateDeviseForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.updateDeviseForm.invalid) {
      return;
    }
  }

  fetchDevises(): void {
    this.deviseService.getAll().subscribe({
      next: (data) => {
        this.devises = data;
        this.dataSource.data = this.devises;
        console.log(data);
      },
      error: (e) => {
        console.error(e);
        Swal.fire({
          title: "Echec d'affichage des devises !",
          text: "Une erreur est survenue lors du chargement de la liste des devises.",
          icon: "warning",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      }
    });
  }

  refreshList(): void {
    this.fetchDevises();
    this.currentLigneDevise = {};
    this.currentIndex = -1;
  }

  setActiveDevise(devise: LigneDevise, index: number): void {
    this.currentLigneDevise = devise;
    this.updateDeviseForm.setValue({
      date: devise.dates?.date,
      valeur: devise.dates?.valeur,
      nom: devise.nom,
      devise: devise.devise,
    });
    console.log(devise);
    this.currentIndex = index;
    this.disabelModif = true;
  }

  removeAllDevises(): void {
    this.dateDeviseService.deleteAll().subscribe({
      next: (res) => {
        console.log(res);
        this.deviseService.deleteAll().subscribe({
          next: (res) => {
            console.log(res);
            Swal.fire({
              title: "Êtes-vous sûr de tout supprimer ? ",
              text: "Vous ne serez pas capable de restaurer !",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#00c292",
              cancelButtonColor: "#e46a76",
              confirmButtonText: "Oui",
              cancelButtonText: "Annuler",
            }).then((result) => {
              if (result.isConfirmed) {
                this.refreshList();
              }
            });
          },
          error: (e) => {
            console.error(e);
            Swal.fire({
              title: "Echec de supression !",
              text: "Une erreur est survenue lors de la supression des devises.",
              icon: "warning",
              confirmButtonColor: "#00c292",
              confirmButtonText: "Ok",
            });
          },
        });
      },
    });
  }

  deleteDevise(dateDevise: Datedevise): void {
    console.log(this.currentDateDevise.id);
    this.deviseService.delete(this.currentLigneDevise.nom).subscribe({
      next: (res) => {
        console.log(res);
    this.dateDeviseService.delete(this.currentLigneDevise.dates?.id).subscribe({
      next: (res) => {
        console.log(res);
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
            this.refreshList();
          }
        });
      },
      error: (e) => {
        console.error(e);
        Swal.fire({
          title: "Echec de supression !",
          text: "Une erreur est survenue lors de la supression de la devise.",
          icon: "warning",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      },
    });
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
