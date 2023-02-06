import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllGraphsComponent } from './components/all-graphs/all-graphs.component';
import { PublicMainchartComponent } from './components/community/public-portfolios/public-portfolio/public-mainchart/public-mainchart.component';
import { PublicPortfolioComponent } from './components/community/public-portfolios/public-portfolio/public-portfolio.component';
import { PublicPortfoliosComponent } from './components/community/public-portfolios/public-portfolios.component';
import { PublicProfileComponent } from './components/community/public-profile/public-profile.component';
import { ConceptComponent } from './components/concept/concept.component';
import { AboutComponent } from './components/footer/footer-links/about/about.component';
import { ContactComponent } from './components/footer/footer-links/contact/contact.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/login/register/register.component';
import { EnterNewPasswordComponent } from './components/login/reset-password/enter-new-password/enter-new-password.component';
import { ResetPasswordComponent } from './components/login/reset-password/reset-password.component';
import { SignInComponent } from './components/login/sign-in/sign-in.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AddPortfolioComponent } from './components/profile/user-portfolios/add-portfolio/add-portfolio.component';
import { AddStockComponent } from './components/profile/user-portfolios/user-portfolio/add-stock/add-stock.component';
import { MainChartComponent } from './components/profile/user-portfolios/user-portfolio/main-chart/main-chart.component';
import { PortfolioSettingsComponent } from './components/profile/user-portfolios/user-portfolio/portfolio-settings/portfolio-settings.component';
import { UserPortfolioComponent } from './components/profile/user-portfolios/user-portfolio/user-portfolio.component';
import { UserPortfoliosComponent } from './components/profile/user-portfolios/user-portfolios.component';
import { UserProfileComponent } from './components/profile/user-profile/user-profile.component';

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "graphs" , component: AllGraphsComponent},
  {path: "register", component: RegisterComponent},
  {path: "sign-in", component: SignInComponent},
  {path: "reset-password", component: ResetPasswordComponent},
  {path: "contact", component: ContactComponent},
  {path: "about", component: AboutComponent},
  {path: "profile/portfolios", component:UserPortfoliosComponent},
  {path: "navbar", component: NavbarComponent},
  {path: "profile", component: UserProfileComponent},
  {path: "profile/portfolios/add-portfolio", component:AddPortfolioComponent},
  {path: "profile/portfolios/:name", component:UserPortfolioComponent},
  {path: "profile/portfolios/:name/main-chart", component: MainChartComponent},
  {path: "profile/portfolios/:name/add-stock", component:AddStockComponent},
  {path: "profile/portfolios/:name/settings", component: PortfolioSettingsComponent},
  {path: "concept", component: ConceptComponent},
  {path: "community/featured-portfolios", component: PublicPortfoliosComponent},
  {path: "community/featured-portfolios/:username/:id", component: PublicPortfolioComponent},
  {path: "community/featured-portfolios/:username/:id/main-chart", component: PublicMainchartComponent},
  {path: "community/profile/:userid", component: PublicProfileComponent},
  {path: "user/reset-password", component: EnterNewPasswordComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
