import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class OpenGraphService {

  constructor(private meta: Meta) { }

  setMetadata(title: string, description: string, url: string, imageUrl: string) {
    // Clear existing Open Graph meta tags
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:type"');

    // Set new Open Graph meta tags
    this.meta.addTag({ property: 'og:title', content: title });
    this.meta.addTag({ property: 'og:type', content: "website" });
    this.meta.addTag({ name: 'description', content: description });
    this.meta.addTag({ property: 'og:url', content: url });
    this.meta.addTag({ property: 'og:description', content: description });
    this.meta.addTag({ property: 'og:image', content: imageUrl });
  }
}
