import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  archivo = {
    fileName: null,
    fileExtension: null,
  };
  file = null;
  urlServidor = 'http://localhost:8000/api/upload';

  constructor(private http: HttpClient) { }

  upload(data) {
console.log('servicio upload______ ', data);
return this.http.post<any>(this.urlServidor, data, {
      reportProgress: true,
      observe: 'events'
    }).pipe(map((event) => {

      switch (event.type) {

        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          console.log('valor de progress: ' + progress);

          return { status: 'progress', message: progress };

        case HttpEventType.Response:
          console.log('valor de event.body: ' + event.body);
          return event.body;

        default:
          console.log('valor de event.type: ' + event.type);
          return `Unhandled evento: ${event.type}`;
      }
    })
    );
  }
  /**
   * Controla cambios select Archivo Imagen
   *
   * @param {*} fileInput
   * @memberof AddlibroComponent
   */
  onFileChange(event) {
    console.log('onFileChange Service');
    if (event.target.files && event.target.files.length) {
      console.log('onFileChange Service if');
      this.file = event.target.files[0];
      this.archivo.fileName = this.file.name;
      this.archivo.fileExtension = this.file.name.substr(this.file.name.lastIndexOf('.') + 1);
  }
   }
}
