import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrl } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  public getNotifications(){
    return this.http.get(`${apiUrl}user/notifications`);
   }

   public deleteNotification(notificationId: number){
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        notification_id: notificationId,
      },
    };
    return this.http.delete(`${apiUrl}user/delete_notification`, options);
   }

   public markAllAsRead(){
    return this.http.patch(`${apiUrl}user/mark_notifications_read`, {});
   }
}
