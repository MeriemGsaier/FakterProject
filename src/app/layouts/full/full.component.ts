import { Component, OnInit } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { Router } from "@angular/router";
import { SocieteService } from "src/app/services/societe.service";

interface sidebarMenu {
  link: string;
  icon: string;
  menu: string;
}

@Component({
  selector: "app-full",
  templateUrl: "./full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent implements OnInit {
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showObserverBoard = false;
  username?: string;
  nom_societe?: string;

  search: boolean = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private breakpointObserver: BreakpointObserver,
    private societeService: SocieteService
  ) {}

  routerActive: string = "activelink";

  sidebarMenu: sidebarMenu[] = [
    {
      link: "/dashboard",
      icon: "dashboard",
      menu: "Dashboard",
    },
    {
      link: "/articles",
      icon: "article",
      menu: "Articles",
    },
    {
      link: "/clients",
      icon: "people",
      menu: "Clients",
      
    },
    {
      link: "/devises",
      icon: "money",
      menu: "Devises",
      
    },
    
  ];

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roles = user.role;
      this.showAdminBoard = this.roles.includes("Super Administrateur");
      this.showObserverBoard = this.roles.includes("Observateur");
      this.username = user.username;
      this.societeService.get(1).subscribe(
        (data: any) => {
          this.nom_societe = data.nom_societe;
          // console.log(data);
        },
        (error: any) => {
          console.log(error);
        });
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/login']);
  }
}
