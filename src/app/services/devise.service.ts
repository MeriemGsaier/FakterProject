import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devise } from '../models/devise.model';
const baseUrl = 'http://localhost:8080/api/devises';
const createUrl= 'http://localhost:8080/api/devises/create'

@Injectable({
  providedIn: 'root'
})
export class DeviseService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Devise[]> {
    return this.http.get<Devise[]>(baseUrl);
  }
  create(data: any): Observable<any> {
    return this.http.post(createUrl, data);
  }
  update(nom: any, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${nom}`, data);
  }
  delete(nom: any): Observable<any> {
    return this.http.delete(`${baseUrl}/${nom}`);
  }
  deleteAll(): Observable<any> {
    return this.http.delete(baseUrl);
  }
}