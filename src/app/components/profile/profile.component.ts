import { Component, OnInit } from "@angular/core";
import { User } from "src/app/models/user.model";
import { GestUserService } from "src/app/services/gest-user.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { Validation } from "src/app/validation/validation";
import { UserService } from "src/app/services/user.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  form1: FormGroup = new FormGroup({
    username: new FormControl(""),
    email: new FormControl(""),
  });
  form2: FormGroup = new FormGroup({
    currentPassword: new FormControl(""),
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
  });
  currentUser: User = {
    username: "",
    email: "",
    role: "",
  };
  user: User = {
    username: "",
    email: "",
    role: "",
  };
  users?: User[];
  message = "";
  disabelModifDetails: boolean = false;
  disabelModifPassword: boolean = false;
  submitted = false;
  currentPassword?: string;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private gestUserService: GestUserService,
    private token: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.token.getUser();

    this.form1 = this.formBuilder.group({
      username: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)],
      ],
      email: ["", [Validators.required, Validators.email]],
    });

    this.form2 = this.formBuilder.group(
      {
        currentPassword: ["", Validators.required],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/),
          ],
        ],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: [Validation.match("password", "confirmPassword")],
      }
    );
  }

  get f1(): { [key: string]: AbstractControl } {
    return this.form1.controls;
  }
  get f2(): { [key: string]: AbstractControl } {
    return this.form2.controls;
  }

  onSubmit1(): void {
    this.submitted = true;

    if (this.form1.invalid) {
      return;
    } else {
      this.message = "";
      this.token.saveUser(this.currentUser);
      this.gestUserService
        .update(this.currentUser.id, this.currentUser)
        .subscribe(
          (response) => {
            console.log(response);
            this.disabelModifDetails = true;
            this.reloadPage();
            this.message = response.message
              ? response.message
              : "Your profile is updated successfully!";
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  onSubmit2(): void {
    // this.submitted = true;

    // if (this.form2.invalid) {
    //   console.log('gggg', this.form2.invalid)
    //   return;
    // }
      console.log('hhhh', this.form2.invalid)
      this.message = "";
      this.checkPassword(this.currentUser.id).subscribe((password) => {
        console.log("1", password.message);
        if (password.message == true) {
          this.getUser(this.currentUser.id).subscribe((user) => {
            let pass: User = {
              password: user.password,
            };
            console.log("eeeeee", pass);
            this.gestUserService.update(this.currentUser.id, pass).subscribe(
              (response) => {
                console.log(response);
                // this.disabelModifDetails = true;
                // this.reloadPage();
                this.message = response.message
                  ? response.message
                  : "Your password is updated successfully!";
              },
              (error) => {
                console.log(error);
              }
            );
          });
        } else console.log("Une erreur a été détéctée");
      });
  }

  editDetails(): void {
    this.disabelModifDetails = true;
  }

  editPassword(): void {
    this.disabelModifPassword = true;
  }

  getUser(id: string): Observable<User> {
    return this.gestUserService.get(id);
  }

  checkPassword(id: string): Observable<any> {
    let password = {
      password: this.currentPassword,
    };
    console.log("rrrr", password);
    return this.gestUserService.checkPw(id, password);
  }

  //   updateUser(): void {
  //     this.message = '';
  //     this.token.saveUser(this.currentUser);
  //     this.gestUserService.update(this.currentUser.id, this.currentUser)
  //       .subscribe(
  //         response => {
  //           console.log(response);
  //           this.disabelModifDetails = true;
  //           this.reloadPage();
  //           this.message = response.message ? response.message : 'Your profile is updated successfully!';
  //         },
  //         error => {
  //           console.log(error);
  //         });
  //   }

  //   updatePassword(): void {
  //     this.message = '';
  //     this.checkPassword(this.currentUser.id).subscribe(password => {
  //       console.log('1', password.message)
  //       if (password.message == true) {
  //     this.getUser(this.currentUser.id).subscribe(user => {
  //       let pass: User = {
  //         password: user.password
  //       };
  //       console.log('eeeeee', pass)
  //       this.gestUserService.update(this.currentUser.id, pass)
  //       .subscribe(
  //         response => {
  //           console.log(response);
  //           // this.disabelModifDetails = true;
  //           // this.reloadPage();
  //           this.message = response.message ? response.message : 'Your password is updated successfully!';
  //         },
  //         error => {
  //           console.log(error);
  //         });
  //       })
  //     }else console.log('Une erreur a été détéctée');
  //   })
  // }

  annulerDetails(): void {
    this.disabelModifDetails = false;
    this.reloadPage();
  }

  annulerPassword(): void {
    this.disabelModifPassword = false;
    this.reloadPage();
  }

  reloadPage(): void {
    window.location.reload();
  }
}
