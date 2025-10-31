import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationEditorComponent } from './translation-editor/translation-editor.component';
import { FileLoaderComponent } from './file-loader/file-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslationEditorComponent, FileLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  mainJsonData: any = null;
  translationJsonData: any = null;

  // --- CARGA DE ARCHIVOS ---
  onMainFileLoaded(data: any) {
    this.mainJsonData = this.sortNestedKeys(data);
    this.trySyncJsons();
  }

  onTranslationFileLoaded(data: any) {
    this.translationJsonData = this.sortNestedKeys(data);
    this.trySyncJsons();
  }

  // --- CAMBIOS DESDE LOS EDITORES ---
  onMainDataChange(updated: any) {
    this.mainJsonData = this.sortNestedKeys(updated);
  }

  onTranslationDataChange(updated: any) {
    this.translationJsonData = this.sortNestedKeys(updated);
  }

  // --- DESCARGAS ---
  downloadMainFile() {
    this.downloadFile(this.mainJsonData, 'main-edited.json');
  }

  downloadTranslationFile() {
    this.downloadFile(this.translationJsonData, 'translation-edited.json');
  }

  private downloadFile(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- 🔄 SINCRONIZACIÓN PROFUNDA + ORDENAMIENTO ---
  private trySyncJsons() {
    if (this.mainJsonData && this.translationJsonData) {
      // 1️⃣ Ordena ambos
      this.mainJsonData = this.sortNestedKeys(this.mainJsonData);
      this.translationJsonData = this.sortNestedKeys(this.translationJsonData);

      // 2️⃣ Sincroniza: agrega faltantes y elimina sobrantes
      this.translationJsonData = this.syncKeysDeep(
        this.mainJsonData,
        this.translationJsonData
      );

      // 3️⃣ Reordena después del merge
      this.translationJsonData = this.sortNestedKeys(this.translationJsonData);
    }
  }

  // --- 🔍 Sincroniza claves (agrega faltantes y elimina sobrantes) ---
  private syncKeysDeep(main: any, translation: any): any {
    if (typeof main !== 'object' || main === null) {
      return translation ?? '';
    }

    if (typeof translation !== 'object' || translation === null) {
      translation = Array.isArray(main) ? [] : {};
    }

    const result: any = Array.isArray(main) ? [] : {};

    for (const key of Object.keys(main)) {
      const mainValue = main[key];
      const translationValue = translation[key];

      if (typeof mainValue === 'object' && mainValue !== null) {
        result[key] = this.syncKeysDeep(mainValue, translationValue);
      } else {
        // Si no existe la clave en translation, la crea vacía
        result[key] = key in translation ? translationValue : '';
      }
    }

    return result;
  }

  // --- 🔤 Ordena claves de hijos (sin tocar el nivel raíz) ---
  private sortNestedKeys(obj: any, isRoot = true): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortNestedKeys(item, false));
    }

    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const keys = Object.keys(obj);
    const orderedKeys = isRoot ? keys : keys.sort((a, b) => a.localeCompare(b));

    const sortedObj: any = {};
    for (const key of orderedKeys) {
      sortedObj[key] = this.sortNestedKeys(obj[key], false);
    }

    return sortedObj;
  }
}
