import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from '../interfaces/post';

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private baseUrl = environment.MasterApi + '/posts';
    constructor(private http: HttpClient) {

    }
    getAllPosts(page: number): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.baseUrl}?page=${page}`);
    }
    addPost(newPostData: any): Observable<any> {
        console.log(`${this.baseUrl}`)
        return this.http.post<any>(`${this.baseUrl}`, newPostData);
    }
    getPostById(id: string): Observable<Post> {
        console.log(`${this.baseUrl}/get/${id}`)
        return this.http.get<Post>(`${this.baseUrl}/get/${id}`);
    }

    updatePost(newData: Post): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/update/`, newData);
    }

    softDeletePost(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/soft-delete/${id}`);
    }

    hardDeletePost(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/hard-delete/${id}`);
    }

    getAllSoftDeletedPosts(page: number): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.baseUrl}/soft-deleted/?page=${page}`);
    }

    getTotalPostLength(): Observable<{ totalLength: number }> {
        return this.http.get<{ totalLength: number }>(`${this.baseUrl}/post-length`);
    }

    getTotalDeletedPostLength(): Observable<{ totalLength: number }> {
        return this.http.get<{ totalLength: number }>(`${this.baseUrl}/post-deleted-length`);
    }
}
