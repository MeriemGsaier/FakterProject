import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facture } from '../models/facture.model';
const baseUrl = 'http://localhost:8080/api/factures';
const createUrl= 'http://localhost:8080/api/factures/create'

@Injectable({
  providedIn: 'root'
})
export class FactureService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Facture[]> {
    return this.http.get<Facture[]>(baseUrl);
  }
  getAllArticles(): Observable<Facture[]> {
    return this.http.get<Facture[]>(baseUrl + '/articles');
  }
 
  getAllFactDetailed(): Observable<Facture[]> {
    return this.http.get<Facture[]>(baseUrl+'/detailed');
  }
  create(data: any): Observable<any> {
    return this.http.post(createUrl, data);
  }
  sendEmail(data: any): Observable<any> {
    return this.http.post(baseUrl+"/sendemail", data);
  }
  update(id: any, data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }
}
