import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CommentItem {
  postId?: number;
  id?: number;
  name: string;
  email?: string;
  body: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/comments';

  constructor(private http: HttpClient) {}

  getComments(): Observable<CommentItem[]> {
    return this.http.get<CommentItem[]>(this.baseUrl);
  }

  createComment(comment: Pick<CommentItem, 'name' | 'email' | 'body'>): Observable<CommentItem> {
    return this.http.post<CommentItem>(this.baseUrl, comment);
  }

  updateComment(id: number, comment: Pick<CommentItem, 'name' | 'email' | 'body'>): Observable<CommentItem> {
    return this.http.put<CommentItem>(`${this.baseUrl}/${id}`, comment);
  }
}
