import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  users = [];

  constructor(
    private apiService: ApiService,
    private plt: Platform
  ) { }

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadData(true);
    });
  }

  loadData(refresh = false, refresher?) {
    this.apiService.getUsers(refresh).subscribe(res => {
      this.users = res;
      if (refresher) {
        refresher.target.complete();
      }
    });
  }

  updateUser(id) {
    this.apiService.updateUser(
      id, {
      name: 'Hector',
      job: 'Developer'
    });
  }

}
