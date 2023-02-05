import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AllGraphsComponent } from './components/all-graphs/all-graphs.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterComponent } from './components/login/register/register.component';
import { SignInComponent } from './components/login/sign-in/sign-in.component';
import { ContactComponent } from './components/footer/footer-links/contact/contact.component';
import { AboutComponent } from './components/footer/footer-links/about/about.component';
import { ResetPasswordComponent } from './components/login/reset-password/reset-password.component';
import { UserPortfoliosComponent } from './components/profile/user-portfolios/user-portfolios.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './services/auth.interceptor';
import { UserDataService } from './services/userdata.service';
import { AddStockComponent } from './components/profile/user-portfolios/user-portfolio/add-stock/add-stock.component';
import { UserProfileComponent } from './components/profile/user-profile/user-profile.component';
import { AddPortfolioComponent } from './components/profile/user-portfolios/add-portfolio/add-portfolio.component';
import { UserPortfolioComponent } from './components/profile/user-portfolios/user-portfolio/user-portfolio.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { StockdataService } from './services/stockdata.service';
import { ConceptComponent } from './components/concept/concept.component';
import { PublicPortfoliosComponent } from './components/community/public-portfolios/public-portfolios.component';
import { MainChartComponent } from './components/profile/user-portfolios/user-portfolio/main-chart/main-chart.component';
import { PortfolioSettingsComponent } from './components/profile/user-portfolios/user-portfolio/portfolio-settings/portfolio-settings.component';
import { PublicPortfoliosService } from './services/public-portfolios.service';
import { PublicPortfolioComponent } from './components/community/public-portfolios/public-portfolio/public-portfolio.component';
import { PublicMainchartComponent } from './components/community/public-portfolios/public-portfolio/public-mainchart/public-mainchart.component';
import { PublicProfileComponent } from './components/community/public-profile/public-profile.component';
import { NotificationService } from './services/notification.service';
import { RecaptchaModule } from 'ng-recaptcha';

@NgModule({
  declarations: [
    AppComponent,
    AllGraphsComponent,
    FooterComponent,
    HomeComponent,
    NavbarComponent,
    RegisterComponent,
    SignInComponent,
    ContactComponent,
    AboutComponent,
    ResetPasswordComponent,
    UserPortfoliosComponent,
    UserPortfolioComponent,
    AddStockComponent,
    UserProfileComponent,
    AddPortfolioComponent,
    ConceptComponent,
    PublicPortfoliosComponent,
    MainChartComponent,
    PortfolioSettingsComponent,
    PublicPortfolioComponent,
    PublicMainchartComponent,
    PublicProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    RecaptchaModule, 
  ],
  providers: [
    UserDataService,
    StockdataService,
    PublicPortfoliosService,
    NotificationService,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
