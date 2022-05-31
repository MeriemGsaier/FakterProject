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

@Component({
  selector: "app-devises",
  templateUrl: "./devises.component.html",
  styleUrls: ["./devises.component.scss"], 
})

export class DevisesComponent implements OnInit {
  searchTerm: any;
  search: boolean = false;
  displayedColumns: string[] = ["nom", "devise", "valeur", "date", "actions"];
  dataSource = new MatTableDataSource<Devise>();
  updateDeviseForm: FormGroup = new FormGroup({
    nom: new FormControl(""),
    devise: new FormControl(""),
    valeur: new FormControl(""),
    date: new FormControl(""),
  });
  currentDevise: Devise = {
    nom: "",
    devise: "",
  };
  currentDateDevise: Datedevise = {
    date: new Date(),
    valeur: undefined,
  };
  message = "";
  devises?: Devise[];
  currentIndex = -1;
  disabelModif: boolean = false;
  private roles: string[] = [];
  isLoggedIn = false;
  showObserverBoard = true;
  paginator?: MatPaginator;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
      nom: [
        "",
        [Validators.required, Validators.pattern(/^[A-Z0-9!@#$%^&*()]+$/)],
      ],
      devise: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/)],
      ],
      date: ["", Validators.required],
      valeur: ["", Validators.required],
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
      error: (e) => console.error(e),
    });
  }

  refreshList(): void {
    this.fetchDevises();
    this.currentDevise = {};
    this.currentIndex = -1;
  }

  setActiveDevise(devise: Devise, index: number): void {
    this.currentDevise = devise;
    console.log(devise);
    this.currentIndex = index;
    this.disabelModif = true;
  }

  removeAllDevises(): void {
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
      error: (e) => console.error(e),
    });
  }

  updateDevise(): void {
    this.message = "";
    if (!this.updateDeviseForm.invalid) {
      this.dateDeviseService
        .update(this.currentDateDevise.id, this.currentDateDevise)
        .subscribe({
          next: (res) => {
            console.log(res);
            this.deviseService
              .update(this.currentDevise.nom, this.currentDevise)
              .subscribe({
                next: (res) => {
                  console.log(res);
                  this.disabelModif = false;
                  this.message = res.message
                    ? res.message
                    : "This devise was updated successfully!";
                  Swal.fire({
                    title: "Modification effectuée avec succés !",
                    icon: "success",
                    confirmButtonColor: "#00c292",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      this.fetchDevises();
                    }
                  });
                },
              });
          },
          error: (e) => console.error(e),
        });
    }
  }

  deleteDevise(devise: Devise): void {
    this.dateDeviseService
      .delete(this.currentDateDevise.id)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.deviseService.delete(devise.nom).subscribe({
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
            error: (e) => console.error(e),
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