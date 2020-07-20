import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { from, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ConnectionStatus, NetworkService } from './network.service';
import { OfflineManagerService } from './offline-manager.service';

const API_STORAGE_KEY = 'specialkey';
const API_URL = 'https://reqres.in/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private storage: Storage,
    private offlineManager: OfflineManagerService
  ) { }

  getUsers(forceRefresh: boolean = false): Observable<any[]> {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline || !forceRefresh) {
      // Return the cached data from storage
      return from(this.getLocalData('users'));
    } else {
      // Just to get some 'random' data
      const page = Math.floor(Math.random() * Math.floor(6));

      // Return real API data and store it locally
      return this.http.get(`${API_URL}/users?per_page=2&page=${page}`)
        .pipe(
          map(res => res['data']),
          tap(res => {
            this.setLocalData('users', res);
          })
        );
    }
  }
  updateUser(user, data): Observable<any> {
    const url = `${API_URL}/users/${user}`;
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } else {
      return this.http.put(url, data)
        .pipe(
          catchError(err => {
            this.offlineManager.storeRequest(url, 'PUT', data);
            throw new Error(err);
          })
        );
    }
  }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }
  // Get catched API result
  private getLocalData(key) {
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }

}
