import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import 'sweetalert2/themes/bootstrap-5.css';

@Component({
  selector: 'app-translation-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './translation-editor.component.html',
  styleUrls: ['./translation-editor.component.scss'],
})
export class TranslationEditorComponent {
  @Input() data: Record<string, any> = {};
  @Input() level = 0;
  @Output() dataChange = new EventEmitter<Record<string, any>>();

  collapsedKeys: Record<string, boolean> = {};
  editingKey: string | null = null;
  http = inject(HttpClient);

  /** Devuelve el array con índice para usar en @for */
  getIndexedArray(key: string) {
    return (this.data[key] ?? []).map((item: any, index: any) => ({
      item,
      index,
    }));
  }

  /** Emitir cambio hacia el componente padre */
  emitChange() {
    this.dataChange.emit(this.data);
  }

  /** Toggle collapse de un objeto */
  toggleCollapse(key: string) {
    this.collapsedKeys[key] = !this.collapsedKeys[key];
  }

  /** Toggle edición de clave */
  toggleEditKey(key: string) {
    if (this.editingKey === key) {
      this.editingKey = null;
    } else {
      this.editingKey = key;
    }
  }

  /** Guardar el cambio de clave */
  onKeyEditBlur(oldKey: string, event: any) {
    const newKey = event.target.value.trim();
    if (!newKey || newKey === oldKey) return;

    this.data[newKey] = this.data[oldKey];
    delete this.data[oldKey];
    this.emitChange();
    this.editingKey = null;
  }

  /** Agregar un nuevo campo en el nivel actual */
  addKey() {
    this.addKeyToObject(this.data);
  }

  /** Agrega un nuevo campo a un objeto específico */
  addKeyToObject(obj: Record<string, any>) {
    let newKey = 'new_field';
    let counter = 1;
    while (obj[newKey]) {
      newKey = `new_field_${counter++}`;
    }
    obj[newKey] = '';
    this.emitChange();
  }

  /** Eliminar un campo de un objeto */
  removeKeyFromObject(obj: Record<string, any>, key: string) {
    Swal.fire({
      title: '¿Are you sure?',
      text: '¿You want to delete this element?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
      theme: 'bootstrap-5-light',
    }).then((result) => {
      if (result.isConfirmed && obj.hasOwnProperty(key)) {
        delete obj[key];
        this.emitChange();
      }
    });
  }

  /** Agregar un item a un array */
  addArrayItem(key: string) {
    if (!Array.isArray(this.data[key])) {
      this.data[key] = [];
    }
    this.data[key].push('');
    this.emitChange();
  }

  /** Remover un item de un array */
  removeArrayItem(key: string, index: number) {
    Swal.fire({
      title: '¿Are you sure?',
      text: '¿You want to delete this element?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
      theme: 'bootstrap-5-light',
    }).then((result) => {
      if (result.isConfirmed && Array.isArray(this.data[key])) {
        this.data[key].splice(index, 1);
        this.emitChange();
      }
    });
  }

  /** Actualizar item de un array (para objetos anidados) */
  updateArrayItem(key: string, index: number, value: any) {
    if (Array.isArray(this.data[key])) {
      this.data[key][index] = value;
      this.emitChange();
    }
  }

  /** Actualizar objeto anidado */
  updateNested(key: string, value: any) {
    this.data[key] = value;
    this.emitChange();
  }

  /** Helpers para template */
  isArray(value: any) {
    return Array.isArray(value);
  }

  isObject(value: any) {
    return value && typeof value === 'object';
  }

  objectKeys(obj: any) {
    return obj ? Object.keys(obj) : [];
  }

  async translateSingleField(
    data: Record<string, any>,
    key: string,
    targetLang: string = 'en'
  ) {
    const text = data[key];
    if (!text || typeof text !== 'string') return;

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`;
      const response = await fetch(url);
      const result = await response.json();
      const translatedText = result?.[0]?.[0]?.[0];
      if (translatedText) {
        data[key] = translatedText;
        this.emitChange();
      }
    } catch (err) {
      console.error('Error translating in browser:', err);
      Swal.fire('Error', "Couldn't translate the text.", 'error');
    }
  }
}
