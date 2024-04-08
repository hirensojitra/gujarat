import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from '../interfaces/post';
import { PostDetails } from '../interfaces/image-element';

@Injectable({
    providedIn: 'root',
})
export class PostDetailService {
    private baseUrl = environment.MasterApi + '/post-detail';
    constructor(private http: HttpClient) {

    }
    getAllPosts(page: number): Observable<PostDetails[]> {
        return this.http.get<PostDetails[]>(`${this.baseUrl}?page=${page}`);
    }

    addPost(newPostData: PostDetails): Observable<PostDetails> {
        console.log(newPostData)
        return this.http.post<PostDetails>(`${this.baseUrl}`, newPostData).pipe(
            map(response => {
                console.log(response)
                const newPostId = response.id;
                newPostData.id = newPostId;
                return newPostData;
            })
        );
    }

    getPostById(id: string): Observable<PostDetails> {
        console.log(`${this.baseUrl}/get/${id}`)
        return this.http.get<PostDetails>(`${this.baseUrl}/get/${id}`);
    }

    updatePost(newData: PostDetails): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/update/`, newData);
    }

    softDeletePost(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/soft-delete/${id}`);
    }

    hardDeletePost(id: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/hard-delete/${id}`);
    }

    getAllSoftDeletedPosts(page: number): Observable<PostDetails[]> {
        return this.http.get<PostDetails[]>(`${this.baseUrl}/soft-deleted/?page=${page}`);
    }

    getTotalPostLength(): Observable<{ totalLength: number }> {
        return this.http.get<{ totalLength: number }>(`${this.baseUrl}/post-length`);
    }

    getTotalDeletedPostLength(): Observable<{ totalLength: number }> {
        return this.http.get<{ totalLength: number }>(`${this.baseUrl}/post-deleted-length`);
    }
}
