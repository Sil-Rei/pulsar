import { Component, OnInit, ElementRef, HostListener } from '@angular/core';

import { AuthService } from 'src/app/services/auth-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserDataService } from 'src/app/services/userdata.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  notifications;
  intervallId;
  timer;
  isSignedIn: Boolean = false;
  constructor(private auth:AuthService, private notifyService: NotificationService){}

  ngOnInit() {
    this.isSignedIn = this.auth.isLoggedIn();
    this.auth.isSignedInEvent.subscribe(
      (isSignedIn: boolean) => {
        this.isSignedIn = isSignedIn;
        if(!this.intervallId){
          this.updateNotifications();
          this.intervallId = setInterval(() => this.updateNotifications(), 30000);
        }
      }
    );
    if(this.isSignedIn){
      this.updateNotifications();
      this.intervallId = setInterval(() => this.updateNotifications(), 30000);
    }
  }

  areMessagesUnread(){
    return Object.values(this.notifications).some(function(arr){return arr["already_read"] === false});
  }

  updateNotifications(){
    this.notifyService.getNotifications().subscribe(data => {
      this.notifications = data;
      if(Object.entries(this.notifications).length != 0){
        document.getElementById("notification-icon-empty").style.display = "none";
        document.getElementById("notification-icon").style.display = "inline";
        // if atleast one is unread display red dot
        if(this.areMessagesUnread()){
          document.getElementById("dot").style.display = "inline";
        }
      }
    })
  }

  deleteNotification(notification){
    let notification_id = notification["id"];
    this.notifyService.deleteNotification(notification_id).subscribe(()=>this.updateNotifications());
  }

  logout(){
    if(this.intervallId){
      clearInterval(this.intervallId);
    }
    this.auth.logout();
  }

  // toggles the hamburger menu for mobile
  toggleMenu(){
    document.getElementsByClassName("navbar-links")[0].classList.toggle("active");
  }

  markAllAsRead(){
    if(this.areMessagesUnread){
      this.notifyService.markAllAsRead().subscribe(()=>document.getElementById("dot").style.display = "none");
      
    }

  }

  toggleNotifybar(){
    let dropdown = document.getElementById("notification-dropdown");
    dropdown.style.display = (dropdown.style.display == "block") ? "none": "block";
    if (dropdown.style.display === 'block' && this.areMessagesUnread()) {
      this.timer = setTimeout(() => this.notifyService.markAllAsRead().subscribe(()=>document.getElementById("dot").style.display = "none"), 4000);
    } else {
      clearTimeout(this.timer);
    }
  }

}
