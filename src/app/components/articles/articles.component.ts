import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Article } from "src/app/models/article.model";
import { ArticleService } from "src/app/services/article.service";
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
import * as XLSX from "xlsx";

interface type {
  value: string;
  viewValue: string;
}
interface taxe {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-articles",
  templateUrl: "./articles.component.html",
  styleUrls: ["./articles.component.scss"],
})
export class ArticlesComponent implements OnInit {
  fileName = "ArticlesSheet.xlsx";
  searchTerm: any;
  search: boolean = false;
  displayedColumns: string[] = [
    "nom",
    "type_article",
    "prix",
    "taxe",
    "cout",
    "description",
    "actions",
  ];
  dataSource = new MatTableDataSource<Article>();
  updateArticleForm: FormGroup = new FormGroup({
    nom_article: new FormControl(""),
    type_article: new FormControl(""),
    prix_vente: new FormControl(""),
    taxe_vente: new FormControl(""),
    cout: new FormControl(""),
    description: new FormControl(""),
  });
  currentArticle: Article = {
    nom_article: "",
    type_article: "",
    prix_vente: undefined,
    taxe_vente: undefined,
    cout: undefined,
    description: "",
  };
  message = "";
  articles?: Article[];
  currentIndex = -1;
  disabelModif: boolean = false;
  private roles: string[] = [];
  isLoggedIn = false;
  showObserverBoard = true;
  paginator?: MatPaginator;
  submitted = false;

  types: type[] = [
    { value: "Service", viewValue: "Service" },
    { value: "Consommable", viewValue: "Consommable" },
  ];
  taxes: taxe[] = [
    { value: "Service", viewValue: "Service" },
    { value: "Consommable", viewValue: "Consommable" },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
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
    this.fetchArticles();
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roles = user.role;
      this.showObserverBoard = this.roles.includes("Observateur");
    }

    this.updateArticleForm = this.formBuilder.group({
      nom_article: [
        "",
        [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")],
      ],
      type_article: ["", Validators.required],
      prix_vente: ["", Validators.required],
      taxe_vente: ["", Validators.required],
      cout: ["", Validators.required],
      description: [
        "",
        [Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z0-9 ]+")],
      ],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.updateArticleForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.updateArticleForm.invalid) {
      return;
    }
  }

  fetchArticles(): void {
    this.articleService.getAll().subscribe({
      next: (data) => {
        this.articles = data;
        this.dataSource.data = this.articles;
        console.log(data);
      },
      error: (e) => {
        console.error(e);
        Swal.fire({
          title: "Echec d'affichage des articles !",
          text: "Une erreur est survenue lors du chargement de la liste des articles.",
          icon: "warning",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      }
    });
  }

  refreshList(): void {
    this.fetchArticles();
    this.currentArticle = {};
    this.currentIndex = -1;
  }

  setActiveArticle(article: Article, index: number): void {
    this.currentArticle = article;
    console.log(article);
    this.currentIndex = index;
    this.disabelModif = true;
  }

  removeAllArticles(): void {
    this.articleService.deleteAll().subscribe({
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
          text: "Une erreur est survenue lors de la supression des articles.",
          icon: "warning",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      },
    });
  }

  updateArticle(): void {
    this.message = "";
    if (!this.updateArticleForm.invalid) {
      this.articleService
        .update(this.currentArticle.id, this.currentArticle)
        .subscribe({
          next: (res) => {
            console.log(res);
            this.disabelModif = false;
            Swal.fire({
              title: "Modification effectuée avec succés !",
              icon: "success",
              confirmButtonColor: "#00c292",
            }).then((result) => {
              if (result.isConfirmed) {
                this.fetchArticles();
              }
            });
            this.message = res.message
              ? res.message
              : "This article was updated successfully!";
          },
          error: (e) => console.error(e),
        });
    }
  }

  deleteArticle(article: Article): void {
    this.articleService.delete(article.id).subscribe({
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
          text: "Une erreur est survenue lors de la supression de l'article.",
          icon: "warning",
          confirmButtonColor: "#00c292",
          confirmButtonText: "Ok",
        });
      },
    });
  }

  filterData($event: any) {
    $event.target.value.trim();
    $event.target.value.toLowerCase();
    this.dataSource.filter = $event.target.value;
  }

  exportexcel(): void {
    /* pass here the table id */
    let element = document.getElementById("excel-table");
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }
  annuler(): void {
    this.disabelModif = false;
  }
}
