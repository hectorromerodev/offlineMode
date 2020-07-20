import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { from, of, Observable, forkJoin } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';

const STORAGE_REQ_KEY = 'storedreq';

interface StoredRequest {
  url: string;
  type: string;
  data: any;
  time: number;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineManagerService {

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private toastCtrl: ToastController,
  ) { }

  checkForEvents(): Observable<any> {
    return from(this.storage.get(STORAGE_REQ_KEY))
      .pipe(
        switchMap((storedOperations: string) => {
          const storedObj = JSON.parse(storedOperations);
          if (storedObj && storedObj.length > 0) {
            return this.sendRequests(storedObj)
              .pipe(
                finalize(async () => {
                  const toast = await this.toastCtrl.create({
                    message: `Local data succesfully synced to API!`,
                    duration: 3000,
                    position: 'bottom'
                  });
                  toast.present();
                  this.storage.remove(STORAGE_REQ_KEY);
                })
              );
          } else {
            console.log('No local events to sync');
            return of(false);
          }
        })

      );
  }

  async storeRequest(url, type, data) {
    const toast = await this.toastCtrl.create({
      message: `Your data is stored locally because you seem to be offline.`,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();

    const action: StoredRequest = {
      url,
      type,
      data,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[a^-z]+/g, '').substr(0, 5)
      // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    };

    return this.storage.get(STORAGE_REQ_KEY)
      .then((storedOperations) => {
        let storedObj = JSON.parse(storedOperations);
        if (storedObj) {
          storedObj.push(action);
        } else {
          storedObj = [action];
        }
        // Save old & new local transaction back to storage
        return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
      });
  }

  sendRequests(operations: StoredRequest[]) {
    const obs = [];
    for (const op of operations) {
      console.log('Make one request: ', op);
      const oneObs = this.http.request(op.type, op.url, op.data);
      obs.push(oneObs);
    }
    // Send out all local events and return once they are finished
    return forkJoin(obs);
  }
}
