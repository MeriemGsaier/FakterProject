import { Component, OnInit, Inject, Optional } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Article } from "src/app/models/article.model";
import { LignePrix } from "src/app/models/ligne-prix.model";
import { ArticleService } from "src/app/services/article.service";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { ArticleslignefactStoreService } from "src/app/store/articleslignefact-store.service";
import Swal from "sweetalert2";
import { LogIn } from "angular-feather/icons";
interface Element {
  nom_article?: string;
  prix: number;
  quantite: number;
  taxe: 0.19,
  sous_totalttc: number;
  soustotal_ht: number;
}
@Component({
  selector: "app-dialog-box",
  templateUrl: "./dialog-box.component.html",
  styleUrls: ["./dialog-box.component.scss"],
})
export class DialogBoxComponent implements OnInit {
  currentPrixArticle: LignePrix = {
    nom_article: "",
    type_article: "",
    description: "",
    prix: [
      {
        id: undefined,
        prix: undefined,
        date: new Date(),
      },
    ],
  };
  ligneArticleForm: FormGroup = new FormGroup({
    prix: new FormControl(""),
  });

  qteArticleForm: FormGroup = new FormGroup({
    quantite: new FormControl(""),
  });
  trouve = false;

  currentIndex = -1;
  disabelModif: boolean = false;
  submitted = false;

  articles = [
    {
      nom_article: "",
      archive: false,
      prix: [{}],
    },
  ];

  selected = [
    {
      prix: undefined,
    },
  ];
  selectedArticle = this.selected;
  articlesLigneFact: Array<Element> = [];

  constructor(
    private articleService: ArticleService,
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    private formBuilder: FormBuilder,
    private articlesLigneFactStore: ArticleslignefactStoreService
  ) {}

  getArticles() {
    this.articleService.getAllPrix().subscribe({
      next: (data) => {
        this.articles = data.map((data: any) => {
          return {
            nom_article: data.nom_article,
            archive: data.archive,
            prix: data.prix[0].prix,
          };
        }).filter(elm => elm.archive == false );
        // console.log(this.articles);
      },
    });
  }

  setActiveArticle(ligneArticle: LignePrix, index: number): void {
    this.currentPrixArticle = ligneArticle;
    this.ligneArticleForm.setValue({
      prix: ligneArticle.prix,
    });
    console.log("!!!!", ligneArticle);
    this.currentIndex = index;
    this.disabelModif = true;
  }

  closeDialog(result?: any) {
    if (result) {
      if (this.ligneArticleForm.valid && this.qteArticleForm.valid) {
        this.dialogRef.close(result);
      }
    } else this.dialogRef.close();
  }

  ngOnInit(): void {
    this.getArticles();
    this.ligneArticleForm = this.formBuilder.group({
      prix: ["", Validators.required],
    });
    this.qteArticleForm = this.formBuilder.group({
      quantite: ["", Validators.required],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.ligneArticleForm.controls;
  }
  get fQte(): { [key: string]: AbstractControl } {
    return this.qteArticleForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.ligneArticleForm.invalid) {
      return;
    }
  }
  onSubmitQte(): void {
    this.submitted = true;
    if (this.qteArticleForm.invalid) {
      return;
    }
  }

  ajouterArticleLigneFact(): void {
    if (this.ligneArticleForm.valid) {
      const articleLigneFact : Element = {
        nom_article: this.currentPrixArticle.nom_article,
        prix: this.ligneArticleForm.get("prix")?.value,
        quantite: this.qteArticleForm.get("quantite")?.value,
        taxe: 0.19,
        sous_totalttc:
          this.ligneArticleForm.get("prix")?.value *
          (0.19+ 1) *
          this.qteArticleForm.get("quantite")?.value,
        soustotal_ht:
          this.ligneArticleForm.get("prix")?.value *
          this.qteArticleForm.get("quantite")?.value,
      };
      for(let i=0; i<this.articlesLigneFact.length;i++){
       
          console.log("jhkj",this.articlesLigneFact[i].nom_article);
          
          this.articles.filter(elem=> elem.nom_article !== this.articlesLigneFact[i].nom_article)
          console.log("fgh",this.articles);
      }
      this.articlesLigneFact.push(articleLigneFact)
    
      // if(this.articlesLigneFact.length == 0){
      //   this.articlesLigneFact.push(articleLigneFact)
      // }
      // else {
      //   for(let i=0;i<this.articlesLigneFact.length;i++){
  
      //     if(this.articlesLigneFact[i].nom_article == articleLigneFact.nom_article){
      //       console.log(this.trouve);
            
      //       this.trouve=true  
      //     }
      //       if(this.trouve==true){
      //         Swal.fire({
      //           title: "Cet article existe déjà  !",
      //           icon: "warning",
      //           confirmButtonColor: "#00c292",
      //         })
      //       }
      //       else {
      //         this.articlesLigneFact.push(articleLigneFact)
              
      //       }
  
      //   }

      // }
  
    }
    this.closeDialog(this.articlesLigneFact);
  }
}
