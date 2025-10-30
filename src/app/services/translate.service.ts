import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslateService {
  constructor() {
    // this.client = new TranslateClient({
    //   region: 'us-east-1', // Cambia según tu región AWS
    //   credentials: {
    //     accessKeyId: 'TU_ACCESS_KEY',
    //     secretAccessKey: 'TU_SECRET_KEY',
    //   },
    // });
  }

  // async translate(
  //   text: string,
  //   sourceLang: string,
  //   targetLang: string
  // ): Promise<string> {
  //   if (!text) return text;

  //   const command = new TranslateTextCommand({
  //     Text: text,
  //     SourceLanguageCode: sourceLang,
  //     TargetLanguageCode: targetLang,
  //   });

  //   try {
  //     const response = await this.client.send(command);
  //     return response.TranslatedText || text;
  //   } catch (error) {
  //     console.error('❌ Error al traducir con Amazon Translate:', error);
  //     return text;
  //   }
  // }

  private apiUrl = 'https://translate.api.moz.com/translate'; // Ejemplo: reemplaza con la URL real
  private http = inject(HttpClient);

  translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      q: text,
      source: sourceLang,
      target: targetLang,
    });
  }
}
