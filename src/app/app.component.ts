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
  jsonData: any;

  onFileLoaded(data: any) {
    this.jsonData = data;
  }

  onDataChange(updated: any) {
    this.jsonData = updated;
  }

  downloadFile() {
    const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translation-edited.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
