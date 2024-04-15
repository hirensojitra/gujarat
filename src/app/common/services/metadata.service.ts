import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
  export class MetadataService {
    constructor(private meta: Meta, private router: Router, private route: ActivatedRoute) {}
  
    setMetadata(): void {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap(route => route.data)
      ).subscribe(data => {
        this.meta.updateTag({ name: 'description', content: (data as any).description });
        this.meta.updateTag({ property: 'og:title', content: (data as any).title });
        alert()
      });
    }
  }
  